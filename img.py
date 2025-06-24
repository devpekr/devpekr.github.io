import sys
import os
import random
import string
from PyQt5.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QLabel,
    QListWidget, QTextEdit, QPushButton, QListWidgetItem,
    QHBoxLayout, QLineEdit, QCheckBox
)
from PyQt5.QtGui import QPixmap, QKeySequence
from PyQt5.QtCore import Qt, QTimer, pyqtSignal
from PIL import ImageGrab, ImageDraw, ImageFont, Image
import pyperclip

SAVE_DIR = './source/images'
DEFAULT_MAX_WIDTH = 800

# pyinstaller --noconsole --onefile img.py

class ClickableLabel(QLabel):
    doubleClicked = pyqtSignal()
    def mouseDoubleClickEvent(self, event):
        self.doubleClicked.emit()

class ClipboardImageApp(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("클립보드 이미지 저장기")
        self.setGeometry(300, 300, 800, 800)
        self.max_width = DEFAULT_MAX_WIDTH

        layout = QVBoxLayout()

        self.status_label = QLabel()
        layout.addWidget(self.status_label)

        # 상단: 최대폭 입력창 + 체크박스
        self.width_input = QLineEdit(str(DEFAULT_MAX_WIDTH))
        self.width_input.setPlaceholderText("최대 이미지 폭 (예: 800)")

        self.absolute_checkbox = QCheckBox()
        self.absolute_checkbox.setChecked(False)

        self.absolute_label = QLabel("절대경로")
        self.absolute_label.mousePressEvent = lambda event: self.absolute_checkbox.toggle()

        top_hbox = QHBoxLayout()
        top_hbox.addWidget(self.width_input)
        top_hbox.addWidget(self.absolute_checkbox)
        top_hbox.addWidget(self.absolute_label)
        layout.addLayout(top_hbox)

        self.textarea = QTextEdit()
        self.textarea.setPlaceholderText("Ctrl+V 또는 여기에 붙여넣기")
        self.textarea.setFixedHeight(80)
        self.textarea.installEventFilter(self)
        layout.addWidget(self.textarea)

        self.listwidget = QListWidget()
        layout.addWidget(self.listwidget)

        self.setLayout(layout)
        self.saved_files = []

        self.load_image_list()

    def show_message(self, text, timeout=3000):
        self.status_label.setText(text)
        QTimer.singleShot(timeout, lambda: self.status_label.setText(""))

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
                    self.show_message(f"✅ 이미지 저장됨: {filename}")
                else:
                    self.show_message("⚠️ 클립보드에 이미지가 없습니다.")
        return super().eventFilter(source, event)

    def copy_image_to_clipboard(self, image_path):
        image = QPixmap(image_path)
        QApplication.clipboard().setPixmap(image)
        self.show_message("🖼️ 이미지가 클립보드에 복사되었습니다.")

    def copy_filepath_to_clipboard(self, filename):
        if self.absolute_checkbox.isChecked():
            path = f"/images/{filename}"
        else:
            path = f"../../images/{filename}"
        path_text = f"![]({path})"
        pyperclip.copy(path_text)
        self.show_message(f"📋 경로가 복사되었습니다: {filename}")

    def load_image_list(self):
        self.listwidget.clear()
        if not os.path.exists(SAVE_DIR):
            return

        files = [f for f in os.listdir(SAVE_DIR) if len(f) == 10 and f.endswith('.jpg')]
        files.sort(key=lambda f: os.path.getmtime(os.path.join(SAVE_DIR, f)), reverse=True)

        for filename in files:
            full_path = os.path.join(SAVE_DIR, filename)
            item = QListWidgetItem(filename)
            widget = QWidget()
            hbox = QHBoxLayout()

            img_label = ClickableLabel()
            pixmap = QPixmap(full_path)
            pixmap = pixmap.scaled(120, 120, Qt.KeepAspectRatio, Qt.SmoothTransformation)
            img_label.setPixmap(pixmap)
            img_label.doubleClicked.connect(lambda f=full_path: self.copy_image_to_clipboard(f))
            hbox.addWidget(img_label)

            img = Image.open(full_path)
            w, h = img.size
            text_label = ClickableLabel(f"{filename} ({w}x{h})")
            font = text_label.font()
            font.setBold(True)
            text_label.setFont(font)
            text_label.doubleClicked.connect(lambda f=filename: self.copy_filepath_to_clipboard(f))
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

    def delete_image(self, filename):
        path = os.path.join(SAVE_DIR, filename)
        if os.path.exists(path):
            os.remove(path)
            self.show_message(f"🗑️ 삭제됨: {filename}")
            self.load_image_list()

# =======================
# 이미지 관련 함수들
# =======================

def generate_filename():
    first = random.choice(string.ascii_lowercase)
    rest = ''.join(random.choices(string.ascii_lowercase + string.digits, k=5))
    return first + rest + '.jpg'

def add_watermark(image, text="https://goodsaem.github.io/"):
    draw = ImageDraw.Draw(image)
    width, height = image.size
    try:
        font = ImageFont.truetype("arial.ttf", 16)
    except IOError:
        font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), text, font=font)
    textwidth = bbox[2] - bbox[0]
    textheight = bbox[3] - bbox[1]
    margin = 10
    x = width - textwidth - margin
    y = height - textheight - margin
    draw.rectangle(
        [(x - 5, y - 2), (x + textwidth + 5, y + textheight + 2)],
        fill=(0, 0, 0)
    )
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

# =======================
# 실행
# =======================

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = ClipboardImageApp()
    window.show()
    sys.exit(app.exec_())
