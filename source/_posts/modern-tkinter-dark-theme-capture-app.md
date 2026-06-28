---
title: 파이썬 Tkinter로 구현하는 세련된 다크 테마 화면 캡처 프로그램 제작기 (Modern GUI)
date: 2026-06-28 21:25:00
tags: [Python, Tkinter, GUI, ModernUI, CustomWidget]
categories: [Coding, Python]
toc: true
---

# 파이썬 Tkinter로 구현하는 세련된 다크 테마 화면 캡처 프로그램 제작기 (Modern GUI)

지난 포스팅에서는 외부 라이브러리 없이 윈도우 API를 직접 다루며 고속 멀티 모니터 화면을 캡처하는 핵심 로직을 구현했습니다. 하지만 기본으로 내장된 `tkinter.ttk` 테마의 GUI는 무언가 칙칙하고 클래식한 윈도우 98 스타일을 벗어나지 못했습니다. 

이번 포스팅에서는 기존 코드를 한 단계 더 업그레이드하여, 세련된 **다크 테마(Modern Dark Theme)**와 **마우스 호버 애니메이션**을 적용한 화면 캡처 프로그램의 GUI 설계와 구현 노하우를 자세히 해설해 보겠습니다.

---

## 1. UI 발전 과정 비교

기존의 `capture_simple.py` 기반 UI는 기능은 다양했지만(즉시/주기적/감시 캡처), 시각적으로 매우 투박했습니다. 개선된 `capture.py`는 실무에서 가장 자주 사용하는 모니터별 즉시 캡처와 캡처 폴더 열기 기능만 깔끔하게 추려내고, UI 퀄리티를 최상으로 올렸습니다.

| 비교 항목 | 기존 버전 (`capture_simple.py`) | 개선 버전 (`capture.py`) |
| :--- | :--- | :--- |
| **테마 스타일** | 시스템 기본 OS 테마 (칙칙한 회색 바탕) | 다크 모드 테마 적용 (`#1e1e2e` 고대비 스타일) |
| **버튼 디자인** | OS 기본 입체 버튼 | 플랫(Flat) 디자인 & 마우스 호버 변색 효과 |
| **드롭다운** | 기본 OptionMenu | 다크 테마가 가미된 커스텀 드롭다운 |
| **상태 알림** | 텍스트 레이블로 심플하게 표시 | 카드 형태 배치 및 성공(초록)/실패(빨강) 피드백 컬러 반영 |

---

## 2. 핵심 코드 디자인 기법 분석

개선된 코드에서 적용된 세련된 Tkinter UI 구현 요소를 하나씩 살펴보겠습니다.

### 1) 마우스 호버 애니메이션 커스텀 버튼 (`ModernButton`)

Tkinter의 기본 `Button` 위젯은 경계선이 도드라져 보이며 플랫(Flat) 디자인을 만들기 어렵습니다. `capture.py`에서는 `tk.Button`을 상속받아 호버 시 배경색이 부드럽게 변하는 커스텀 버튼 클래스를 직접 정의했습니다.

```python
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
            cursor="hand2", # 마우스 오버 시 손가락 커서 변경
            padx=10,
            pady=8,
            *args,
            **kwargs
        )
        self.bg_color = bg_color
        self.active_bg = active_bg
        # Enter(마우스 진입) 및 Leave(마우스 이탈) 이벤트 바인딩
        self.bind("<Enter>", lambda e: self.config(bg=active_bg))
        self.bind("<Leave>", lambda e: self.config(bg=bg_color))
```

* **`relief="flat", bd=0`**: 버튼의 테두리 두께를 없애고 평평한 플랫 스타일로 바꿉니다.
* **`<Enter>` / `<Leave>` 이벤트**: 마우스 커서가 버튼 위에 올라왔을 때와 나갔을 때의 색상을 동적으로 변경하여 웹 사이트 버튼 같은 반응형 UX를 구현합니다.
* **`cursor="hand2"`**: 사용자가 클릭 가능한 영역임을 바로 인지할 수 있도록 커서를 마우스 손가락 모양으로 변경합니다.

