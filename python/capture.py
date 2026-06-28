import argparse
import ctypes
import struct
import sys
import threading
import time
import zlib
from pathlib import Path

# 고해상도(예: 4K) 화면에서 캡처가 잘리거나 축소되는 현상을 방지하기 위해 DPI Awareness 설정
try:
    ctypes.windll.shcore.SetProcessDpiAwareness(2)  # PROCESS_PER_MONITOR_DPI_AWARE
except Exception:
    try:
        ctypes.windll.user32.SetProcessDPIAware()
    except Exception:
        pass

user32 = ctypes.windll.user32
kernel32 = ctypes.windll.kernel32
gdi32 = ctypes.windll.gdi32

PROCESS_QUERY_LIMITED_INFORMATION = 0x1000
MAX_PATH = 260
SM_XVIRTUALSCREEN = 76
SM_YVIRTUALSCREEN = 77
SM_CXVIRTUALSCREEN = 78
SM_CYVIRTUALSCREEN = 79
SRCCOPY = 0x00CC0020
CAPTUREBLT = 0x40000000


class RECT(ctypes.Structure):
    _fields_ = [
        ("left", ctypes.c_long),
        ("top", ctypes.c_long),
        ("right", ctypes.c_long),
        ("bottom", ctypes.c_long),
    ]


def get_monitors() -> list[dict]:
    """연결된 모든 모니터의 정보를 가져옵니다."""
    monitors = []

    @ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p, ctypes.POINTER(RECT), ctypes.c_void_p)
    def enum_proc(hmonitor, hdc_monitor, rect_ptr, lparam):
        r = rect_ptr.contents
        is_primary = (r.left == 0 and r.top == 0 and (r.right - r.left) > 0)
        monitors.append({
            "hmonitor": hmonitor,
            "left": r.left,
            "top": r.top,
            "right": r.right,
            "bottom": r.bottom,
            "width": r.right - r.left,
            "height": r.bottom - r.top,
            "is_primary": is_primary
        })
        return True

    user32.EnumDisplayMonitors(None, None, enum_proc, 0)
    return monitors


def get_window_rect(hwnd: int) -> tuple[int, int, int, int]:
    rect = RECT()
    if user32.GetWindowRect(hwnd, ctypes.byref(rect)) == 0:
        raise RuntimeError("윈도우 크기를 가져오지 못했습니다.")
    return rect.left, rect.top, rect.right, rect.bottom


def capture_screen_raw(left: int, top: int, width: int, height: int) -> bytes:
    """윈도우 API를 사용하여 특정 영역의 화면을 고속으로 캡처하고 BGRA 바이트 데이터를 반환합니다."""
    if width <= 0 or height <= 0:
        raise RuntimeError("캡처하려는 영역의 크기가 유효하지 않습니다.")

    hwnd = user32.GetDesktopWindow()
    hdesktop = user32.GetWindowDC(hwnd)
    if not hdesktop:
        raise RuntimeError("데스크톱 DC를 가져오지 못했습니다.")
    hmemdc = gdi32.CreateCompatibleDC(hdesktop)
    if not hmemdc:
        user32.ReleaseDC(hwnd, hdesktop)
        raise RuntimeError("호환 DC를 생성하지 못했습니다.")

    bmp = gdi32.CreateCompatibleBitmap(hdesktop, width, height)
    if not bmp:
        gdi32.DeleteDC(hmemdc)
        user32.ReleaseDC(hwnd, hdesktop)
        raise RuntimeError("호환 비트맵을 생성하지 못했습니다.")

    old_obj = gdi32.SelectObject(hmemdc, bmp)
    try:
        if gdi32.BitBlt(hmemdc, 0, 0, width, height, hdesktop, left, top, SRCCOPY | CAPTUREBLT) == 0:
            raise RuntimeError("BitBlt 캡처에 실패했습니다.")

        class BITMAPINFOHEADER(ctypes.Structure):
            _fields_ = [
                ("biSize", ctypes.c_uint),
                ("biWidth", ctypes.c_long),
                ("biHeight", ctypes.c_long),
                ("biPlanes", ctypes.c_ushort),
                ("biBitCount", ctypes.c_ushort),
                ("biCompression", ctypes.c_uint),
                ("biSizeImage", ctypes.c_uint),
                ("biXPelsPerMeter", ctypes.c_long),
                ("biYPelsPerMeter", ctypes.c_long),
                ("biClrUsed", ctypes.c_uint),
                ("biClrImportant", ctypes.c_uint),
            ]

        class BITMAPINFO(ctypes.Structure):
            _fields_ = [
                ("bmiHeader", BITMAPINFOHEADER),
                ("bmiColors", ctypes.c_uint * 3),
            ]

        bmi = BITMAPINFO()
        bmi.bmiHeader.biSize = ctypes.sizeof(BITMAPINFOHEADER)
        bmi.bmiHeader.biWidth = width
        bmi.bmiHeader.biHeight = -height  # 탑다운 비트맵(DIB)을 만들기 위해 음수 설정
        bmi.bmiHeader.biPlanes = 1
        bmi.bmiHeader.biBitCount = 32
        bmi.bmiHeader.biCompression = 0

        buffer_size = width * height * 4
        buffer = (ctypes.c_ubyte * buffer_size)()
        if gdi32.GetDIBits(hmemdc, bmp, 0, height, buffer, ctypes.byref(bmi), 0) == 0:
            raise RuntimeError("GetDIBits 호출에 실패했습니다.")
        return bytes(buffer)
    finally:
        gdi32.SelectObject(hmemdc, old_obj)
        gdi32.DeleteObject(bmp)
        gdi32.DeleteDC(hmemdc)
        user32.ReleaseDC(hwnd, hdesktop)


