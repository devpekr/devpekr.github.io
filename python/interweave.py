import os
import shutil
import re

def natural_sort_key(s):
    return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', s)]

def interweave_directories(left_dir, right_dir, dest_dir):
    # Ensure source directories exist
    if not os.path.exists(left_dir):
        print(f"Error: Left directory '{left_dir}' does not exist.")
        return False
    if not os.path.exists(right_dir):
        print(f"Error: Right directory '{right_dir}' does not exist.")
        return False

    # Create destination directory
    os.makedirs(dest_dir, exist_ok=True)
    print(f"Destination directory initialized at: '{dest_dir}'")

    # Get PNG files from both directories and sort them naturally
    left_files = sorted([f for f in os.listdir(left_dir) if f.lower().endswith('.png')], key=natural_sort_key)
    right_files = sorted([f for f in os.listdir(right_dir) if f.lower().endswith('.png')], key=natural_sort_key)

    total_left = len(left_files)
    total_right = len(right_files)
    max_len = max(total_left, total_right)

    print(f"Left files: {total_left}, Right files: {total_right}")

    copied_count = 0
    for i in range(max_len):
        # Left file -> odd numbers: 1, 3, 5, 7, ...
        if i < total_left:
            src_left = os.path.join(left_dir, left_files[i])
            # Format filename to be 3-digit padded (e.g. 001.png, 003.png)
            dest_index = 2 * i + 1
            dest_name = f"{dest_index:03d}.png"
            dest_path = os.path.join(dest_dir, dest_name)
            shutil.copy2(src_left, dest_path)
            copied_count += 1

        # Right file -> even numbers: 2, 4, 6, 8, ...
        if i < total_right:
            src_right = os.path.join(right_dir, right_files[i])
            # Format filename to be 3-digit padded (e.g. 002.png, 004.png)
            dest_index = 2 * (i + 1)
            dest_name = f"{dest_index:03d}.png"
            dest_path = os.path.join(dest_dir, dest_name)
            shutil.copy2(src_right, dest_path)
            copied_count += 1

    print(f"Successfully copied and interweaved {copied_count} files into '{dest_dir}'")
    return True

if __name__ == "__main__":
    left = r"c:\coffeeman1\python\claude\left"
    right = r"c:\coffeeman1\python\claude\right"
    org = r"c:\coffeeman1\python\claude\org"

    interweave_directories(left, right, org)
