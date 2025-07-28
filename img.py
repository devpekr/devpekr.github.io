import sys
import os
import random
import string
import subprocess
from PyQt5.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QLabel,
    QListWidget, QPushButton, QListWidgetItem,
    QHBoxLayout, QLineEdit, QCheckBox, QScrollArea,
    QGridLayout
)
from PyQt5.QtGui import QPixmap, QKeySequence
from PyQt5.QtCore import Qt, QTimer, pyqtSignal
from PIL import ImageGrab, ImageDraw, ImageFont, Image
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
        self.image_desc_counter = 1  # 설명 자동 숫자 시작값

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

        # 이미지 리스트 (그리드)
        layout.addWidget(QLabel("이미지 리스트 (최대 50개):"))
        self.scroll_area = QScrollArea()
        self.scroll_area_widget = QWidget()
        self.image_grid_layout = QGridLayout(self.scroll_area_widget)
        self.scroll_area.setWidgetResizable(True)
        self.scroll_area.setWidget(self.scroll_area_widget)
        layout.addWidget(self.scroll_area)

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
            self.image_desc_counter = 1  # 새 글 선택하면 번호 초기화
            self.show_message(f"📝 현재 글 선택됨: {filename}")

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
            item = QListWidgetItem(f"{f}    {title}")
            self.post_listwidget.addItem(item)

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
            vbox = QVBoxLayout()
            container = QWidget()
            container.setLayout(vbox)

            img_label = ClickableLabel()
            pixmap = QPixmap(full_path)
            pixmap = pixmap.scaled(180, 180, Qt.KeepAspectRatio, Qt.SmoothTransformation)
            img_label.setPixmap(pixmap)
            img_label.setAlignment(Qt.AlignCenter)
            img_label.doubleClicked.connect(lambda f=filename: self.append_image_to_post(f))
            vbox.addWidget(img_label)

            del_btn = QPushButton("삭제")
            del_btn.setFixedWidth(60)
            del_btn.clicked.connect(lambda _, f=filename: self.delete_image(f))
            vbox.addWidget(del_btn, alignment=Qt.AlignCenter)

            self.image_grid_layout.addWidget(container, row, col)
            col += 1
            if col >= 3:
                col = 0
                row += 1

    def append_image_to_post(self, filename):
        if not self.current_post_filepath or not os.path.exists(self.current_post_filepath):
            self.show_message("⚠️ 먼저 글을 선택하거나 생성하세요.")
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

        path = f"/images/{filename}" if self.absolute_checkbox.isChecked() else f"../images/{filename}"
        md_text = f"{desc}\n\n![]({path})\n\n"

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
        font = ImageFont.truetype("arial.ttf", 12)
    except IOError:
        font = ImageFont.load_default()

    # 우측 상단 위치: 텍스트 너비, 높이 계산 후 위치 지정
    text_width, text_height = draw.textsize(text, font=font)
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
    window = ClipboardImageApp()
    window.show()
    sys.exit(app.exec_())
