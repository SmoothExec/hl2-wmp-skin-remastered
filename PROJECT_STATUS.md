# Half-Life 2 WMP Skin Remaster - Project Status

## Project Location
`G:\Projects\HL2 WMP Remastered\`

## Current State
- **Working skin**: `hl2_wmp_skin_FINAL.wmz` - functional with upscaled assets
- **Original backup**: `hl2_wmp_skin.wmz`
- **Working files**: `extracted/` folder

## Completed Work

### 1. 60 FPS Timing Updates
- **hl2_se.wms** (UTF-16): Updated `timerInterval` values (100→16 for UI, 1500→1000 for shutter delay), scrolling (delay 80→16, amount 2→3)
- **hl2.js** (latin-1): Updated timer intervals, BUT kept shutter frame animation at 100ms for proper mechanical feel

### 2. AI Upscaling
- All PNG/JPG images upscaled with Real-ESRGAN 4x, resized back to original dimensions
- Tool location: `realesrgan/realesrgan-ncnn-vulkan.exe`

### 3. Critical Fixes Applied

#### PNG Mode Fixes
- Many PNGs were converted from RGB to RGBA during upscaling - converted back to RGB to match originals
- WMP's `transparencyColor="#ff00ff"` only works correctly with original PNG modes

#### Files That CANNOT Be Upscaled (use originals)
- **m_transparency.png** - transparency overlay mask (188x188) - WMP transparency breaks if modified
- **m_meta.png** - scrolling text background (161x18) - WMP transparency breaks if modified

#### GIF Handling
- Shutter GIFs (shutter_open.gif, shutter_close.gif, etc.) kept as original byte-identical copies
- Hover GIFs (*_hov.gif) were modified for timing but transparency preserved

#### Pink Edge Artifact Cleanup
- Created `fix_pink.py` script to clean magenta bleed at edges
- Uses original as reference to restore exact magenta boundaries
- Converts pink-tinted pixels adjacent to magenta areas back to pure magenta (#ff00ff)
- Fixed 3556 pixels across 26 files

## Remaining Work

### Files Needing More Pink Cleanup
- **main_back.png** - main circular skin background, still has some pink artifacts
- **Inner logos** - likely m_logo_do.png, m_logo_no.png
- **Control elements** - buttons and UI elements

### Approach for Further Cleanup
Run `fix_pink.py` with more aggressive settings, or manually identify problem areas.

The pink artifacts occur at boundaries between image content and magenta transparency areas due to anti-aliasing during upscaling.

## Key Technical Notes

### WMP Transparency System
- Uses `transparencyColor="#ff00ff"` attribute in WMS
- Requires EXACT magenta (255, 0, 255) - no tolerance
- PNG mode matters - some files must be RGB, some RGBA (match originals)
- GIF transparency uses palette index, set on frame 0 only

### File Encodings
- **hl2_se.wms**: UTF-16 LE with BOM
- **hl2.js**: latin-1 (ISO-8859-1)

### Build Process
```python
import zipfile
import os

extracted = r'G:\Projects\HL2 WMP Remastered\extracted'
output = r'G:\Projects\HL2 WMP Remastered\hl2_wmp_skin_FINAL.wmz'

with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as zf:
    for f in os.listdir(extracted):
        if f.endswith('_upscaled.png'):
            continue
        fpath = os.path.join(extracted, f)
        if os.path.isfile(fpath):
            zf.write(fpath, f)
```

## Upscaling Process

### Step 1: AI Upscale with Real-ESRGAN
```python
# Upscale 4x then resize back to original dimensions
subprocess.run([
    'realesrgan/realesrgan-ncnn-vulkan.exe',
    '-i', input_path,
    '-o', temp_output,
    '-n', 'realesrgan-x4plus',
    '-s', '4'
])
upscaled = Image.open(temp_output).convert('RGBA')
result = upscaled.resize(original_size, Image.LANCZOS)
```

### Step 2: Magenta Preservation
```python
# Capture original magenta mask BEFORE upscaling
orig_arr = np.array(original_image)
magenta_mask = ((orig_arr[:,:,0] == 255) &
                (orig_arr[:,:,1] == 0) &
                (orig_arr[:,:,2] == 255))

# After upscaling, restore exact magenta pixels
result_arr[magenta_mask] = [255, 0, 255, 255]
```

### Step 3: PNG Mode Matching
```python
# Check original mode and save in same mode
with zipfile.ZipFile(original_wmz) as zf:
    orig = Image.open(io.BytesIO(zf.read(filename)))
    if orig.mode == 'RGB':
        result.convert('RGB').save(path, 'PNG')
    else:
        result.save(path, 'PNG')
```

## Pink Edge Cleanup Process (fix_pink.py)

### How it works:
1. Load original image from WMZ to get exact magenta boundaries
2. Load current upscaled image
3. Restore any pixels that were magenta in original
4. Find "pink-tinted" pixels (high red + high blue, low green)
5. Dilate magenta mask by 1 pixel to find edge-adjacent pixels
6. Convert pink pixels that are adjacent to magenta → pure magenta

### Detection criteria:
```python
# Pink-tinted pixels (purplish but not exact magenta)
r, g, b = curr[:,:,0], curr[:,:,1], curr[:,:,2]
pink_tint = (r > 120) & (b > 120) & (r > g + 30) & (b > g + 30) & ~orig_magenta

# Dilate magenta mask to find adjacent pixels
padded = np.pad(orig_mag, 1, mode='constant', constant_values=False)
dilated = (padded[:-2,:-2] | padded[:-2,1:-1] | padded[:-2,2:] |
           padded[1:-1,:-2] | padded[1:-1,1:-1] | padded[1:-1,2:] |
           padded[2:,:-2] | padded[2:,1:-1] | padded[2:,2:])

# Fix pink pixels near magenta edges
pink_near_edge = pink_tint & dilated
curr[pink_near_edge] = [255, 0, 255, 255]
```

### To be more aggressive:
- Lower thresholds (e.g., r > 100 instead of r > 120)
- Increase dilation radius (dilate multiple times)
- Target specific files manually

## Scripts Created
- **modernize_skin.py** - main modernization script (may need updating)
- **fix_pink.py** - pink edge artifact cleanup script

## Test Checklist
- [x] Shutter opening animation works
- [x] No pink square overlay after opening
- [x] Buttons clickable
- [ ] No visible pink artifacts on main_back.png edges
- [ ] No pink on logo elements
- [ ] No pink on control elements
- [ ] Text scrolling smooth
- [ ] Volume/seek sliders work
