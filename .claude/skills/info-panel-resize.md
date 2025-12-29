# Info Panel Resize Feature - Implementation Guide

## Overview
Adding click-to-drag resize functionality to the "Show Half-Life 2 Information" panel (infoView) in this WMP skin remaster. The resize maintains aspect ratio (283:388) and all elements scale proportionally.

## Current Status: v1.2.3
- Resizing works with aspect ratio lock (100%-150%)
- Frame uses nineGridMargins for clean border scaling
- X button and grabber stay fixed size, only reposition
- Menu buttons use ratio-based positioning to overlay background text
- **Known issues**: Some magenta artifacts still appear at certain sizes; menu button alignment needs fine-tuning

## Key Files

### WMS (Skin Definition) - UTF-16 Encoded
- **Path**: `extracted/hl2_se.wms`
- **Encoding**: UTF-16 LE with BOM - must read/write with `encoding='utf-16'`
- **infoView section**: Search for `<view id="infoView"`

### JavaScript
- **Path**: `extracted/hl2.js`
- **Encoding**: latin-1 (NOT UTF-8!)
- **Key function**: `infoResize()` - called on load and every 50ms via timer

### Images (Original Dimensions)
| Image | Size | Purpose |
|-------|------|---------|
| c_back.png | 283x388 | Outer frame with magenta transparency |
| c_back.jpg | 217x302 | Content area (Gordon Freeman + menu text) |
| c_menu_no.jpg | 208x100 | Menu buttons (Artwork/Screenshots/Web) - overlays c_back.jpg text |
| vid_set_no.png | 68x23 | Close button (X) - FIXED SIZE |
| f_resize.png | 34x30 | Resize grabber handle - FIXED SIZE |

## Architecture

### Frame Scaling with nineGridMargins
The frame (c_back.png) uses `nineGridMargins="34,48,40,55"` for non-uniform scaling:
- Corners stay fixed size (never scale)
- Edges only stretch in one direction (maintain thickness)
- Only the center (transparent area) stretches both ways

This prevents the metallic border from getting thicker when resized.

### Fixed vs Scaled Elements
**Fixed Size (only reposition):**
- X button (closeButton): 68x23, anchored to top-right
- Resize grabber (resizeHandle): 34x30, anchored to bottom-right

**Scaled Elements:**
- Content area (menuBack, infoSub): Fills space between fixed frame margins
- Menu buttons: Use ratio-based positioning relative to menuBack

### Content Area Calculation
Content area is calculated from fixed frame margins, NOT scaled from original:
```javascript
var frameLeft = 34, frameTop = 48, frameRight = 40, frameBottom = 55;
var overlap = 6;  // Extend under frame to hide gaps
var bottomExtra = 20;  // Extra bottom coverage

var contentLeft = frameLeft - overlap;  // 28
var contentTop = frameTop - overlap;    // 42
var contentWidth = view.width - frameLeft - frameRight + (overlap * 2);
var contentHeight = view.height - frameTop - frameBottom + (overlap * 2) + bottomExtra;
```

### Ratio-Based Button Positioning
Menu buttons MUST overlay the background text exactly. Use ratios based on original dimensions:
```javascript
// Original: menuBack=217x302, buttons at (4,199) with size 208x100
var btnRatioX = 4 / 217;    // Position ratio
var btnRatioY = 199 / 302;
var btnRatioW = 208 / 217;  // Size ratio
var btnRatioH = 100 / 302;

menuBtnContainer.left = menuBack.left + Math.round(menuBack.width * btnRatioX);
menuBtnContainer.top = menuBack.top + Math.round(menuBack.height * btnRatioY);
menuBtnContainer.width = Math.round(menuBack.width * btnRatioW);
menuBtnContainer.height = Math.round(menuBack.height * btnRatioH);
```

## Element Hierarchy (v1.2.3)
```
VIEW (infoView) - 283x388 to 425x582, aspect-ratio locked
├── SUBVIEW (frame) - nineGridMargins, zIndex 10
│   └── backgroundImage: c_back.png, transparencyColor=#ff00ff
├── SUBVIEW (menuBack) - JS positioned, zIndex 20
│   └── backgroundImage: c_back.jpg (has menu text printed on it)
├── SUBVIEW (menuBtnContainer) - ratio-based position, zIndex 22
│   └── BUTTONGROUP (menuBackButtons) - overlays menuBack text
├── SUBVIEW (infoSub) - matches menuBack, zIndex 25
│   └── For artwork/screenshot overlays, resizeBackgroundImage=true
├── SUBVIEW (closeButton) - FIXED 68x23, zIndex 30
│   └── BUTTONGROUP - NO resizeImages
├── SUBVIEW (resizeHandle) - FIXED 34x30, zIndex 50
│   └── BUTTON - NO resizeImages
└── ... other elements (infoMenuBack, infoNavSub, link1)
```

## JavaScript Resize Function

