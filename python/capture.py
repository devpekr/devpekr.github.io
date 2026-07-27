import argparse
import ctypes
import struct
import zlib
import time
import os
import sys
import threading
import tkinter as tk
from tkinter import messagebox
from pathlib import Path
from ctypes import wintypes

# DPI 인식 설정 (고해상도/배율 적용 모니터에서 캡처 범위 어긋남 방지)
try:
    ctypes.windll.shcore.SetProcessDpiAwareness(2)  # PROCESS_PER_MONITOR_DPI_AWARE
except Exception:
    try:
        ctypes.windll.user32.SetProcessDPIAware()
    except Exception:
        pass

user32 = ctypes.windll.user32
gdi32 = ctypes.windll.gdi32

# Win32 상수 및 구조체 정의
SRCCOPY = 0x00CC0020
CAPTUREBLT = 0x40000000
WM_HOTKEY = 0x0312
MOD_CONTROL = 0x0002
MOD_SHIFT = 0x0004
VK_P = 0x50
HOTKEY_ID_CAPTURE = 1

class RECT(ctypes.Structure):
    _fields_ = [
        ("left", ctypes.c_long),
        ("top", ctypes.c_long),
        ("right", ctypes.c_long),
        ("bottom", ctypes.c_long),
    ]

def get_monitors() -> list[dict]:
    """연결된 모든 모니터의 정보(해상도 및 가상 화면 좌표)를 가져옵니다."""
    monitors = []

    @ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p, ctypes.POINTER(RECT), ctypes.c_void_p)
    def enum_proc(hmonitor, hdc_monitor, rect_ptr, lparam):
        r = rect_ptr.contents
        # 주 모니터 판별 기준 (left=0, top=0)
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

def capture_screen_raw(left: int, top: int, width: int, height: int) -> bytes:
    """지정한 좌표와 크기의 화면 영역을 BGRA 바이트 데이터로 캡처합니다."""
    if width <= 0 or height <= 0:
        raise RuntimeError("캡처 크기가 잘못되었습니다.")

    hwnd = user32.GetDesktopWindow()
    hdesktop = user32.GetWindowDC(hwnd)
    if not hdesktop:
        raise RuntimeError("데스크톱 디바이스 컨텍스트(DC)를 가져오지 못했습니다.")
    hmemdc = gdi32.CreateCompatibleDC(hdesktop)
    if not hmemdc:
        user32.ReleaseDC(hwnd, hdesktop)
        raise RuntimeError("호환 메모리 DC를 생성하지 못했습니다.")

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
        bmi.bmiHeader.biHeight = -height
        bmi.bmiHeader.biPlanes = 1
        bmi.bmiHeader.biBitCount = 32
        bmi.bmiHeader.biCompression = 0

        buffer_size = width * height * 4
        buffer = (ctypes.c_ubyte * buffer_size)()
        if gdi32.GetDIBits(hmemdc, bmp, 0, height, buffer, ctypes.byref(bmi), 0) == 0:
            raise RuntimeError("GetDIBits 디바이스 독립 비트맵 복사에 실패했습니다.")
        return bytes(buffer)
    finally:
        gdi32.SelectObject(hmemdc, old_obj)
        gdi32.DeleteObject(bmp)
        gdi32.DeleteDC(hmemdc)
        user32.ReleaseDC(hwnd, hdesktop)

def _write_png_data(bgra: bytes, width: int, height: int, compression_level: int = 6) -> bytes:
    """BGRA 바이트 데이터를 인메모리 PNG 파일 포맷 바이트로 변환합니다."""
    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    # 1. BGRA -> RGBA 채널 전환
    rgba_pixels = bytearray(bgra)
    rgba_pixels[0::4], rgba_pixels[2::4] = rgba_pixels[2::4], rgba_pixels[0::4]
    
    # 2. 각 행 앞에 PNG 필터 타입 (0: None) 추가
    row_len = width * 4
    filtered = bytearray()
    for y in range(height):
        filtered.append(0)
        filtered.extend(rgba_pixels[y * row_len : (y + 1) * row_len])

    raw = zlib.compress(bytes(filtered), level=compression_level)
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", raw) + chunk(b"IEND", b"")

def _write_png(path: Path, bgra: bytes, width: int, height: int) -> None:
    """BGRA 바이트 데이터를 PNG 파일로 디스크에 저장합니다."""
    data = _write_png_data(bgra, width, height, compression_level=6)
    path.write_bytes(data)

def get_next_index(output_dir: Path, prefix: str) -> int:
    """중복되지 않는 다음 파일 번호를 가져옵니다."""
    if not output_dir.exists():
        return 1
    
    import re
    numbers = []
    
    for f in output_dir.glob("*.png"):
        if not f.is_file():
            continue
        if f.name.startswith(f"{prefix}_"):
            match = re.search(r'(\d+)(?:\D*)$', f.stem)
            if match:
                numbers.append(int(match.group(1)))
                
    if numbers:
        return max(numbers) + 1
    return 1


