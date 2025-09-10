import os
import re
import markdown

INCLUDES_DIR = "../source/_includes"
POSTS_DIR = "../source/_posts"
OUTPUT_DIR = "./source/_prebuild"

def load_includes():
    include_map = {}
    for filename in os.listdir(INCLUDES_DIR):
        if filename.endswith(".md"):
            key = os.path.splitext(filename)[0]
            with open(os.path.join(INCLUDES_DIR, filename), encoding="utf-8") as f:
                html = markdown.markdown(f.read())
                include_map[key] = html
    return include_map

def process_posts(include_map):
    for root, _, files in os.walk(POSTS_DIR):  # ⬅ 하위 디렉토리까지 탐색
        for filename in files:
            if not filename.endswith(".md"):
                continue
            full_path = os.path.join(root, filename)
            with open(full_path, encoding="utf-8") as f:
                content = f.read()

            def replacer(match):
                key = match.group(1).strip()
                return include_map.get(key, f"<!-- include not found: {key} -->")

            converted = re.sub(r"{%\s*include\s+([\w\-]+)\s*%}", replacer, content)

            # ✅ 기존 상대 경로 유지하며 저장 (확장자 .html)
            rel_path = os.path.relpath(full_path, POSTS_DIR)
            rel_html_path = os.path.splitext(rel_path)[0] + ".html"
            out_path = os.path.join(OUTPUT_DIR, rel_html_path)

            os.makedirs(os.path.dirname(out_path), exist_ok=True)
            with open(out_path, "w", encoding="utf-8") as outf:
                outf.write(converted)

            print(f"✔ {rel_path} → {rel_html_path}")


if __name__ == "__main__":
    imap = load_includes()
    process_posts(imap)
