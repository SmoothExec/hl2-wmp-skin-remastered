"""
Aggressive pink/magenta artifact cleanup for HL2 WMP skin.
More aggressive thresholds and multiple dilation passes.
"""
from PIL import Image
import numpy as np
import zipfile
import io
import os

wmz = r'G:\Projects\HL2 WMP Remastered\hl2_wmp_skin.wmz'
extracted = r'G:\Projects\HL2 WMP Remastered\extracted'

# Files that MUST NOT be modified (use originals only)
SKIP_FILES = {'m_transparency.png', 'm_meta.png'}

# Priority files to focus on
PRIORITY_FILES = [
    'main_back.png',
    'm_logo_do.png',
    'm_logo_no.png',
    'shutter_f01.png',
    'shutter_f02.png',
    'shutter_f03.png',
    'shutter_f04.png',
    'shutter_f05.png',
    'shutter_f06.png',
    'shutter_f07.png',
    'shutter_f08.png',
    'shutter_f09.png',
    'shutter_static.png',
    'shutter_out_open_static.png',
    'm_pause_do.png',
    'm_pause_no.png',
    'm_trans_do.png',
    'm_trans_no.png',
    'm_min_do.png',
    'm_min_no.png',
    'm_win_do.png',
    'm_win_no.png',
    'm_open_do.png',
    'm_open_no.png',
    'm_mute_do.png',
    'm_mute_no.png',
    'm_shutter_do.png',
    'm_shutter_no.png',
]


def dilate_mask(mask, iterations=1):
    """Dilate a boolean mask by given iterations."""
    result = mask.copy()
    for _ in range(iterations):
        padded = np.pad(result, 1, mode='constant', constant_values=False)
        result = (padded[:-2,:-2] | padded[:-2,1:-1] | padded[:-2,2:] |
                  padded[1:-1,:-2] | padded[1:-1,1:-1] | padded[1:-1,2:] |
                  padded[2:,:-2] | padded[2:,1:-1] | padded[2:,2:])
    return result


def fix_pink_edges_aggressive(fname, threshold_r=100, threshold_b=100, diff_threshold=20, dilation_passes=3):
    """
    More aggressive pink cleanup.

    Args:
        fname: filename to process
        threshold_r: minimum red value for pink detection (lower = more aggressive)
        threshold_b: minimum blue value for pink detection (lower = more aggressive)
        diff_threshold: how much r and b must exceed g (lower = more aggressive)
        dilation_passes: how many pixels away from magenta to clean (higher = more aggressive)
    """
    if fname in SKIP_FILES:
        return 0, "SKIPPED (protected file)"

    path = os.path.join(extracted, fname)
    if not os.path.exists(path):
        return 0, "not found"

    # Load original from WMZ to get exact magenta boundaries
    with zipfile.ZipFile(wmz, 'r') as zf:
        try:
            orig = np.array(Image.open(io.BytesIO(zf.read(fname))).convert('RGBA'))
        except:
            return 0, "not in original wmz"

    curr = np.array(Image.open(path).convert('RGBA'))

    if orig.shape[0] != curr.shape[0] or orig.shape[1] != curr.shape[1]:
        return 0, "size mismatch"

    # Original magenta mask
    orig_mag = (orig[:,:,0] == 255) & (orig[:,:,1] == 0) & (orig[:,:,2] == 255)

    if np.sum(orig_mag) == 0:
        return 0, "no magenta in original"

    # Step 1: Restore any pixels that were magenta in original
    restored = np.sum(~((curr[:,:,0] == 255) & (curr[:,:,1] == 0) & (curr[:,:,2] == 255)) & orig_mag)
    curr[orig_mag] = [255, 0, 255, 255]

    # Step 2: Find pink-tinted pixels with more aggressive thresholds
    r, g, b = curr[:,:,0].astype(int), curr[:,:,1].astype(int), curr[:,:,2].astype(int)

    # Pink detection: high red + high blue, significantly higher than green
    pink_tint = (r > threshold_r) & (b > threshold_b) & (r > g + diff_threshold) & (b > g + diff_threshold) & ~orig_mag

    # Step 3: Dilate magenta mask multiple times to find nearby pixels
    dilated = dilate_mask(orig_mag, iterations=dilation_passes)

    # Step 4: Convert pink pixels near magenta edges to pure magenta
    pink_near_edge = pink_tint & dilated
    curr[pink_near_edge] = [255, 0, 255, 255]

    fixed = np.sum(pink_near_edge)

    # Step 5: Also fix "almost magenta" pixels (very close to magenta but not quite)
    almost_mag = ((curr[:,:,0] > 230) & (curr[:,:,1] < 50) & (curr[:,:,2] > 230) &
                  ~orig_mag & ~pink_near_edge)
    almost_near_edge = almost_mag & dilated
    curr[almost_near_edge] = [255, 0, 255, 255]
    fixed += np.sum(almost_near_edge)

    if fixed > 0 or restored > 0:
        orig_img = Image.open(path)
        orig_mode = orig_img.mode
        result = Image.fromarray(curr, 'RGBA')
        if orig_mode == 'RGB':
            result = result.convert('RGB')
        result.save(path, 'PNG')

    return fixed + restored, f"fixed {fixed} pink, restored {restored} magenta"


