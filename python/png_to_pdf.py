import os
import sys
import re
from PIL import Image

def natural_sort_key(s):
    """
    Sorts strings containing numbers in a human-friendly (natural) way.
    e.g., 'file2.png' comes before 'file10.png'.
    """
    return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', s)]

def pngs_to_pdf(input_dir, output_pdf=None):
    """
    Converts all PNG files in a given directory into a single PDF file.
    """
    if not os.path.isdir(input_dir):
        print(f"Error: Directory '{input_dir}' does not exist.")
        return False

    # Get absolute path
    input_dir = os.path.abspath(input_dir)

    # Find PNG files (case-insensitive suffix check)
    png_files = [f for f in os.listdir(input_dir) if f.lower().endswith('.png')]

    if not png_files:
        print(f"No PNG files found in '{input_dir}'.")
        return False

    # Sort files naturally
    png_files.sort(key=natural_sort_key)

    print(f"Found {len(png_files)} PNG files to convert:")
    for idx, f in enumerate(png_files, 1):
        print(f"  {idx}. {f}")

    # Set default output path if not provided
    if not output_pdf:
        dir_name = os.path.basename(input_dir)
        if not dir_name:  # Fallback for root or trailing slash cases
            dir_name = "output"
        output_pdf = os.path.join(input_dir, f"{dir_name}.pdf")
    else:
        output_pdf = os.path.abspath(output_pdf)

    images = []
    first_image = None

    try:
        for file in png_files:
            file_path = os.path.join(input_dir, file)
            img = Image.open(file_path)
            
            # Convert RGBA/P mode to RGB as PDF format does not support transparency/RGBA modes
            if img.mode in ("RGBA", "LA", "P"):
                # Create a white background template to preserve transparency visibility
                background = Image.new("RGB", img.size, (255, 255, 255))
                if img.mode == "RGBA":
                    background.paste(img, mask=img.split()[3]) # 3 is the alpha channel
                elif img.mode == "LA":
                    background.paste(img, mask=img.split()[1]) # 1 is the alpha channel
                else:
                    background.paste(img.convert("RGBA"), mask=img.convert("RGBA").split()[3])
                img = background
            elif img.mode != "RGB":
                img = img.convert("RGB")
                
            if not first_image:
                first_image = img
            else:
                images.append(img)

        if first_image:
            first_image.save(output_pdf, "PDF", save_all=True, append_images=images)
            print(f"\nSuccess! Saved PDF to '{output_pdf}'")
            return True
    except Exception as e:
        print(f"\nAn error occurred during conversion: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python png_to_pdf.py <directory_path> [output_pdf_path]")
        sys.exit(1)

    in_dir = sys.argv[1]
    out_pdf = sys.argv[2] if len(sys.argv) > 2 else None
    
    pngs_to_pdf(in_dir, out_pdf)
