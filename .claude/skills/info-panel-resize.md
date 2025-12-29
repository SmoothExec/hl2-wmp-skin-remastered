# Info Panel Resize Feature - Implementation Guide

## Overview
Adding click-to-drag resize functionality to the "Show Half-Life 2 Information" panel (infoView) in this WMP skin remaster. The resize maintains aspect ratio (283:388) and all elements scale proportionally.

## Current Status: v1.2-WIP
- Resizing works with aspect ratio lock
- X button, grabber, menu buttons scale correctly using Container Pattern
- **Known issues**: Some magenta artifacts, artwork/screenshots display needs refinement

## Key Files

### WMS (Skin Definition) - UTF-16 Encoded
- **Path**: `extracted/hl2_se.wms`
- **Encoding**: UTF-16 LE with BOM - must read/write with `encoding='utf-16'`
- **infoView section**: Search for `<view id="infoView"`

### JavaScript
- **Path**: `extracted/hl2.js`
- **Encoding**: latin-1 (NOT UTF-8!)
- **Key function**: `infoResize()` - called every 50ms via timer to reposition elements

### Images (Original Dimensions)
| Image | Size | Purpose |
|-------|------|---------|
| c_back.png | 283x388 | Outer frame with transparency |
| c_back.jpg | 217x302 | Content area (Gordon Freeman + menu text) |
| c_menu_no.jpg | 208x100 | Menu buttons (Artwork/Screenshots/Web) |
| vid_set_no.png | 68x23 | Close button (X) |
| f_resize.png | 34x30 | Resize grabber handle |

## Architecture: Container Pattern

### The Problem
Buttongroups inside a parent with `resizeImages="true"` cannot have their size controlled by JS. They stay at their XML-defined size while the parent's background scales.

### The Solution
Use the **Container Pattern**:
1. Separate background images from interactive elements
2. Put each buttongroup in its OWN container subview
3. JS controls container size
4. Inner buttongroup uses `horizontalAlignment="stretch" verticalAlignment="stretch"` to fill container

### Element Hierarchy (v1.2-WIP)
```
VIEW (infoView) - 283x388, aspect-ratio locked
├── SUBVIEW (frame) - stretch both, zIndex 10
│   └── backgroundImage: c_back.png
├── SUBVIEW (menuBack) - JS positioned, zIndex 20
│   └── backgroundImage: c_back.jpg (MUST keep this ID for showInfo())
├── SUBVIEW (menuBtnContainer) - JS positioned, zIndex 22
│   └── BUTTONGROUP (menuBackButtons) - stretch to fill
├── SUBVIEW (infoSub) - matches menuBack, zIndex 25
│   └── For artwork/screenshot overlays
├── SUBVIEW (closeButton) - JS positioned, zIndex 30
│   └── BUTTONGROUP - stretch to fill
├── SUBVIEW (infoMenuBack) - JS positioned, zIndex 30
│   └── BUTTON - stretch to fill
├── SUBVIEW (infoNavSub) - JS positioned, zIndex 30
│   └── BUTTONGROUP with prev/next
├── SUBVIEW (link1) - JS positioned, zIndex 30
│   └── BUTTONGROUP - stretch to fill
└── SUBVIEW (resizeHandle) - JS positioned, zIndex 50
    └── BUTTON - stretch to fill
```

### Critical: Preserve Element IDs
The existing `showInfo()` function references:
- `menuBack.backgroundImage` - for setting content
- `menuBackButtons.visible` - for hiding menu
- `infoSub` - for artwork/screenshots overlay

**Never rename these IDs** or existing functionality breaks!

## JavaScript Resize Function

```javascript
var INFO_BASE_W = 283;
var INFO_BASE_H = 388;
var INFO_RATIO = INFO_BASE_W / INFO_BASE_H;
var infoLastW = 283;

function infoResize() {
    // Lock aspect ratio
    if (view.width != infoLastW) {
        view.height = Math.round(view.width / INFO_RATIO);
        infoLastW = view.width;
    }

    var s = view.width / INFO_BASE_W;  // Single scale factor (aspect locked)

    // Position all elements using scale factor
    menuBack.left = Math.round(34 * s);
    menuBack.top = Math.round(48 * s);
    menuBack.width = Math.round(217 * s);
    menuBack.height = Math.round(302 * s);

    // Menu buttons at ABSOLUTE position (not inside menuBack)
    menuBtnContainer.left = Math.round(38 * s);  // 34 + 4
    menuBtnContainer.top = Math.round(247 * s);  // 48 + 199
    menuBtnContainer.width = Math.round(208 * s);
    menuBtnContainer.height = Math.round(100 * s);

    // ... other elements follow same pattern
}
```

