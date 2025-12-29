"""
Half-Life 2 WMP Skin Modernization Script
- 60 FPS timing updates
- AI upscaling with magenta preservation
- Hit-map verification
- Final WMZ build
"""

import os
import glob
import zipfile
import subprocess
from PIL import Image
import numpy as np

# Configuration - relative to script directory
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
EXTRACTED_DIR = os.path.join(SCRIPT_DIR, 'extracted')
OUTPUT_WMZ = os.path.join(SCRIPT_DIR, 'hl2_wmp_skin_FINAL.wmz')
REALESRGAN_PATH = os.path.join(SCRIPT_DIR, 'realesrgan', 'realesrgan-ncnn-vulkan.exe')


def update_wms_timing():
    """Update hl2_se.wms timing values for 60 FPS (UTF-16 encoded)."""
    print("=== Updating hl2_se.wms timing ===")
    wms_path = os.path.join(EXTRACTED_DIR, 'hl2_se.wms')

    with open(wms_path, 'rb') as f:
        content = f.read().decode('utf-16')

    original = content
    content = content.replace('timerInterval="100"', 'timerInterval="16"')
    content = content.replace('timerInterval="1500"', 'timerInterval="1000"')
    content = content.replace('scrollingDelay="80"', 'scrollingDelay="16"')
    content = content.replace('scrollingAmount="2"', 'scrollingAmount="3"')

    if content != original:
        with open(wms_path, 'wb') as f:
            f.write(content.encode('utf-16'))
        print("  Updated timing values")
    else:
        print("  No changes needed")


def update_js_timing():
    """Update hl2.js timing values for 60 FPS (latin-1 encoded)."""
    print("=== Updating hl2.js timing ===")
    js_path = os.path.join(EXTRACTED_DIR, 'hl2.js')

    with open(js_path, 'r', encoding='latin-1') as f:
        content = f.read()

    original = content
    content = content.replace('view.timerInterval = 100;', 'view.timerInterval = 16;')
    content = content.replace('view.TimerInterval = 1500;', 'view.TimerInterval = 1000;')
    content = content.replace('view.timerInterval = 2500;', 'view.timerInterval = 1800;')

    if content != original:
        with open(js_path, 'w', encoding='latin-1') as f:
            f.write(content)
        print("  Updated timing values")
    else:
        print("  No changes needed")


def process_gif(path):
    """Process GIF for 60 FPS (16ms frames) and play once."""
    img = Image.open(path)
    frames = []

    try:
        while True:
            frames.append(img.copy())
            img.seek(img.tell() + 1)
    except EOFError:
        pass

    if len(frames) < 2:
        return

    transparency = img.info.get('transparency', None)
    save_kwargs = {
        'save_all': True,
        'append_images': frames[1:],
        'duration': [16] * len(frames),
        'loop': 1,
        'disposal': 2
    }
    if transparency is not None:
        save_kwargs['transparency'] = transparency

    frames[0].save(path, **save_kwargs)
    print(f"  {os.path.basename(path)}: {len(frames)} frames @ 16ms")


def process_all_gifs():
    """Process all GIFs for 60 FPS."""
    print("=== Processing GIFs ===")
    for gif_path in glob.glob(os.path.join(EXTRACTED_DIR, '*.gif')):
        try:
            process_gif(gif_path)
        except Exception as e:
            print(f"  ERROR {os.path.basename(gif_path)}: {e}")


def upscale_image(path):
    """Upscale image with magenta preservation."""
    filename = os.path.basename(path)
    orig = Image.open(path).convert('RGBA')
    orig_arr = np.array(orig)
    orig_size = orig.size

    # Magenta mask
    magenta_mask = ((orig_arr[:,:,0] == 255) & (orig_arr[:,:,1] == 0) & (orig_arr[:,:,2] == 255))

    temp_out = path + '.tmp.png'
    result_img = None

    for model, scale in [('realesrgan-x4plus', 4), ('realesr-animevideov3-x2', 2)]:
        try:
            result = subprocess.run([
                REALESRGAN_PATH, '-i', path, '-o', temp_out,
                '-n', model, '-s', str(scale)
            ], capture_output=True, timeout=120)

            if result.returncode == 0 and os.path.exists(temp_out):
                upscaled = Image.open(temp_out).convert('RGBA')
                result_img = upscaled.resize(orig_size, Image.LANCZOS)
                break
        except:
            pass
        finally:
            if os.path.exists(temp_out):
                os.remove(temp_out)

    if result_img is None:
        upscaled = orig.resize((orig_size[0]*4, orig_size[1]*4), Image.LANCZOS)
        result_img = upscaled.resize(orig_size, Image.LANCZOS)

    result_arr = np.array(result_img)
    result_arr[magenta_mask] = [255, 0, 255, 255]

    # Fix near-magenta
    near_mag = ((result_arr[:,:,0] > 200) & (result_arr[:,:,1] < 100) & (result_arr[:,:,2] > 200) & ~magenta_mask)
    result_arr[near_mag] = [255, 0, 255, 255]

    Image.fromarray(result_arr, 'RGBA').save(path, 'PNG')


def upscale_all_images():
    """Upscale all PNG and JPG images."""
    print("=== AI Upscaling ===")

    for png_path in glob.glob(os.path.join(EXTRACTED_DIR, '*.png')):
        filename = os.path.basename(png_path)
        if '_map' in filename:
            continue
        print(f"  {filename}")
        try:
            upscale_image(png_path)
        except Exception as e:
            print(f"    ERROR: {e}")

    for jpg_path in glob.glob(os.path.join(EXTRACTED_DIR, '*.jpg')):
        print(f"  {os.path.basename(jpg_path)}")
        try:
            img = Image.open(jpg_path).convert('RGB')
            temp_png = jpg_path + '.tmp.png'
            img.save(temp_png, 'PNG')
            upscale_image(temp_png)
            Image.open(temp_png).convert('RGB').save(jpg_path, 'JPEG', quality=95)
            os.remove(temp_png)
        except Exception as e:
            print(f"    ERROR: {e}")


def build_wmz():
    """Build final WMZ."""
    print("=== Building WMZ ===")
    with zipfile.ZipFile(OUTPUT_WMZ, 'w', zipfile.ZIP_DEFLATED) as zf:
        for f in os.listdir(EXTRACTED_DIR):
            fpath = os.path.join(EXTRACTED_DIR, f)
            if os.path.isfile(fpath):
                zf.write(fpath, f)

    size_mb = os.path.getsize(OUTPUT_WMZ) / 1024 / 1024
    print(f"Created: hl2_wmp_skin_FINAL.wmz ({size_mb:.2f} MB)")


def main():
    print("=" * 50)
    print("HL2 WMP Skin Modernization")
    print("=" * 50)

    update_wms_timing()
    update_js_timing()
    process_all_gifs()
    upscale_all_images()
    build_wmz()

    print("\nDone!")


if __name__ == '__main__':
    main()