def analyze_pink_pixels(fname):
    """Analyze pink pixel distribution in a file for debugging."""
    if fname in SKIP_FILES:
        return

    path = os.path.join(extracted, fname)
    if not os.path.exists(path):
        return

    with zipfile.ZipFile(wmz, 'r') as zf:
        try:
            orig = np.array(Image.open(io.BytesIO(zf.read(fname))).convert('RGBA'))
        except:
            return

    curr = np.array(Image.open(path).convert('RGBA'))

    if orig.shape != curr.shape:
        return

    orig_mag = (orig[:,:,0] == 255) & (orig[:,:,1] == 0) & (orig[:,:,2] == 255)

    r, g, b = curr[:,:,0].astype(int), curr[:,:,1].astype(int), curr[:,:,2].astype(int)

    # Various pink detection levels
    pink_strict = (r > 150) & (b > 150) & (r > g + 50) & (b > g + 50) & ~orig_mag
    pink_medium = (r > 120) & (b > 120) & (r > g + 30) & (b > g + 30) & ~orig_mag
    pink_loose = (r > 100) & (b > 100) & (r > g + 20) & (b > g + 20) & ~orig_mag

    print(f"  {fname}:")
    print(f"    Original magenta pixels: {np.sum(orig_mag)}")
    print(f"    Pink (strict r>150, diff>50): {np.sum(pink_strict)}")
    print(f"    Pink (medium r>120, diff>30): {np.sum(pink_medium)}")
    print(f"    Pink (loose r>100, diff>20): {np.sum(pink_loose)}")


def main():
    print("=" * 60)
    print("Aggressive Pink Artifact Cleanup")
    print("=" * 60)

    # First analyze priority files
    print("\n=== Analyzing priority files ===")
    for fname in PRIORITY_FILES:
        analyze_pink_pixels(fname)

    # Then fix with aggressive settings
    print("\n=== Fixing with aggressive settings ===")
    print("Settings: threshold_r=100, threshold_b=100, diff=20, dilation=3")

    total_fixed = 0

    # Process priority files first
    for fname in PRIORITY_FILES:
        fixed, msg = fix_pink_edges_aggressive(
            fname,
            threshold_r=100,
            threshold_b=100,
            diff_threshold=20,
            dilation_passes=3
        )
        if fixed > 0:
            print(f"  {fname}: {msg}")
            total_fixed += fixed

    # Process all other PNGs
    print("\n=== Processing remaining PNGs ===")
    for f in os.listdir(extracted):
        if f.endswith('.png') and not f.endswith('_upscaled.png') and f not in PRIORITY_FILES:
            fixed, msg = fix_pink_edges_aggressive(
                f,
                threshold_r=100,
                threshold_b=100,
                diff_threshold=20,
                dilation_passes=3
            )
            if fixed > 0:
                print(f"  {f}: {msg}")
                total_fixed += fixed

    print(f"\n=== Total pixels fixed: {total_fixed} ===")


if __name__ == '__main__':
    main()