## Original Element Positions (at 283x388)

| Element | Left | Top | Width | Height | Notes |
|---------|------|-----|-------|--------|-------|
| menuBack | 34 | 48 | 217 | 302 | Content background |
| menuBtnContainer | 38 | 247 | 208 | 100 | Menu buttons (absolute) |
| closeButton | 207 | 5 | 68 | 23 | X button |
| resizeHandle | 249 | 358 | 34 | 30 | Bottom-right grabber |
| infoMenuBack | 37 | 331 | 58 | 16 | Return button |
| infoNavSub | 200 | 332 | 47 | 17 | Prev/Next buttons |
| link1 | 49 | 168 | 185 | 61 | Web links overlay |

## WMS Timer Setup

```xml
<view id="infoView"
      timerInterval="50"
      onTimer="infoResize();"
      minWidth="283" minHeight="388"
      resizAble="true" ... >
```

**Note**: Minimum timerInterval is 50ms (values below 50 except 0 cause errors).

## Build Script Template

```python
#!/usr/bin/env python3
import zipfile, os

# Read/modify JS (latin-1 encoding!)
with open('extracted/hl2.js', 'r', encoding='latin-1') as f:
    js = f.read()
# ... modify js ...
with open('extracted/hl2.js', 'w', encoding='latin-1') as f:
    f.write(js)

# Read/modify WMS (UTF-16 encoding!)
with open('extracted/hl2_se.wms', 'r', encoding='utf-16') as f:
    wms = f.read()
# ... modify wms ...
with open('extracted/hl2_se.wms', 'w', encoding='utf-16') as f:
    f.write(wms)

# Rebuild WMZ
with zipfile.ZipFile('output.wmz', 'w', zipfile.ZIP_DEFLATED) as zf:
    for f in os.listdir('extracted'):
        if not f.endswith('_upscaled.png'):
            fpath = os.path.join('extracted', f)
            if os.path.isfile(fpath):
                zf.write(fpath, f)
```

## Nav Buttons (navPrev/navNext)

Nav buttons require special handling because they need **individual images** (not a buttongroup):

```xml
<!-- Two separate buttons with their own images -->
<subview id="infoNavSub" left="200" top="332" width="47" height="17" visible="false">
    <button id="navPrev" left="0" width="19" verticalAlignment="stretch"
        image="c_nav_prev_no.png" hoverImage="c_nav_prev_hov.png" ... />
    <button id="navNext" left="28" width="19" verticalAlignment="stretch"
        image="c_nav_next_no.png" hoverImage="c_nav_next_hov.png" ... />
</subview>
```

**JS must scale buttons within container:**
```javascript
var navScale = infoNavSub.width / 47;
navPrev.left = 0;
navPrev.width = Math.round(19 * navScale);
navPrev.height = infoNavSub.height;
navNext.left = Math.round(28 * navScale);
navNext.width = Math.round(19 * navScale);
navNext.height = infoNavSub.height;
```

## Critical Fix: Force Rescale for Dynamic Images

**Problem**: `resizeBackgroundImage` only triggers on actual resize EVENTS, not when:
- Dimensions are set via JavaScript
- New images are loaded dynamically

**Solution**: Force a resize event by "jiggling" dimensions (+1 then back):

```javascript
function forceInfoSubRescale() {
    var s = view.width / 283;
    var targetW = Math.round(217 * s);
    var targetH = Math.round(302 * s);
    // Jiggle triggers resize event
    infoSub.width = targetW + 1;
    infoSub.height = targetH + 1;
    infoSub.width = targetW;
    infoSub.height = targetH;
}
```

**Apply this rescale:**
1. Every timer tick in `infoResize()` - keeps images scaled during drag
2. After setting new `backgroundImage` in `infoNavNext()`/`infoNavPrev()`

**Also requires**: Initial `backgroundImage` in XML (not empty string) for `resizeBackgroundImage` to work at all.

## Aspect Ratio Enforcement

Compare current ratio to target ratio every frame and correct:

```javascript
var currentRatio = view.width / view.height;
if (currentRatio > INFO_RATIO) {
    view.width = Math.round(view.height * INFO_RATIO);
} else if (currentRatio < INFO_RATIO) {
    view.height = Math.round(view.width / INFO_RATIO);
}
```

This handles diagonal mouse movement during resize.

## Known Issues / TODO

1. **Magenta artifacts**: Frame transparency (#ff00ff) shows at some sizes
