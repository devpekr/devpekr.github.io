import sys
import os
import random
import string
from PyQt5.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QLabel,
    QListWidget, QTextEdit
)
from PyQt5.QtCore import Qt, QTimer
from PyQt5.QtGui import QKeySequence
from PIL import ImageGrab, ImageDraw, ImageFont
import pyperclip

SAVE_DIR = './source/images'

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

    # 텍스트 위치와 크기 계산
    bbox = draw.textbbox((0, 0), text, font=font)
    textwidth = bbox[2] - bbox[0]
    textheight = bbox[3] - bbox[1]

    margin = 10
    x = width - textwidth - margin
    y = height - textheight - margin

    # ✅ 검은색 배경 박스 (불투명)
    draw.rectangle(
        [(x - 5, y - 2), (x + textwidth + 5, y + textheight + 2)],
        fill=(0, 0, 0)
    )

    # ✅ 텍스트 (흰색)
    draw.text((x, y), text, font=font, fill=(255, 255, 255))

    return image

def save_clipboard_image():
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

    image = image.convert("RGB")  # JPEG 저장을 위한 RGB 변환
    image = add_watermark(image)  # 워터마크 추가
    image.save(path, 'JPEG', quality=65, optimize=True)  # ✅ 품질 낮춤
    return filename

class ClipboardImageApp(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("클립보드 이미지 저장기")
        self.setGeometry(300, 300, 400, 500)

        layout = QVBoxLayout()

        self.status_label = QLabel()
        layout.addWidget(self.status_label)

        self.textarea = QTextEdit()
        self.textarea.setPlaceholderText("Ctrl+V 또는 여기에 붙여넣기")
        self.textarea.installEventFilter(self)
        layout.addWidget(self.textarea)

        self.listwidget = QListWidget()
        self.listwidget.itemDoubleClicked.connect(self.copy_filename)
        layout.addWidget(self.listwidget)

        self.setLayout(layout)
        self.saved_files = []  # 붙여넣기로 저장된 파일만 추적

    def show_message(self, text, timeout=3000):
        self.status_label.setText(text)
        QTimer.singleShot(timeout, lambda: self.status_label.setText(""))

    def eventFilter(self, source, event):
        if event.type() == event.KeyPress and source is self.textarea:
            if event.matches(QKeySequence.Paste):
                filename = save_clipboard_image()
                if filename:
                    self.saved_files.append(filename)
                    self.listwidget.addItem(filename)
                    self.show_message(f"✅ 이미지 저장됨: {filename}")
                else:
                    self.show_message("⚠️ 클립보드에 이미지가 없습니다.")
        return super().eventFilter(source, event)

    def copy_filename(self, item):
        cn = f"![https://goodsaem.github.io/](../../images/{item.text()})"
        pyperclip.copy(cn)
        self.show_message(f"📋 복사됨: {cn}")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = ClipboardImageApp()
    window.show()
    sys.exit(app.exec_())