```javascript
var INFO_BASE_W = 283;
var INFO_BASE_H = 388;
var INFO_RATIO = INFO_BASE_W / INFO_BASE_H;

function infoResize() {
    // Enforce aspect ratio
    var currentRatio = view.width / view.height;
    if (currentRatio > INFO_RATIO) {
        view.width = Math.round(view.height * INFO_RATIO);
    } else if (currentRatio < INFO_RATIO) {
        view.height = Math.round(view.width / INFO_RATIO);
    }

    // Content area from fixed frame margins
    var frameLeft = 34, frameTop = 48, frameRight = 40, frameBottom = 55;
    var overlap = 6, bottomExtra = 20;

    var contentLeft = frameLeft - overlap;
    var contentTop = frameTop - overlap;
    var contentWidth = view.width - frameLeft - frameRight + (overlap * 2);
    var contentHeight = view.height - frameTop - frameBottom + (overlap * 2) + bottomExtra;

    // Position content elements
    menuBack.left = contentLeft;
    menuBack.top = contentTop;
    menuBack.width = contentWidth;
    menuBack.height = contentHeight;

    // ... etc
}
```

## WMS Configuration

```xml
<view id="infoView" width="283" height="388"
      minWidth="283" minHeight="388"
      maxWidth="425" maxHeight="582"
      resizAble="true" timerInterval="50"
      onTimer="infoResize();" onLoad="loadInfoPrefs();infoResize();" ... >

    <!-- Frame with nineGridMargins -->
    <subview zIndex="10" horizontalAlignment="stretch" verticalAlignment="stretch"
        backgroundImage="c_back.png" transparencyColor="#ff00ff"
        resizeImages="true" nineGridMargins="34,48,40,55" />

    <!-- X button - NO resizeImages, fixed size -->
    <subview id="closeButton" zIndex="30" left="207" top="5" width="68" height="23">
        <buttongroup ... mappingImage="pl_set_map.png" >
            <!-- NO resizeImages attribute -->
        </buttongroup>
    </subview>
</view>
```

## Image Loading Pattern (Occlude-Load-Rescale-Reveal)

When loading new images dynamically, follow this EXACT order:

```javascript
function infoNavNext(){
    // 1. OCCLUDE - hide before loading
    infoSub.alphaBlend = 0;

    // 2. LOAD - set new image
    infoSub.backgroundImage = "c_sub_" + infoMode + "_" + navGo + ".jpg";

    // 3. RESCALE - force resize event immediately
    forceInfoSubRescale();

    // 4. Update nav states
    navCheck();

    // 5. REVEAL - fade in (fast 150ms)
    infoSub.alphaBlendTo(255, 150);
}
```

**Critical Points:**
- `alphaBlend = 0` MUST be set BEFORE changing `backgroundImage`
- Call `forceInfoSubRescale()` BEFORE starting the fade-in
- Use 150ms fade for snappy response

## Force Rescale Technique

```javascript
function forceInfoSubRescale() {
    var overlap = 6, bottomExtra = 20;
    var contentLeft = 34 - overlap;
    var contentTop = 48 - overlap;
    var targetW = view.width - 34 - 40 + (overlap * 2);
    var targetH = view.height - 48 - 55 + (overlap * 2) + bottomExtra;

    // Set position first
    infoSub.left = contentLeft;
    infoSub.top = contentTop;

    // Jiggle size to trigger resize event
    infoSub.width = targetW + 1;
    infoSub.height = targetH + 1;
    infoSub.width = targetW;
    infoSub.height = targetH;
}
```

## Initialization
- `infoResize()` is called on `onLoad` AND via timer (every 50ms)
- XML initial positions should match JS calculations at minimum size
- This prevents visual glitches when first opening the panel

## Known Issues / TODO

1. **Magenta artifacts**: Still appear at certain sizes during resize - needs investigation
2. **Menu button alignment**: Artwork/Screenshots/Web Destinations buttons need fine-tuning to perfectly overlay background at all sizes
3. **Potential fix for magenta**: May need to pre-upscale frame image with bleed guard technique (see wmp-skin-sdk.md)

## Build Script

```python
#!/usr/bin/env python3
import zipfile, os

# Read/modify JS (latin-1 encoding!)
with open('extracted/hl2.js', 'r', encoding='latin-1') as f:
    js = f.read()

# Read/modify WMS (UTF-16 encoding!)
with open('extracted/hl2_se.wms', 'r', encoding='utf-16') as f:
    wms = f.read()

# Rebuild WMZ (exclude backup files)
with zipfile.ZipFile('hl2_wmp_skin_remastered_v1.1.wmz', 'w', zipfile.ZIP_DEFLATED) as zf:
    for f in os.listdir('extracted'):
        if '_upscaled.png' in f or '_original.png' in f:
            continue
        fpath = os.path.join('extracted', f)
        if os.path.isfile(fpath):
            zf.write(fpath, f)
```
