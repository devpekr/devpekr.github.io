import sys
import os
import random
import string
import subprocess
from PyQt5.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QLabel,
    QListWidget, QPushButton, QListWidgetItem,
    QHBoxLayout, QLineEdit, QCheckBox, QScrollArea,
    QGridLayout, QFrame, QSizePolicy, QSpacerItem, QTextEdit
)
from PyQt5.QtGui import QPixmap, QKeySequence, QFont, QIcon, QPalette, QColor
from PyQt5.QtCore import Qt, QTimer, pyqtSignal
from PIL import ImageGrab, ImageDraw, ImageFont, Image
import datetime

SAVE_DIR = '../source/images'
POST_DIR = '../source/_posts'
DEFAULT_MAX_WIDTH = 900

# 모던 스타일시트
MODERN_STYLE = """
QWidget {
    background-color: #f8f9fa;
    font-family: 'Segoe UI', 'Malgun Gothic', sans-serif;
    font-size: 9pt;
}

QMainWindow {
    background-color: #ffffff;
}

/* 메인 컨테이너 */
QWidget#main_container {
    background-color: #ffffff;
    border-radius: 12px;
    padding: 15px;
}

/* 좌측/우측 패널 */
QWidget#left_panel, QWidget#right_panel {
    background-color: #ffffff;
    border: 1px solid #e1e8ed;
    border-radius: 10px;
    padding: 15px;
}

/* 제목 라벨 */
QLabel#section_title {
    font-size: 11pt;
    font-weight: bold;
    color: #2c3e50;
    padding: 6px 0px 3px 0px;
    border-bottom: 2px solid #3498db;
    margin-bottom: 8px;
}

/* 일반 라벨 */
QLabel {
    color: #34495e;
    font-size: 9pt;
}

/* 입력 필드 */
QLineEdit {
    border: 2px solid #e1e8ed;
    border-radius: 6px;
    padding: 8px 10px;
    font-size: 9pt;
    background-color: #ffffff;
    selection-background-color: #3498db;
    transition: all 0.3s ease;
}

QLineEdit:focus {
    border-color: #3498db;
    background-color: #ffffff;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

QLineEdit:hover {
    border-color: #bdc3c7;
}


/* 텍스트에어리어 */
QTextEdit {
    border: 2px solid #e1e8ed;
    border-radius: 6px;
    padding: 8px 10px;
    font-size: 9pt;
    background-color: #ffffff;
    selection-background-color: #3498db;
}

QTextEdit:focus {
    border-color: #3498db;
    background-color: #ffffff;
}


/* 버튼 스타일 */
QPushButton {
    background: qlineargradient(x1: 0, y1: 0, x2: 0, y2: 1,
                                stop: 0 #3498db, stop: 1 #2980b9);
    border: none;
    border-radius: 6px;
    color: white;
    font-weight: bold;
    padding: 10px 16px;
    font-size: 9pt;
    min-width: 70px;
}

QPushButton:hover {
    background: qlineargradient(x1: 0, y1: 0, x2: 0, y2: 1,
                                stop: 0 #5dade2, stop: 1 #3498db);
    transform: translateY(-1px);
}

QPushButton:pressed {
    background: qlineargradient(x1: 0, y1: 0, x2: 0, y2: 1,
                                stop: 0 #2980b9, stop: 1 #21618c);
}

/* 삭제 버튼 */
QPushButton#delete_btn {
    background: qlineargradient(x1: 0, y1: 0, x2: 0, y2: 1,
                                stop: 0 #e74c3c, stop: 1 #c0392b);
    min-width: 50px;
    padding: 4px 8px;
    font-size: 8pt;
}

QPushButton#delete_btn:hover {
    background: qlineargradient(x1: 0, y1: 0, x2: 0, y2: 1,
                                stop: 0 #ec7063, stop: 1 #e74c3c);
}

/* 리스트 위젯 */
QListWidget {
    border: 2px solid #e1e8ed;
    border-radius: 8px;
    background-color: #ffffff;
    padding: 3px;
    selection-background-color: #ebf3fd;
    outline: none;
}

QListWidget::item {
    border-radius: 4px;
    padding: 6px 10px;
    margin: 1px;
    color: #2c3e50;
}

QListWidget::item:hover {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
}

QListWidget::item:selected {
    background: qlineargradient(x1: 0, y1: 0, x2: 0, y2: 1,
                                stop: 0 #ebf3fd, stop: 1 #d6eaf8);
    color: #1f4e79;
    border: 1px solid #3498db;
}

/* 체크박스 */
QCheckBox {
    color: #34495e;
    font-size: 9pt;
    spacing: 6px;
}

QCheckBox::indicator {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    border: 2px solid #bdc3c7;
    background-color: #ffffff;
}

QCheckBox::indicator:checked {
    background-color: #3498db;
    border-color: #3498db;
    image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDNMNC41IDguNUwyIDYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=);
}

QCheckBox::indicator:hover {
    border-color: #85c1e9;
}

/* 스크롤 영역 */
QScrollArea {
    border: 2px solid #e1e8ed;
    border-radius: 8px;
    background-color: #ffffff;
}

QScrollBar:vertical {
    background-color: #f8f9fa;
    width: 10px;
    border-radius: 5px;
    margin: 0px;
}

QScrollBar::handle:vertical {
    background-color: #bdc3c7;
    border-radius: 5px;
    min-height: 15px;
    margin: 1px;
}

QScrollBar::handle:vertical:hover {
    background-color: #95a5a6;
}

QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
    height: 0px;
}

/* 상태 표시 프레임 */
QFrame#status_frame {
    background-color: #ebf3fd;
    border: 1px solid #d6eaf8;
    border-radius: 6px;
    padding: 0px;
}

/* 이미지 컨테이너 */
QWidget#image_container {
    background-color: #ffffff;
    border: 2px solid #e1e8ed;
    border-radius: 8px;
    padding: 6px;
}

QWidget#image_container:hover {
    border-color: #3498db;
    box-shadow: 0 3px 8px rgba(52, 152, 219, 0.15);
}

/* 구분선 */
QFrame#separator {
    border: none;
    border-top: 1px solid #e1e8ed;
    margin: 8px 0px;
}
"""

