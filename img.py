import sys
import os
import random
import string
import subprocess
from PyQt5.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QLabel,
    QListWidget, QTextEdit, QPushButton, QListWidgetItem,
    QHBoxLayout, QLineEdit, QCheckBox
)
from PyQt5.QtGui import QPixmap, QKeySequence
from PyQt5.QtCore import Qt, QTimer, pyqtSignal
from PIL import ImageGrab, ImageDraw, ImageFont, Image
import pyperclip
import datetime

SAVE_DIR = './source/images'
POST_DIR = './source/_posts'
DEFAULT_MAX_WIDTH = 900

class ClickableLabel(QLabel):
    doubleClicked = pyqtSignal()
    def mouseDoubleClickEvent(self, event):
        self.doubleClicked.emit()

class ClipboardImageApp(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("클립보드 이미지 저장기")
        self.setGeometry(300, 300, 800, 900)
        self.setWindowFlags(self.windowFlags() | Qt.WindowStaysOnTopHint)
        self.max_width = DEFAULT_MAX_WIDTH
        self.current_post_filepath = None

        layout = QVBoxLayout()

        # 글 제목 입력 + 생성 버튼
        title_hbox = QHBoxLayout()
        self.title_input = QLineEdit()
        self.title_input.setPlaceholderText("글 제목 입력")
        self.create_button = QPushButton("글 생성")
        self.create_button.clicked.connect(self.create_hexo_post)
        title_hbox.addWidget(self.title_input)
        title_hbox.addWidget(self.create_button)
        layout.addLayout(title_hbox)

        # 현재 선택된 글, 최대폭, 절대경로 체크
        status_hbox = QHBoxLayout()
        self.selected_post_label = QLabel("현재 선택된 글: (없음)")
        self.width_input = QLineEdit(str(DEFAULT_MAX_WIDTH))
        self.width_input.setFixedWidth(80)
        self.absolute_checkbox = QCheckBox("절대경로")
        self.absolute_checkbox.setChecked(False)
        status_hbox.addWidget(self.selected_post_label)
        status_hbox.addStretch()
        status_hbox.addWidget(self.width_input)
        status_hbox.addWidget(self.absolute_checkbox)
        layout.addLayout(status_hbox)

        # 글 리스트
        layout.addWidget(QLabel("글 리스트 (더블클릭 시 선택됨):"))
        self.post_listwidget = QListWidget()
        self.post_listwidget.itemDoubleClicked.connect(self.select_post_from_list)
        layout.addWidget(self.post_listwidget)

        # 이미지 설명
        layout.addWidget(QLabel("이미지 설명"))
        self.desc_input = QLineEdit()
        layout.addWidget(self.desc_input)

        # 이미지 붙여넣기
        layout.addWidget(QLabel("이미지 붙여넣기"))
        self.textarea = QLineEdit()
        self.textarea.installEventFilter(self)
        layout.addWidget(self.textarea)

        # 이미지 리스트
        layout.addWidget(QLabel("이미지 리스트 (최대 50개):"))
        self.listwidget = QListWidget()
        layout.addWidget(self.listwidget)

        self.setLayout(layout)
        self.saved_files = []
        self.load_post_list()
        self.load_image_list()

    def create_hexo_post(self):
        title = self.title_input.text().strip()
        if not title:
            self.show_message("⚠️ 제목을 입력하세요.")
            return
        try:
            result = subprocess.run(
                ["hexo", "uniqpost", title],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                encoding='utf-8',
                shell=True
            )
            if result.returncode == 0:
                slug = title.strip().lower().replace(' ', '-')
                for f in os.listdir(POST_DIR):
                    if f.endswith(".md") and slug in f:
                        self.current_post_filepath = os.path.join(POST_DIR, f)
                        break
                self.selected_post_label.setText(f"현재 선택된 글: {os.path.basename(self.current_post_filepath)}")
                self.load_post_list()
                self.show_message(f"✅ 글 생성됨: {title}")
            else:
                self.show_message(f"❌ 실패: {result.stderr.strip()}")
        except Exception as e:
            self.show_message(f"⚠️ 에러 발생: {str(e)}")

    def show_message(self, text, timeout=3000):
        self.setWindowTitle(text)
        QTimer.singleShot(timeout, lambda: self.setWindowTitle("클립보드 이미지 저장기"))

    def select_post_from_list(self, item):
        filename = item.text().split()[0].strip()
        full_path = os.path.join(POST_DIR, filename)
        if os.path.exists(full_path):
            self.current_post_filepath = full_path
            self.selected_post_label.setText(f"현재 선택된 글: {filename}")
            self.show_message(f"📝 현재 글 선택됨: {filename}")

    def load_post_list(self):
        self.post_listwidget.clear()
        if not os.path.exists(POST_DIR):
            return
        for f in sorted(os.listdir(POST_DIR)):
            if f.endswith('.md') and len(f.split('.')[0]) == 6:
                full_path = os.path.join(POST_DIR, f)
                title = self.extract_title_from_md(full_path)
                item = QListWidgetItem(f"{f}    {title}")
                self.post_listwidget.addItem(item)

    def extract_title_from_md(self, file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                in_front_matter = False
                for line in f:
                    line = line.strip()
                    if line == '---':
                        if not in_front_matter:
                            in_front_matter = True
                            continue
                        else:
                            break
                    if in_front_matter and line.lower().startswith('title:'):
                        return line[6:].strip()
        except:
            pass
        return ''

    def eventFilter(self, source, event):
        if event.type() == event.KeyPress and source is self.textarea:
            if event.matches(QKeySequence.Paste):
                try:
                    self.max_width = int(self.width_input.text())
                except ValueError:
                    self.max_width = DEFAULT_MAX_WIDTH
                filename = save_clipboard_image(self.max_width)
                if filename:
                    self.saved_files.append(filename)
                    self.load_image_list()
                    self.append_image_to_post(filename)
                else:
                    self.show_message("⚠️ 클립보드에 이미지가 없습니다.")
        return super().eventFilter(source, event)

    def load_image_list(self):
        self.listwidget.clear()
        if not os.path.exists(SAVE_DIR):
            return
        files = [f for f in os.listdir(SAVE_DIR) if len(f) == 10 and f.endswith('.jpg')]
        files.sort(key=lambda f: os.path.getmtime(os.path.join(SAVE_DIR, f)), reverse=True)
        files = files[:50]

        for filename in files:
            full_path = os.path.join(SAVE_DIR, filename)
            item = QListWidgetItem(filename)
            widget = QWidget()
            hbox = QHBoxLayout()
            img_label = ClickableLabel()
            pixmap = QPixmap(full_path)
            pixmap = pixmap.scaled(120, 120, Qt.KeepAspectRatio, Qt.SmoothTransformation)
            img_label.setPixmap(pixmap)
            img_label.doubleClicked.connect(lambda f=filename: self.append_image_to_post(f))
            hbox.addWidget(img_label)
            text_label = QLabel(filename)
            hbox.addWidget(text_label)
            del_btn = QPushButton("삭제")
            del_btn.setFixedWidth(60)
            del_btn.clicked.connect(lambda _, f=filename: self.delete_image(f))
            hbox.addWidget(del_btn)
            hbox.setContentsMargins(0, 0, 0, 0)
            widget.setLayout(hbox)
            item.setSizeHint(widget.sizeHint())
            self.listwidget.addItem(item)
            self.listwidget.setItemWidget(item, widget)

    def append_image_to_post(self, filename):
        if not self.current_post_filepath or not os.path.exists(self.current_post_filepath):
            self.show_message("⚠️ 먼저 글을 선택하거나 생성하세요.")
            return
        desc = self.desc_input.text().strip()
        # 설명 없으면 이미지 파일 생성 시간 사용
        if not desc:
            image_path = os.path.join(SAVE_DIR, filename)
            try:
                t = os.path.getmtime(image_path)
                desc = datetime.datetime.fromtimestamp(t).strftime('%Y-%m-%d %H:%M:%S')
            except Exception:
                desc = filename
        path = f"/images/{filename}" if self.absolute_checkbox.isChecked() else f"../images/{filename}"
        md_text = f"- {desc}\n\n![]({path})\n\n"
        try:
            with open(self.current_post_filepath, 'a', encoding='utf-8') as f:
                f.write(md_text)
            self.show_message(f"📝 이미지 추가됨: {filename}")
        except Exception as e:
            self.show_message(f"⚠️ 글 저장 실패: {str(e)}")

    def delete_image(self, filename):
        path = os.path.join(SAVE_DIR, filename)
        if os.path.exists(path):
            os.remove(path)
            self.show_message(f"🗑️ 삭제됨: {filename}")
            self.load_image_list()

def generate_filename():
    first = random.choice(string.ascii_lowercase)
    rest = ''.join(random.choices(string.ascii_lowercase + string.digits, k=5))
    return first + rest + '.jpg'

def add_watermark(image, text="https://goodsaem.github.io/"):
    draw = ImageDraw.Draw(image)
    width, height = image.size
    try:
        font = ImageFont.truetype("arial.ttf", 12)  # 글씨 크기 작게
    except IOError:
        font = ImageFont.load_default()
    x, y = 0, 0  # 좌측 상단 위치
    draw.rectangle([(x, y), (x + 200, y + 20)], fill=(0, 0, 0))
    draw.text((x + 5, y + 2), text, font=font, fill=(255, 255, 255))
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
    window = ClipboardImageApp()
    window.show()
    sys.exit(app.exec_())
