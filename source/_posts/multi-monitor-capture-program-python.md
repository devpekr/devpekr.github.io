---
title: 파이썬으로 구현하는 고속 멀티모니터 화면 캡처 프로그램
date: 2026-06-28 15:37:06
tags: [Python, ScreenCapture, MultiMonitor, Win32API]
categories: [Coding, Python]
toc: true
---

# 파이썬으로 구현하는 고속 멀티모니터 화면 캡처 프로그램

일반적으로 파이썬에서 화면을 캡처할 때 `Pillow`나 `pyautogui` 같은 편리한 라이브러리를 많이 사용합니다. 하지만 이 도구들은 멀티모니터 환경이나 고해상도(4K 등) 디스플레이의 DPI 배율 설정에 따라 화면의 일부가 잘리거나, 캡처 속도가 현저히 느려지는 단점이 있습니다.

이번 포스팅에서는 외부 라이브러리 종속성 없이 **순수 파이썬 내장 모듈(`ctypes`, `zlib`, `struct`)과 Windows API**를 직접 호출하여, **멀티모니터 대응** 및 **초고속 캡처**를 지원하는 GUI 화면 캡처 프로그램을 구현해보겠습니다.

![](../../images/capture_app_banner.jpg)

---

## 1. 핵심 기술 메커니즘

### 1) DPI 배율 불일치 해결 (DPI Awareness)
윈도우 환경에서는 모니터마다 DPI 배율(예: 100%, 125%, 150%)이 다를 수 있습니다. 이를 파이썬이 제대로 인지하지 못하면 캡처 영역이 확대/축소되어 잘리게 됩니다. 이를 방지하기 위해 다음 윈도우 API를 먼저 호출하여 프로그램이 모니터별 DPI를 정상적으로 인식하도록 선언합니다.

```python
import ctypes

try:
    ctypes.windll.shcore.SetProcessDpiAwareness(2)  # PROCESS_PER_MONITOR_DPI_AWARE
except Exception:
    try:
        ctypes.windll.user32.SetProcessDPIAware()
    except Exception:
        pass
```

### 2) EnumDisplayMonitors를 이용한 물리 모니터 좌표 추출
`EnumDisplayMonitors` API를 통해 현재 PC에 연결된 모든 모니터의 좌표 정보(left, top, right, bottom)를 배열로 추출합니다. 이 좌표 정보를 이용하여 어떤 모니터든 왜곡 없이 캡처가 가능합니다.

```python
def get_monitors() -> list[dict]:
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

    ctypes.windll.user32.EnumDisplayMonitors(None, None, enum_proc, 0)
    return monitors
```

### 3) Win32 GDI 기반 고속 캡처 및 자체 PNG 인코딩
`GetDIBits`로 메모리 상에 가져온 BGRA 원시(Raw) 바이트 데이터를 파이썬 내장 `zlib`와 `struct`를 사용해 직접 PNG 바이트 스트림으로 변경합니다. 외부 Pillow 라이브러리로 변환하는 것보다 오버헤드가 적어 고속 프레임 연속 처리에 매우 유리합니다.

---

## 2. 캡처 프로그램 주요 기능

새롭게 개선된 프로그램은 다음과 같은 특징을 제공합니다:

1. **세련된 Modern Dark UI**
   * 어두운 테마 기반의 커스텀 위젯 디자인(플랫 스타일 버튼, 호버 효과 등)을 직접 구현하여 시각적 완성도를 극대화했습니다.
2. **간편한 모니터 선택**
   * 연결된 모든 모니터 정보를 자동 감지하고, 해상도 및 주 모니터 여부를 드롭다운 메뉴를 통해 손쉽게 확인 및 선택할 수 있습니다.
3. **직관적인 상태 피드백**
   * 결과물이 저장된 파일명과 캡처 작업의 성공/실패 여부를 GUI 내부의 상태 피드백 카드로 실시간 시각화합니다.
4. **원클릭 캡처 폴더 탐색**
   * 하단에 배치된 '캡처 폴더 열기' 버튼을 통해 저장 디렉토리를 윈도우 탐색기로 즉시 열 수 있어 활용성이 뛰어납니다.

---

## 3. 전체 소스 코드 (`capture.py`)

아래 코드를 복사하여 `capture.py`로 저장한 뒤 `python capture.py`를 실행하면 세련된 다크 테마 GUI 프로그램이 시작됩니다.

```python
import argparse
import ctypes
import struct
import zlib
import time
import os
import sys
import tkinter as tk
from tkinter import messagebox
from pathlib import Path

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
        
        # 저장 경로 및 파일명 패턴 설정
        self.output_dir = Path(output_dir)
        self.prefix = prefix
        
        # 연결된 모니터 정보 가져오기
        self.monitors = get_monitors()
        
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
            text="선택한 모니터 캡처",
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
```

이 고성능 파이썬 화면 캡처 프로그램을 사용하면, 복잡한 설치 없이도 멀티모니터가 설치된 실무 환경에서 쉽고 강력하게 화면을 수집할 수 있습니다. 캡처 작업을 코딩으로 자동화하려 할 때 훌륭한 레퍼런스가 될 것입니다.