---

### 2) 다크 테마 디자인 및 색상 코드 바인딩

앱 전체의 메인 배경과 위젯 배경은 요즘 널리 사용되는 모던 개발 툴의 어두운 테마 스키마(Catppuccin 또는 Dracula 스타일)에서 영감을 얻은 고유 색상을 정의했습니다.

* **메인 배경색**: `#1e1e2e` (깊은 어두운 블루/퍼플 톤)
* **카드 및 메뉴 배경색**: `#252538` / `#313244`
* **헤더 강조색**: `#89b4fa` (파스텔 블루)
* **비활성 상태 텍스트**: `#a6adc8`
* **성공 메시지/버튼**: `#a6e3a1` (그린)
* **실패 메시지**: `#f38ba8` (레드)

상태 변화 시마다 레이블의 색상을 실시간으로 조작하여 정보의 가독성을 대폭 끌어올렸습니다.

```python
# 성공 시 연두색 텍스트와 완료 문구 표시
self.status_var.set(f"캡처 완료 및 저장:\n{filename}")
self.status_label.config(fg="#a6e3a1")

# 에러 발생 시 붉은색 텍스트로 에러 표시
self.status_var.set("캡처 실패")
self.status_label.config(fg="#f38ba8")
```

---

### 3) 캡처 시 GUI 창 숨김 처리 및 복원 메커니즘

캡처 버튼을 눌렀을 때 실행 중인 프로그램 창 자체가 화면에 함께 찍히는 현상을 해결해야 합니다. 이를 처리하기 위한 윈도우 컨트롤 메서드를 직관적으로 통합했습니다.

```python
    def start_capture(self):
        """캡처를 시작하기 위해 메인 GUI 창을 일시적으로 숨깁니다."""
        self.root.withdraw()  # 메인 GUI 창 숨김
        # 창이 화면에서 숨겨지는 트랜지션 타임을 감안하여 200ms 딜레이 후 실 캡처 진행
        self.root.after(200, self.do_capture)
        
    def do_capture(self):
        try:
            # 캡처 및 이미지 파일 저장 로직 실행...
            ...
        finally:
            # 캡처 완료 후 GUI 창 복원
            self.root.deiconify()  # 메인 GUI 창 복원
            self.root.attributes("-topmost", True)  # 다른 창보다 위에 고정
```

* **`self.root.withdraw()`**: 화면에서 프로그램을 투명하게 감추고 윈도우 관리자(OS) 목록에서 임시 제외시킵니다.
* **`self.root.after(200, ...)`**: `withdraw`가 호출되더라도 실제 윈도우 그래픽 카드 연산 상 완전히 윈도우가 사라지는 프레임 갱신 대기 시간이 필요합니다. 최소 `200ms` 정도의 시간을 두어 흔적이 남지 않도록 합니다.
* **`self.root.deiconify()`**: 모든 연산이 끝난 후 다시 사용자에게 프로그램 창을 표출합니다.

---

## 3. 마치며

파이썬의 기본 `Tkinter`는 종종 "디자인이 구리다"는 평을 듣곤 합니다. 하지만 이렇게 **적절한 색상 구성(Color Palette)**과 **마우스 이벤트를 응용한 다이내믹 인터랙션**, 그리고 **플랫 위젯 스타일링**을 가미하면 별도의 무거운 외부 라이브러리(`PyQt` 등) 없이도 가벼우면서도 세련된 현대적인 데스크톱 유틸리티를 만들어낼 수 있습니다.

이번 코드 개선을 통해 여러분도 투박한 파이썬 스크립트에서 벗어나, 사용하고 싶어지는 미려한 유틸리티 디자인에 도전해 보시기 바랍니다!