def _is_solid_color(bgra: bytes) -> bool:
    """이미지가 단일 색상(예: 로딩 중 검은 화면 등)으로만 채워져 있는지 검사합니다."""
    if not bgra:
        return True
    first_pixel = bgra[:4]
    return bgra == first_pixel * (len(bgra) // 4)


def _write_png_data(bgra: bytes, width: int, height: int) -> bytes:
    """BGRA 바이트 데이터를 빠른 연산을 통해 고속 PNG 바이트 데이터로 인코딩합니다."""
    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    # 1. B와 R 채널 스왑 (BGRA -> RGBA)
    rgba_pixels = bytearray(bgra)
    rgba_pixels[0::4], rgba_pixels[2::4] = rgba_pixels[2::4], rgba_pixels[0::4]
    
    # 2. PNG 필터링 바이트(0)를 각 로우 앞에 삽입
    row_len = width * 4
    filtered = bytearray()
    for y in range(height):
        filtered.append(0)
        filtered.extend(rgba_pixels[y * row_len : (y + 1) * row_len])

    raw = zlib.compress(bytes(filtered), level=6)  # 레벨 6으로 설정하여 압축률과 속도 균형 최적화
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", raw) + chunk(b"IEND", b"")


def _write_png(path: Path, bgra: bytes, width: int, height: int) -> None:
    data = _write_png_data(bgra, width, height)
    path.write_bytes(data)


def capture_monitor_instant(output_dir: Path, prefix: str, index: int, monitor_idx: int) -> Path:
    """지정된 모니터를 즉시 캡처하여 저장합니다."""
    monitors = get_monitors()
    if not monitors or monitor_idx >= len(monitors):
        raise RuntimeError("선택한 모니터를 찾을 수 없습니다.")

    monitor = monitors[monitor_idx]
    left, top, width, height = monitor["left"], monitor["top"], monitor["width"], monitor["height"]
    
    output_path = output_dir / f"{prefix}_{index:04d}.png"
    bgra_data = capture_screen_raw(left, top, width, height)
    _write_png(output_path, bgra_data, width, height)
    return output_path


def capture_monitor_with_detection(
    output_dir: Path,
    prefix: str,
    index: int,
    min_size: int = 100 * 1024,
    monitor_idx: int = 0,
) -> Path | None:
    """
    모니터를 감시하면서 화면 변화가 감지되고,
    파일 용량이 기준값(min_size) 이상일 때 한 장의 유효한 화면을 자동으로 캡처합니다.
    """
    monitors = get_monitors()
    if not monitors or monitor_idx >= len(monitors):
        raise RuntimeError("선택한 모니터를 찾을 수 없습니다.")
        
    monitor = monitors[monitor_idx]
    left, top, width, height = monitor["left"], monitor["top"], monitor["width"], monitor["height"]
    output_path = output_dir / f"{prefix}_{index:04d}.png"
    
    stop_event = threading.Event()
    result_holder = {}
    lock = threading.Lock()
    threads = []
    
    def worker(thread_idx: int):
        time.sleep(thread_idx * 0.01)
        last_bgra_data = None
        
        while not stop_event.is_set():
            try:
                bgra_data = capture_screen_raw(left, top, width, height)
                
                # 중복 프레임 검사: 화면 변화가 없는 경우 스킵
                if bgra_data == last_bgra_data:
                    time.sleep(0.1)
                    continue
                last_bgra_data = bgra_data
                
                # 1. 단색 화면 제외
                if not _is_solid_color(bgra_data):
                    # 2. PNG 바이너리 생성 및 크기 검사
                    png_bytes = _write_png_data(bgra_data, width, height)
                    file_size = len(png_bytes)
                    
                    with lock:
                        result_holder["max_size"] = max(result_holder.get("max_size", 0), file_size)
                    
                    if file_size >= min_size:
                        with lock:
                            if not stop_event.is_set():
                                stop_event.set()
                                try:
                                    output_path.write_bytes(png_bytes)
                                    result_holder["path"] = output_path
                                except Exception as e:
                                    result_holder["error"] = e
                                return
            except Exception:
                pass
                
            time.sleep(0.1)

    # 8개의 병렬 스레드로 화면 변경 감지 감시
    for i in range(8):
        t = threading.Thread(target=worker, args=(i,), daemon=True)
        threads.append(t)
        t.start()

    # 메인 스레드 대기 (최대 60초)
    timeout = 60.0
    start_time = time.monotonic()
    while not stop_event.is_set():
        if time.monotonic() - start_time > timeout:
            stop_event.set()
            break
        time.sleep(0.05)

    for t in threads:
        t.join(timeout=1.0)

    if "path" in result_holder:
        return result_holder["path"]
    if "error" in result_holder:
        raise result_holder["error"]

    max_size_seen = result_holder.get("max_size", 0)
    raise RuntimeError(
        f"조건에 만족하는 이미지를 캡처하지 못했습니다.\n"
        f"(기준 크기: {min_size/1024:.1f}KB, 감지된 최대 파일 크기: {max_size_seen/1024:.1f}KB)"
    )


def run_gui(output_dir: Path, prefix: str, min_size: int, default_monitor_idx: int) -> int:
    import tkinter as tk
    from tkinter import messagebox, filedialog
    from tkinter import ttk

    root = tk.Tk()
    root.title("멀티모니터 화면 캡처 프로그램")
    root.geometry("480x500")
    root.resizable(False, False)
    root.attributes("-topmost", True)
    
    # 테마 및 폰트 설정
    style = ttk.Style()
    style.theme_use("vista" if "vista" in style.theme_names() else "clam")
    
    font_main = ("Segoe UI", 9)
    font_bold = ("Segoe UI", 9, "bold")
    font_title = ("Segoe UI", 13, "bold")

    # 변수 바인딩
    var_output_dir = tk.StringVar(value=str(output_dir.absolute()))
    var_prefix = tk.StringVar(value=prefix)
    var_index = tk.IntVar(value=1)
    var_min_size = tk.DoubleVar(value=min_size / 1024.0)  # KB 단위
    var_interval = tk.DoubleVar(value=1.0)  # 초 단위 (주기적 캡처용)
    var_mode = tk.StringVar(value="instant")  # instant / periodic / detect
    
    # 모니터 목록 가져오기
    monitors = get_monitors()
    monitor_options = []
    for idx, m in enumerate(monitors):
        primary_text = " (주 모니터)" if m["is_primary"] else ""
        monitor_options.append(f"모니터 {idx + 1}: {m['width']}x{m['height']}{primary_text}")
    
    if not monitor_options:
        monitor_options = ["기본 모니터"]
        
    default_sel_idx = default_monitor_idx if default_monitor_idx < len(monitor_options) else 0
    var_selected_monitor = tk.StringVar(value=monitor_options[default_sel_idx])

    # 실행 상태 제어 변수들
    running_event = threading.Event()
    busy = {"value": False}

    def choose_directory():
        selected = filedialog.askdirectory(initialdir=var_output_dir.get(), title="저장할 폴더를 선택하세요")
        if selected:
            var_output_dir.set(str(Path(selected).absolute()))

    def update_ui_states():
        mode = var_mode.get()
        if mode == "instant":
            entry_min_size.config(state="disabled")
            entry_interval.config(state="disabled")
        elif mode == "periodic":
            entry_min_size.config(state="disabled")
            entry_interval.config(state="normal")
        elif mode == "detect":
            entry_min_size.config(state="normal")
            entry_interval.config(state="disabled")

    # 캡처 스레드 함수
    def capture_worker():
        nonlocal running_event
        
        mode = var_mode.get()
        out_path = Path(var_output_dir.get())
        out_path.mkdir(parents=True, exist_ok=True)
        pref = var_prefix.get()
        
        try:
            sel_str = var_selected_monitor.get()
            if sel_str.startswith("모니터 "):
                m_idx = int(sel_str.split(":")[0].split(" ")[1]) - 1
            else:
                m_idx = 0
        except Exception:
            m_idx = 0

        # 즉시 캡처 실행
        if mode == "instant":
            try:
                idx = var_index.get()
                saved_file = capture_monitor_instant(out_path, pref, idx, m_idx)
                var_index.set(idx + 1)
                status_var.set(f"저장 성공: {saved_file.name}")
            except Exception as e:
                messagebox.showerror("오류", f"캡처 실패: {str(e)}")
            finally:
                root.deiconify()
                busy["value"] = False
                btn_start.config(text="캡처 실행", state="normal")
                
        # 주기적 캡처 실행
        elif mode == "periodic":
            interval = var_interval.get()
            status_var.set("주기적 캡처 중... (정지 버튼 클릭 시 종료)")
            while running_event.is_set():
                try:
                    idx = var_index.get()
                    saved_file = capture_monitor_instant(out_path, pref, idx, m_idx)
                    var_index.set(idx + 1)
                    status_var.set(f"저장 성공: {saved_file.name}")
                except Exception as e:
                    status_var.set(f"오류: {str(e)}")
                    break
                time.sleep(interval)
            
            root.deiconify()
            busy["value"] = False
            btn_start.config(text="캡처 실행", state="normal")
            status_var.set("주기적 캡처가 종료되었습니다.")
            
        # 화면 변화 감지 캡처 실행
        elif mode == "detect":
            try:
                idx = var_index.get()
                limit_size = int(var_min_size.get() * 1024)
                status_var.set("화면 감시 및 유효 이미지 대기 중...")
                saved_file = capture_monitor_with_detection(
                    out_path, pref, idx, min_size=limit_size, monitor_idx=m_idx
                )
                if saved_file:
                    var_index.set(idx + 1)
                    status_var.set(f"감지 및 저장 완료: {saved_file.name}")
                else:
                    status_var.set("저장에 실패했습니다.")
            except Exception as e:
                messagebox.showerror("오류", f"감지 실패: {str(e)}")
                status_var.set("대기 중")
            finally:
                root.deiconify()
                busy["value"] = False
                btn_start.config(text="캡처 실행", state="normal")

    def toggle_capture():
        if busy["value"]:
            # 주기적 캡처 중지
            if var_mode.get() == "periodic":
                running_event.clear()
                status_var.set("정지 요청 중...")
            return

        mode = var_mode.get()
        busy["value"] = True
        
        if mode == "periodic":
            running_event.set()
            btn_start.config(text="캡처 정지")
        else:
            btn_start.config(text="작업 중...", state="disabled")
            
        # 캡처 전 GUI 잠시 숨기기 (즉시 캡처 시 창이 찍히지 않도록)
        if mode == "instant":
            root.withdraw()
            root.after(200, lambda: threading.Thread(target=capture_worker, daemon=True).start())
        else:
            threading.Thread(target=capture_worker, daemon=True).start()

    # GUI 레이아웃 배치
    main_frame = ttk.Frame(root, padding="15 15 15 15")
    main_frame.pack(fill="both", expand=True)

    # 타이틀
    lbl_title = ttk.Label(main_frame, text="멀티모니터 화면 캡처 도구", font=font_title, anchor="center")
    lbl_title.pack(fill="x", pady=(0, 15))

    # 기본 설정 그룹
    group_basic = ttk.LabelFrame(main_frame, text=" 기본 설정 ", padding="10 10 10 10")
    group_basic.pack(fill="x", pady=(0, 10))

    # 모니터 선택
    ttk.Label(group_basic, text="캡처 모니터:", font=font_bold).grid(row=0, column=0, sticky="w", pady=4)
    menu_monitor = ttk.OptionMenu(group_basic, var_selected_monitor, var_selected_monitor.get(), *monitor_options)
    menu_monitor.grid(row=0, column=1, columnspan=2, sticky="ew", pady=4)

    # 저장 경로
    ttk.Label(group_basic, text="저장 폴더:", font=font_bold).grid(row=1, column=0, sticky="w", pady=4)
    entry_dir = ttk.Entry(group_basic, textvariable=var_output_dir)
    entry_dir.grid(row=1, column=1, sticky="ew", pady=4)
    btn_browse = ttk.Button(group_basic, text="찾아보기", command=choose_directory, width=10)
    btn_browse.grid(row=1, column=2, sticky="e", pady=4, padx=(5, 0))

    # 파일명 접두사 및 인덱스
    ttk.Label(group_basic, text="접두사(Prefix):", font=font_bold).grid(row=2, column=0, sticky="w", pady=4)
    entry_prefix = ttk.Entry(group_basic, textvariable=var_prefix)
    entry_prefix.grid(row=2, column=1, columnspan=2, sticky="ew", pady=4)

    ttk.Label(group_basic, text="시작 번호:", font=font_bold).grid(row=3, column=0, sticky="w", pady=4)
    entry_index = ttk.Entry(group_basic, textvariable=var_index)
    entry_index.grid(row=3, column=1, columnspan=2, sticky="ew", pady=4)

    # 캡처 모드 그룹
    group_mode = ttk.LabelFrame(main_frame, text=" 캡처 모드 및 상세 설정 ", padding="10 10 10 10")
    group_mode.pack(fill="both", expand=True, pady=(0, 15))

    rad_instant = ttk.Radiobutton(group_mode, text="즉시 캡처 (현재 화면 즉시 저장)", variable=var_mode, value="instant", command=update_ui_states)
    rad_instant.pack(anchor="w", pady=2)

    rad_periodic = ttk.Radiobutton(group_mode, text="주기적 캡처 (정해진 주기마다 연속 저장)", variable=var_mode, value="periodic", command=update_ui_states)
    rad_periodic.pack(anchor="w", pady=2)
    
    frame_interval = ttk.Frame(group_mode, padding="15 0 0 0")
    frame_interval.pack(anchor="w", pady=(0, 5))
    ttk.Label(frame_interval, text="캡처 간격 (초):").pack(side="left")
    entry_interval = ttk.Entry(frame_interval, textvariable=var_interval, width=8)
    entry_interval.pack(side="left", padx=5)

    rad_detect = ttk.Radiobutton(group_mode, text="화면 변화 감시 캡처 (화면이 바뀔 때 자동 저장)", variable=var_mode, value="detect", command=update_ui_states)
    rad_detect.pack(anchor="w", pady=2)

    frame_size = ttk.Frame(group_mode, padding="15 0 0 0")
    frame_size.pack(anchor="w", pady=(0, 5))
    ttk.Label(frame_size, text="최소 파일 크기 (KB):").pack(side="left")
    entry_min_size = ttk.Entry(frame_size, textvariable=var_min_size, width=8)
    entry_min_size.pack(side="left", padx=5)

    # 초기 UI 갱신
    group_basic.columnconfigure(1, weight=1)
    update_ui_states()

    # 하부 조작 영역
    status_var = tk.StringVar(value="대기 중")
    lbl_status = ttk.Label(main_frame, textvariable=status_var, font=font_main, foreground="gray", anchor="center")
    lbl_status.pack(fill="x", pady=(5, 5))

    btn_start = ttk.Button(main_frame, text="캡처 실행", command=toggle_capture)
    btn_start.pack(fill="x", ipady=6)

    root.mainloop()
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="멀티모니터 화면 캡처 유틸리티")
    parser.add_argument("--out", default="captures", help="저장할 출력 디렉토리 경로")
    parser.add_argument("--prefix", default="capture", help="저장할 파일명의 접두사")
    parser.add_argument("--gui", action="store_true", help="GUI 그래픽 실행 창 띄우기")
    parser.add_argument(
        "--min-size",
        type=float,
        default=100.0,
        help="유효한 화면 감지용 최소 파일 용량(KB) (기본값: 100.0)",
    )
    parser.add_argument(
        "--monitor",
        type=int,
        default=0,
        help="캡처할 모니터 인덱스 (0부터 시작, 기본값: 0)",
    )
    args = parser.parse_args()

    output_dir = Path(args.out)
    min_size_bytes = int(args.min_size * 1024)
    monitor_idx = args.monitor

    if args.gui:
        return run_gui(output_dir, args.prefix, min_size_bytes, monitor_idx)

    output_dir.mkdir(parents=True, exist_ok=True)
    # CLI 단일 실행 시 지정 모니터를 즉시 캡처하여 저장
    try:
        saved_file = capture_monitor_instant(output_dir, args.prefix, 1, monitor_idx)
        print(f"저장 성공: {saved_file}")
        return 0
    except Exception as e:
        print(f"에러 발생: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
