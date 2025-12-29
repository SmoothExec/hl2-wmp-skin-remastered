from PIL import Image
import numpy as np
import zipfile
import io
import os

wmz = r'G:\Projects\HL2 WMP Remastered\hl2_wmp_skin.wmz'
extracted = r'G:\Projects\HL2 WMP Remastered\extracted'

def fix_pink_edges(fname):
    path = os.path.join(extracted, fname)
    if not os.path.exists(path):
        return 0

    with zipfile.ZipFile(wmz, 'r') as zf:
        try:
            orig = np.array(Image.open(io.BytesIO(zf.read(fname))).convert('RGBA'))
        except:
            return 0

    curr = np.array(Image.open(path).convert('RGBA'))

    if orig.shape[0] != curr.shape[0] or orig.shape[1] != curr.shape[1]:
        return 0

    orig_mag = (orig[:,:,0] == 255) & (orig[:,:,1] == 0) & (orig[:,:,2] == 255)

    if np.sum(orig_mag) == 0:
        return 0

    # Restore original magenta areas
    curr[orig_mag] = [255, 0, 255, 255]

    # Find pink-tinted pixels
    r, g, b = curr[:,:,0].astype(int), curr[:,:,1].astype(int), curr[:,:,2].astype(int)
    pink_tint = (r > 120) & (b > 120) & (r > g + 30) & (b > g + 30) & ~orig_mag

    # Dilate magenta mask to find adjacent pixels
    padded = np.pad(orig_mag, 1, mode='constant', constant_values=False)
    dilated = (padded[:-2,:-2] | padded[:-2,1:-1] | padded[:-2,2:] |
               padded[1:-1,:-2] | padded[1:-1,1:-1] | padded[1:-1,2:] |
               padded[2:,:-2] | padded[2:,1:-1] | padded[2:,2:])

    pink_near_edge = pink_tint & dilated
    curr[pink_near_edge] = [255, 0, 255, 255]

    fixed = np.sum(pink_near_edge)
    if fixed > 0:
        orig_img = Image.open(path)
        orig_mode = orig_img.mode
        result = Image.fromarray(curr, 'RGBA')
        if orig_mode == 'RGB':
            result = result.convert('RGB')
        result.save(path, 'PNG')

    return fixed

total = 0
for f in os.listdir(extracted):
    if f.endswith('.png') and not f.endswith('_upscaled.png'):
        fixed = fix_pink_edges(f)
        if fixed > 0:
            print(f'{f}: fixed {fixed} pink pixels')
            total += fixed

print(f'Total fixed: {total}')