class ModernButton(tk.Button):
    """세련된 마우스 호버 효과가 적용된 플랫 스타일 커스텀 버튼입니다."""
    def __init__(self, master, bg_color, active_bg, fg_color, *args, **kwargs):
        super().__init__(
            master,
            relief="flat",
            bd=0,
            bg=bg_color,
            fg=fg_color,
            activebackground=active_bg,
            activeforeground=fg_color,
            font=("Segoe UI", 10, "bold"),
            cursor="hand2",
            padx=10,
            pady=8,
            *args,
            **kwargs
        )
        self.bg_color = bg_color
        self.active_bg = active_bg
        self.bind("<Enter>", lambda e: self.config(bg=active_bg))
        self.bind("<Leave>", lambda e: self.config(bg=bg_color))


class CaptureApp:
    """메인 화면 캡처 GUI 프로그램 애플리케이션입니다."""
    def __init__(self, root, output_dir="captures", prefix="capture"):
        self.root = root
        self.root.title("화면 캡처")
        self.root.configure(bg="#1e1e2e")
        self.root.resizable(False, False)
        
        # 캡처 유틸리티 특성상 다른 창들 위에 고정
        self.root.attributes("-topmost", True)
        self.root.after(1000, self._keep_on_top)
        
        # 저장 경로 및 파일명 패턴 설정
        self.output_dir = Path(output_dir)
        self.prefix = prefix
        
        # 연결된 모니터 정보 가져오기
        self.monitors = get_monitors()
        self._hotkey_stop_event = threading.Event()
        self._hotkey_thread = None
        
        # 메인 패딩 프레임
        self.main_frame = tk.Frame(root, bg="#1e1e2e", padx=20, pady=20)
        self.main_frame.pack(fill="both", expand=True)
        
        # 타이틀 헤더
        title_label = tk.Label(
            self.main_frame,
            text="MONITOR CAPTURE",
            font=("Segoe UI", 14, "bold"),
            bg="#1e1e2e",
            fg="#89b4fa"
        )
        title_label.pack(pady=(0, 15))
        
        # 모니터 선택 라벨 및 드롭다운 메뉴
        tk.Label(
            self.main_frame,
            text="캡처할 모니터 선택:",
            font=("Segoe UI", 9, "bold"),
            bg="#1e1e2e",
            fg="#a6adc8"
        )
        
        # 모니터 리스트 옵션 문자열 구성
        monitor_options = []
        default_idx = 0
        for idx, m in enumerate(self.monitors):
            primary_text = " (주 모니터)" if m["is_primary"] else ""
            monitor_options.append(f"모니터 {idx + 1}: {m['width']}x{m['height']}{primary_text}")
            if m["is_primary"]:
                default_idx = idx
                
        if not monitor_options:
            monitor_options = ["모니터 정보를 찾을 수 없습니다."]
            
        self.selected_monitor_str = tk.StringVar(value=monitor_options[default_idx])
        
        self.monitor_menu = tk.OptionMenu(self.main_frame, self.selected_monitor_str, *monitor_options)
        self.monitor_menu.config(
            bg="#313244", fg="#cdd6f4", activebackground="#45475a", activeforeground="#cdd6f4",
            relief="flat", highlightthickness=0, font=("Segoe UI", 10), cursor="hand2",
            padx=10, pady=5
        )
        self.monitor_menu["menu"].config(
            bg="#313244", fg="#cdd6f4", activebackground="#45475a", activeforeground="#cdd6f4",
            font=("Segoe UI", 10), relief="flat"
        )
        self.monitor_menu.pack(fill="x", pady=(0, 15))
        
        # 상태 표시 카드 레이아웃
        self.status_card = tk.Frame(
            self.main_frame,
            bg="#252538",
            padx=15,
            pady=15,
            highlightbackground="#313244",
            highlightthickness=1
        )
        self.status_card.pack(fill="x", pady=(0, 20))
        
        self.status_title = tk.Label(
            self.status_card,
            text="상태",
            font=("Segoe UI", 9, "bold"),
            bg="#252538",
            fg="#a6adc8"
        )
        self.status_title.pack(anchor="w")
        
        self.status_var = tk.StringVar(value="대기 중 (모니터 선택 후 캡처 버튼 클릭)")
        self.status_label = tk.Label(
            self.status_card,
            textvariable=self.status_var,
            font=("Segoe UI", 10),
            bg="#252538",
            fg="#cdd6f4",
            wraplength=260,
            justify="left"
        )
        self.status_label.pack(anchor="w", pady=(5, 0))
        
        # 모니터 자동 캡처 버튼
        self.capture_btn = ModernButton(
            self.main_frame,
            bg_color="#a6e3a1",
            active_bg="#94e2d5",
            fg_color="#11111b",
            text="선택한 모니터 캡처  (Ctrl+Shift+P)",
            command=self.start_capture
        )
        self.capture_btn.pack(fill="x", pady=(0, 10))
        
        # 추가 조작을 위한 하단 가로 프레임
        self.btn_frame = tk.Frame(self.main_frame, bg="#1e1e2e")
        self.btn_frame.pack(fill="x")
        
        self.folder_btn = ModernButton(
            self.btn_frame,
            bg_color="#313244",
            active_bg="#45475a",
            fg_color="#cdd6f4",
            text="캡처 폴더 열기",
            command=self.open_folder
        )
        self.folder_btn.pack(side="left", fill="x", expand=True)

        self._start_global_hotkey_listener()
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

    def _keep_on_top(self):
        """창이 항상 위에 있도록 주기적으로 topmost 상태를 유지합니다."""
        try:
            if self.root.winfo_exists():
                self.root.attributes("-topmost", True)
                self.root.lift()
        finally:
            if self.root.winfo_exists():
                self.root.after(1000, self._keep_on_top)

    def _start_global_hotkey_listener(self):
        """전역 Ctrl+Shift+P 단축키를 등록합니다."""
        def worker():
            try:
                if not user32.RegisterHotKey(None, HOTKEY_ID_CAPTURE, MOD_CONTROL | MOD_SHIFT, VK_P):
                    err = ctypes.get_last_error()
                    self.root.after(0, lambda: messagebox.showerror(
                        "오류",
                        f"전역 단축키 등록에 실패했습니다. 다른 프로그램이 Ctrl+Shift+P를 사용 중일 수 있습니다.\nWin32 error: {err}"
                    ))
                    return

                msg = wintypes.MSG()
                while not self._hotkey_stop_event.is_set():
                    result = user32.GetMessageW(ctypes.byref(msg), None, 0, 0)
                    if result == 0 or result == -1:
                        break
                    if msg.message == WM_HOTKEY and msg.wParam == HOTKEY_ID_CAPTURE:
                        self.root.after(0, self.start_capture)
            finally:
                try:
                    user32.UnregisterHotKey(None, HOTKEY_ID_CAPTURE)
                except Exception:
                    pass

        self._hotkey_thread = threading.Thread(target=worker, daemon=True)
        self._hotkey_thread.start()

    def on_close(self):
        """앱 종료 시 전역 단축키와 창을 정리합니다."""
        self._hotkey_stop_event.set()
        try:
            user32.PostThreadMessageW(
                self._hotkey_thread.ident,
                0x0012,  # WM_QUIT
                0,
                0
            )
        except Exception:
            pass
        self.root.destroy()
        
    def open_folder(self):
        """저장용 캡처 폴더를 파일 탐색기에서 엽니다."""
        self.output_dir.mkdir(parents=True, exist_ok=True)
        try:
            os.startfile(self.output_dir)
        except Exception as e:
            messagebox.showerror("오류", f"폴더를 열지 못했습니다: {e}")
            
    def start_capture(self):
        """캡처를 시작하기 위해 메인 GUI 창을 일시적으로 숨깁니다."""
        self.root.withdraw()
        # 창이 화면에서 숨겨지는 시간을 주기 위해 200ms 딜레이를 줍니다.
        self.root.after(200, self.do_capture)
        
    def do_capture(self):
        """선택한 모니터를 캡처한 뒤 저장하고 GUI 창을 복원합니다."""
        try:
            sel_str = self.selected_monitor_str.get()
            
            # 파싱: "모니터 X: ... "에서 인덱스 추출
            if sel_str.startswith("모니터 "):
                m_idx = int(sel_str.split(":")[0].split(" ")[1]) - 1
            else:
                m_idx = 0
                
            if m_idx >= len(self.monitors):
                raise ValueError("선택한 모니터를 찾을 수 없습니다.")
                
            monitor = self.monitors[m_idx]
            left = monitor["left"]
            top = monitor["top"]
            width = monitor["width"]
            height = monitor["height"]
            
            # 해당 모니터 화면 데이터 캡처
            bgra_data = capture_screen_raw(left, top, width, height)
            
            # 파일 경로 생성 및 저장
            self.output_dir.mkdir(parents=True, exist_ok=True)
            file_idx = get_next_index(self.output_dir, self.prefix)
            filename = f"{self.prefix}_{file_idx:04d}.png"
            filepath = self.output_dir / filename
            
            _write_png(filepath, bgra_data, width, height)
            
            self.status_var.set(f"캡처 완료 및 저장:\n{filename}")
            self.status_label.config(fg="#a6e3a1")  # 성공 시 연두색 텍스트
            
        except Exception as e:
            messagebox.showerror("오류", f"캡처 작업 중 오류가 발생했습니다:\n{e}")
            self.status_var.set("캡처 실패")
            self.status_label.config(fg="#f38ba8")  # 실패 시 붉은색 텍스트
        finally:
            # 캡처 완료 후 메인 GUI 창 복원
            self.root.deiconify()
            self.root.attributes("-topmost", True)


def main() -> int:
    parser = argparse.ArgumentParser(description="모니터 화면 자동 캡처 프로그램")
    parser.add_argument("--out", default="captures", help="저장할 디렉토리 경로 (기본값: captures)")
    parser.add_argument("--prefix", default="capture", help="파일명 접두사 (기본값: capture)")
    args = parser.parse_args()
    
    root = tk.Tk()
    app = CaptureApp(root, output_dir=args.out, prefix=args.prefix)
    root.mainloop()
    return 0

if __name__ == "__main__":
    sys.exit(main())