class ClickableLabel(QLabel):
    doubleClicked = pyqtSignal()
    def mouseDoubleClickEvent(self, event):
        self.doubleClicked.emit()

class ClipboardImageApp(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("📋 클립보드 이미지 저장기")
        self.setGeometry(100, 100, 1280, 800)
        self.setWindowFlags(self.windowFlags() | Qt.WindowStaysOnTopHint)
        self.max_width = DEFAULT_MAX_WIDTH
        self.current_post_filepath = None
        self.image_desc_counter = 1

        # 스타일 적용
        self.setStyleSheet(MODERN_STYLE)

        # 메인 컨테이너
        main_container = QWidget()
        main_container.setObjectName("main_container")
        main_layout = QVBoxLayout(main_container)
        main_layout.setSpacing(10)
        main_layout.setContentsMargins(10, 10, 10, 10)


        # 좌우 패널 컨테이너
        panels_layout = QHBoxLayout()
        panels_layout.setSpacing(15)

        # === 좌측 패널 ===
        left_panel = QWidget()
        left_panel.setObjectName("left_panel")
        left_panel.setMinimumWidth(1000)
        left_panel.setMaximumWidth(1050)
        left_layout = QVBoxLayout(left_panel)
        left_layout.setSpacing(12)

        # 글 생성 섹션
        self.create_post_section(left_layout)

        # 글 목록 섹션
        self.create_post_list_section(left_layout)

        # 이미지 입력 섹션
        self.create_input_section(left_layout)

        # === 우측 패널 ===
        right_panel = QWidget()
        right_panel.setObjectName("right_panel")
        right_layout = QVBoxLayout(right_panel)
        right_layout.setSpacing(8)

        # 설정 섹션
        self.create_settings_section(right_layout)

        # 이미지 갤러리 섹션
        self.create_gallery_section(right_layout)

        # 패널들을 메인 레이아웃에 추가
        panels_layout.addWidget(left_panel)
        panels_layout.addWidget(right_panel)
        main_layout.addLayout(panels_layout)

        # 메인 레이아웃 설정
        container_layout = QVBoxLayout()
        container_layout.setContentsMargins(0, 0, 0, 0)
        container_layout.addWidget(main_container)
        self.setLayout(container_layout)

        self.saved_files = []
        self.load_post_list()
        self.load_image_list()

    def create_section_title(self, title, parent_layout):
        """섹션 제목을 생성하는 헬퍼 메서드"""
        section_title = QLabel(title)
        section_title.setObjectName("section_title")
        parent_layout.addWidget(section_title)

    def create_post_section(self, parent_layout):
        """글 생성 섹션"""

        title_hbox = QHBoxLayout()
        title_hbox.setSpacing(8)

        self.title_input = QLineEdit()
        self.title_input.setPlaceholderText("✏️ 글 제목을 입력하세요...")

        self.create_button = QPushButton("📝 생성")
        self.create_button.clicked.connect(self.create_hexo_post)
        self.create_button.setMinimumWidth(80)

        title_hbox.addWidget(self.title_input)
        title_hbox.addWidget(self.create_button)
        parent_layout.addLayout(title_hbox)

    def create_settings_section(self, parent_layout):
        """설정 섹션"""

        # 현재 글 상태
        status_frame = QFrame()
        status_frame.setObjectName("status_frame")
        status_layout = QVBoxLayout(status_frame)

        self.selected_post_label = QLabel("📄 현재 선택된 글: -------------(없음)-------------")
        self.selected_post_label.setStyleSheet("font-weight: bold; color: #2980b9;")
        status_layout.addWidget(self.selected_post_label)
        parent_layout.addWidget(status_frame)


    def create_post_list_section(self, parent_layout):
        """글 목록 섹션"""

        self.post_listwidget = QListWidget()
        self.post_listwidget.itemDoubleClicked.connect(self.select_post_from_list)
        self.post_listwidget.setMinimumHeight(320)
        self.post_listwidget.setMaximumHeight(320)
        parent_layout.addWidget(self.post_listwidget)

    def create_input_section(self, parent_layout):
        """이미지 입력 섹션"""

        # 이미지 설명
        desc_label = QLabel("📝 이미지 설명:")
        parent_layout.addWidget(desc_label)

        self.desc_input = QTextEdit()
        self.desc_input.setPlaceholderText("💭 설명 입력 (선택사항)...")
        parent_layout.addWidget(self.desc_input)

        # 붙여넣기 영역
        paste_label = QLabel("📋 아래에서 Ctrl+V로 붙여넣기:")
        parent_layout.addWidget(paste_label)

        self.textarea = QLineEdit()
        self.textarea.setPlaceholderText("🎯 여기에 포커스 후 Ctrl+V")
        self.textarea.installEventFilter(self)
        self.textarea.setStyleSheet("""
            QLineEdit {
                border: 3px dashed #3498db;
                background-color: #f8f9ff;
                color: #7f8c8d;
                font-style: italic;
                min-height: 40px;
            }
            QLineEdit:focus {
                border-color: #2980b9;
                background-color: #ffffff;
                font-style: normal;
            }
        """)
        parent_layout.addWidget(self.textarea)

        # 남은 공간을 채우는 스페이서
        parent_layout.addStretch()

    def create_gallery_section(self, parent_layout):
        """이미지 갤러리 섹션"""

        self.scroll_area = QScrollArea()
        self.scroll_area.setMinimumHeight(650)
        self.scroll_area_widget = QWidget()
        self.image_grid_layout = QGridLayout(self.scroll_area_widget)
        self.image_grid_layout.setSpacing(10)
        self.scroll_area.setWidgetResizable(True)
        self.scroll_area.setWidget(self.scroll_area_widget)
        parent_layout.addWidget(self.scroll_area)

    def create_hexo_post(self):
        title = self.title_input.text().strip()
        if not title:
            self.show_message("⚠️ 제목을 입력하세요.", "warning")
            return

        # POST_DIR이 없으면 생성
        if not os.path.exists(POST_DIR):
            try:
                os.makedirs(POST_DIR)
            except Exception as e:
                self.show_message(f"⚠️ 포스트 디렉토리 생성 실패: {str(e)}", "error")
                return

        try:
            # 현재 작업 디렉토리를 프로젝트 루트로 설정
            current_dir = os.getcwd()

            # Windows에서 PATH 환경변수 가져오기
            env = os.environ.copy()

            # hexo uniqpost 명령어 실행 (여러 방법 시도)
            commands_to_try = [
                ["hexo", "uniqpost", title],
                ["hexo.cmd", "uniqpost", title],
                ["npx", "hexo", "uniqpost", title],
                [os.path.join("../node_modules", ".bin", "hexo"), "uniqpost", title],
                [os.path.join("../node_modules", ".bin", "hexo.cmd"), "uniqpost", title]
            ]

            result = None
            successful_command = None

            for cmd in commands_to_try:
                try:
                    print(f"시도하는 명령어: {' '.join(cmd)}")  # 디버깅용
                    result = subprocess.run(
                        cmd,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        text=True,
                        encoding='utf-8',
                        cwd=current_dir,  # 현재 디렉토리에서 실행
                        env=env,          # 환경변수 전달
                        timeout=15,       # 15초 타임아웃
                        shell=False       # shell=False로 변경
                    )

                    if result.returncode == 0:
                        successful_command = ' '.join(cmd)
                        print(f"성공한 명령어: {successful_command}")  # 디버깅용
                        break

                except (subprocess.TimeoutExpired, FileNotFoundError, OSError) as e:
                    print(f"명령어 실패: {' '.join(cmd)} - {str(e)}")  # 디버깅용
                    continue

            if result and result.returncode == 0:
                # hexo uniqpost 성공
                print(f"stdout: {result.stdout}")  # 디버깅용
                print(f"stderr: {result.stderr}")  # 디버깅용

                # 생성된 파일 찾기
                created_file = None

                # stdout에서 파일 경로 추출 시도
                for line in result.stdout.split('\n'):
                    if 'Created:' in line or 'source/_posts/' in line:
                        # "✅ Created: source/_posts/vkkshj.md" 형태에서 파일명 추출
                        parts = line.split('source/_posts/')
                        if len(parts) > 1:
                            filename = parts[1].strip()
                            created_file = os.path.join(POST_DIR, filename)
                            if os.path.exists(created_file):
                                break

                # stdout에서 못 찾으면 최신 파일 찾기
                if not created_file or not os.path.exists(created_file):
                    try:
                        md_files = [f for f in os.listdir(POST_DIR) if f.endswith('.md')]
                        if md_files:
                            # 가장 최근에 수정된 파일 찾기
                            latest_file = max(md_files, key=lambda f: os.path.getmtime(os.path.join(POST_DIR, f)))
                            created_file = os.path.join(POST_DIR, latest_file)
                    except Exception:
                        pass

                if created_file and os.path.exists(created_file):
                    self.current_post_filepath = created_file
                    self.selected_post_label.setText(f"📄 현재 선택된 글: {os.path.basename(created_file)}")
                    self.load_post_list()
                    self.show_message(f"✅ 글이 성공적으로 생성되었습니다: {title}", "success")
                    self.title_input.clear()
                    print(f"생성된 파일: {created_file}")  # 디버깅용
                else:
                    self.show_message("⚠️ 생성된 파일을 찾을 수 없습니다. 수동으로 생성합니다.", "warning")
                    self.create_manual_post(title)
            else:
                # 모든 명령어 실패
                error_msg = result.stderr.strip() if result else "명령어를 찾을 수 없음"
                print(f"모든 명령어 실패. 마지막 오류: {error_msg}")  # 디버깅용
                self.show_message(f"⚠️ Hexo 명령어 실패. 수동으로 생성합니다. ({error_msg})", "warning")
                self.create_manual_post(title)

        except Exception as e:
            print(f"예외 발생: {str(e)}")  # 디버깅용
            self.show_message(f"⚠️ 오류 발생: {str(e)}. 수동으로 파일을 생성합니다.", "warning")
            self.create_manual_post(title)

    def create_manual_post(self, title):
        """Hexo 명령어가 실패할 경우 수동으로 마크다운 파일 생성"""
        try:
            # 파일명 생성 (6자리 랜덤 문자열)
            random_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
            filename = f"{random_id}.md"
            filepath = os.path.join(POST_DIR, filename)

            # 현재 날짜/시간
            now = datetime.datetime.now()
            date_str = now.strftime('%Y-%m-%d %H:%M:%S')

            # 마크다운 파일 내용 생성
            content = f"""---
title: {title}
date: {date_str}
tags: []
categories: []
---

<!-- 여기에 글 내용을 작성하세요 -->

"""

            # 파일 저장
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

            self.current_post_filepath = filepath
            self.selected_post_label.setText(f"📄 현재 선택된 글: {filename}")
            self.load_post_list()
            self.show_message(f"✅ 글이 수동으로 생성되었습니다: {title}", "success")
            self.title_input.clear()

        except Exception as e:
            self.show_message(f"❌ 수동 파일 생성 실패: {str(e)}", "error")

    def show_message(self, text, msg_type="info", timeout=3000):
        """타입별 색상으로 메시지 표시"""
        colors = {
            "info": "#3498db",
            "success": "#27ae60",
            "warning": "#f39c12",
            "error": "#e74c3c"
        }

        original_style = self.styleSheet()
        message_style = f"""
        QWidget {{
            border: 2px solid {colors.get(msg_type, colors["info"])};
            border-radius: 12px;
        }}
        """ + original_style

        self.setStyleSheet(message_style)
        self.setWindowTitle(f"📋 {text}")

        QTimer.singleShot(timeout, lambda: [
            self.setStyleSheet(original_style),
            self.setWindowTitle("📋 클립보드 이미지 저장기")
        ])

    def select_post_from_list(self, item):
        text = item.text().replace("📄", "").strip()
        filename = text.split()[0]  # 이제 제대로 파일명만 나옴
        full_path = os.path.join(POST_DIR, filename)
        if os.path.exists(full_path):
            self.current_post_filepath = full_path
            self.selected_post_label.setText(f"📄 현재 선택된 글: {filename}")
            self.image_desc_counter = 1
            # 3. 글 목록에서 더블클릭 시 파일명을 클립보드에 복사
            clipboard = QApplication.clipboard()
            clipboard.setText(filename)
            self.show_message(f"📝 글이 선택되었습니다: {filename} (파일명이 클립보드에 복사됨)", "success", 1500)  # 1.5초


    def load_post_list(self):
        self.post_listwidget.clear()
        if not os.path.exists(POST_DIR):
            return

        posts = []
        for f in os.listdir(POST_DIR):
            if f.endswith('.md') and len(f.split('.')[0]) == 6:
                full_path = os.path.join(POST_DIR, f)
                date_val = None
                title = ''
                try:
                    with open(full_path, 'r', encoding='utf-8') as file:
                        in_front_matter = False
                        for line in file:
                            line = line.strip()
                            if line == '---':
                                in_front_matter = not in_front_matter
                                continue
                            if in_front_matter:
                                if line.lower().startswith('title:'):
                                    title = line[6:].strip()
                                elif line.lower().startswith('date:'):
                                    date_str = line[5:].strip()
                                    try:
                                        date_val = datetime.datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')
                                    except:
                                        date_val = None
                            if not in_front_matter and date_val is not None and title:
                                break
                except Exception:
                    pass
                posts.append((date_val or datetime.datetime.min, f, title))

        posts.sort(key=lambda x: x[0], reverse=True)

        for date_val, f, title in posts:
            display_text = f"📄 {f}    📝 {title}"
            item = QListWidgetItem(display_text)
            self.post_listwidget.addItem(item)

    def eventFilter(self, source, event):
        if event.type() == event.KeyPress and source is self.textarea:
            if event.matches(QKeySequence.Paste):
                self.max_width = DEFAULT_MAX_WIDTH
                filename = save_clipboard_image(self.max_width)
                if filename:
                    self.saved_files.append(filename)
                    self.load_image_list()
                    self.append_image_to_post(filename)
                    self.show_message(f"🎉 이미지가 저장되고 추가되었습니다: {filename}", "success")
                else:
                    self.show_message("⚠️ 클립보드에 이미지가 없습니다.", "warning")
        return super().eventFilter(source, event)

    def load_image_list(self):
        # 기존 위젯들 정리
        while self.image_grid_layout.count():
            item = self.image_grid_layout.takeAt(0)
            widget = item.widget()
            if widget:
                widget.deleteLater()

        if not os.path.exists(SAVE_DIR):
            return

        files = [
            (f, os.path.join(SAVE_DIR, f))
            for f in os.listdir(SAVE_DIR)
            if len(f) == 10 and f.endswith('.jpg')
        ]

        files.sort(key=lambda x: os.path.getmtime(x[1]), reverse=True)
        files = files[:50]

        row, col = 0, 0
        for filename, full_path in files:
            # 이미지 컨테이너
            container = QWidget()
            container.setObjectName("image_container")
            container_layout = QVBoxLayout(container)
            container_layout.setContentsMargins(4, 4, 4, 4)
            container_layout.setSpacing(6)

            # 이미지 라벨
            img_label = ClickableLabel()
            pixmap = QPixmap(full_path)
            pixmap = pixmap.scaled(140, 140, Qt.KeepAspectRatio, Qt.SmoothTransformation)
            img_label.setPixmap(pixmap)
            img_label.setAlignment(Qt.AlignCenter)
            img_label.doubleClicked.connect(lambda f=filename: self.append_image_to_post(f))
            img_label.setStyleSheet("""
                QLabel {
                    border: 1px solid #e1e8ed;
                    border-radius: 4px;
                    padding: 3px;
                    background-color: #ffffff;
                }
                QLabel:hover {
                    border-color: #3498db;
                    box-shadow: 0 2px 6px rgba(52, 152, 219, 0.2);
                }
            """)
            container_layout.addWidget(img_label)

            # 파일명 라벨
            name_label = QLabel(filename)
            name_label.setAlignment(Qt.AlignCenter)
            name_label.setStyleSheet("""
                QLabel {
                    color: #7f8c8d;
                    font-size: 7pt;
                    font-family: monospace;
                    padding: 1px;
                }
            """)
            container_layout.addWidget(name_label)

            # 삭제 버튼
            del_btn = QPushButton("🗑️")
            del_btn.setObjectName("delete_btn")
            del_btn.clicked.connect(lambda _, f=filename: self.delete_image(f))
            container_layout.addWidget(del_btn)

            self.image_grid_layout.addWidget(container, row, col)
            col += 1
            if col >= 3:  # 4열로 증가
                col = 0
                row += 1

    def append_image_to_post(self, filename):
        if not self.current_post_filepath or not os.path.exists(self.current_post_filepath):
            self.show_message("⚠️ 먼저 글을 선택하거나 생성하세요.", "warning")
            return

        desc = self.desc_input.text().strip()
        if not desc:
            circled_numbers = "①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳"
            if self.image_desc_counter <= len(circled_numbers):
                desc = f"- {circled_numbers[self.image_desc_counter - 1]}"
            else:
                desc = f"- {self.image_desc_counter}"
            self.image_desc_counter += 1
        else:
            desc = f"- {desc}"
            self.desc_input.clear()  # 사용 후 입력 필드 초기화

        path = f"/images/{filename}" if self.absolute_checkbox.isChecked() else f"../images/{filename}"
        md_text = f"{desc}\n\n![]({path})\n\n"

        try:
            with open(self.current_post_filepath, 'a', encoding='utf-8') as f:
                f.write(md_text)
            self.show_message(f"📝 이미지가 글에 추가되었습니다: {filename}", "success")
        except Exception as e:
            self.show_message(f"⚠️ 글 저장 실패: {str(e)}", "error")

    def delete_image(self, filename):
        path = os.path.join(SAVE_DIR, filename)
        if os.path.exists(path):
            os.remove(path)
            self.show_message(f"🗑️ 이미지가 삭제되었습니다: {filename}", "success")
            self.load_image_list()

def generate_filename():
    first = random.choice(string.ascii_lowercase)
    rest = ''.join(random.choices(string.ascii_lowercase + string.digits, k=5))
    return first + rest + '.jpg'

def add_watermark(image, text="https://goodsaem.github.io/"):
    draw = ImageDraw.Draw(image)
    width, height = image.size
    try:
        font = ImageFont.truetype("arial.ttf", 12)
    except IOError:
        font = ImageFont.load_default()

    # 텍스트 크기 계산
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # 우측 상단 위치
    padding = 5
    x = width - text_width - padding
    y = padding

    # 검은색 반투명 배경
    rect_x0 = x - 3
    rect_y0 = y - 3
    rect_x1 = x + text_width + 3
    rect_y1 = y + text_height + 3
    draw.rectangle([rect_x0, rect_y0, rect_x1, rect_y1], fill=(0, 0, 0, 128))
    draw.text((x, y), text, font=font, fill=(255, 255, 255))
    return image

def resize_if_needed(image, max_width):
    width, height = image.size
    try:
        resample_filter = Image.Resampling.LANCZOS
    except AttributeError:
        resample_filter = Image.LANCZOS
    if width > max_width:
        ratio = max_width / width
        new_height = int(height * ratio)
        image = image.resize((max_width, new_height), resample_filter)
    return image

def save_clipboard_image(max_width):
    image = ImageGrab.grabclipboard()
    if image is None:
        return None
    if not os.path.exists(SAVE_DIR):
        os.makedirs(SAVE_DIR)
    while True:
        filename = generate_filename()
        path = os.path.join(SAVE_DIR, filename)
        if not os.path.exists(path):
            break
    image = image.convert("RGB")
    image = resize_if_needed(image, max_width)
    image = add_watermark(image)
    image.save(path, 'JPEG', quality=65, optimize=True)
    return filename

if __name__ == "__main__":
    app = QApplication(sys.argv)

    # 애플리케이션 전체 폰트 설정
    font = QFont("Segoe UI", 9)
    app.setFont(font)

    # 다크모드 지원을 위한 팔레트 설정 (선택사항)
    palette = QPalette()
    palette.setColor(QPalette.Window, QColor(248, 249, 250))
    palette.setColor(QPalette.WindowText, QColor(44, 62, 80))
    app.setPalette(palette)

    window = ClipboardImageApp()
    window.show()
    sys.exit(app.exec_())