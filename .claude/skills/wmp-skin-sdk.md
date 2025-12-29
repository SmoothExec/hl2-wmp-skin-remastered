# Windows Media Player Skin SDK Reference

## Overview
WMP skins use XML-based definition files (.wms) with JScript for interactivity. This document covers the key concepts for creating resizable skin elements.

## File Structure
- **Skin Definition File**: `.wms` extension, UTF-16 LE encoded with BOM
- **Script File**: `.js` extension, latin-1 encoded
- **WMZ Package**: ZIP archive containing all skin files

## Core Elements

### VIEW Element
The top-level container for a skin interface.

**Key Attributes:**
| Attribute | Description |
|-----------|-------------|
| `width`, `height` | Initial dimensions |
| `minWidth`, `minHeight` | Minimum resize dimensions |
| `maxWidth`, `maxHeight` | Maximum resize dimensions |
| `resizable` | Boolean - whether view can be resized |
| `resizeBackgroundImage` | Boolean - whether background image scales |
| `timerInterval` | Milliseconds between timer events (min 50, 0 = disabled) |
| `onTimer` | Event handler called at timerInterval |
| `scriptFile` | JavaScript file to load |

**Timer Usage:**
```xml
<view timerInterval="16" onTimer="myResizeFunction();" ... >
```
- Minimum interval: 50ms (values below 50 except 0 cause errors)
- Set to 0 to disable timer
- 16ms ≈ 60fps updates

### SUBVIEW Element
Child container that can be positioned and resized within a VIEW.

**Key Attributes:**
| Attribute | Description |
|-----------|-------------|
| `backgroundImage` | Image to display |
| `backgroundTiled` | Boolean - tile the image |
| `resizeBackgroundImage` | Boolean - scale image with element |
| `transparencyColor` | Color to treat as transparent (e.g., "#ff00ff") |

## Ambient Attributes (Apply to Most Elements)

### Positioning
| Attribute | Description |
|-----------|-------------|
| `left` | X coordinate relative to parent |
| `top` | Y coordinate relative to parent |
| `width` | Element width |
| `height` | Element height |
| `right` | Distance from right edge of parent |
| `bottom` | Distance from bottom edge of parent |

### Alignment (CRITICAL FOR RESIZE)
| Attribute | Values | Description |
|-----------|--------|-------------|
| `horizontalAlignment` | `left` (default), `right`, `center`, `stretch` | How element positions during resize |
| `verticalAlignment` | `top` (default), `bottom`, `center`, `stretch` | How element positions during resize |

**Alignment Behavior:**
- **left/top**: Maintains distance from left/top edge (default)
- **right/bottom**: Maintains distance from right/bottom edge
- **center**: Stays centered, does NOT maintain fixed distance
- **stretch**: Maintains distance from BOTH edges, element stretches to fit

### Image Scaling
| Attribute | Description |
|-----------|-------------|
| `resizeImages` | Boolean - images scale when element resizes (requires WMP 11+) |
| `nineGridMargins` | Non-uniform scaling margins: "left,top,right,bottom" |

### Nine Grid Scaling
Divides element into 3x3 grid for non-uniform scaling:
```
┌─────────┬──────────┬─────────┐
│ Corner  │  Edge    │ Corner  │  <- Top margin
├─────────┼──────────┼─────────┤
│  Edge   │  Center  │  Edge   │
├─────────┼──────────┼─────────┤
│ Corner  │  Edge    │ Corner  │  <- Bottom margin
└─────────┴──────────┴─────────┘
    ^                     ^
  Left                  Right
 margin                margin
```
- **Corners**: Fixed size, never scale
- **Edges**: Scale in one direction only
- **Center**: Scales in both directions

**Usage:**
```xml
<subview nineGridMargins="34,48,32,38" resizeImages="true" ... />
```

## BUTTONGROUP Element
Container for clickable button regions using image mapping.

**Key Attributes:**
| Attribute | Description |
|-----------|-------------|
| `image` | Normal state image |
| `hoverImage` | Hover state image |
| `downImage` | Pressed state image |
| `mappingImage` | Color-coded image defining click regions |
| `resizeImages` | Boolean - scale button images |

**Mapping Colors:**
Each BUTTONELEMENT has a `mappingColor` that corresponds to a color in the mappingImage:
```xml
<buttongroup mappingImage="button_map.png">
    <buttonelement mappingColor="#0000ff" onClick="action1()" />
    <buttonelement mappingColor="#00ff00" onClick="action2()" />
</buttongroup>
```

## JScript Integration

### Accessing Elements
Elements are accessed by their `id` attribute as global variables:
```javascript
myElement.left = 100;
myElement.width = view.width - 50;
```

### JScript in Attributes
Use `jscript:` prefix for expressions in XML attributes:
```xml
<subview left="jscript:view.width - 50" ... />
```
**IMPORTANT**: JScript expressions in attributes are evaluated at LOAD TIME only, NOT during resize!

### Dynamic Updates via Timer
To update positions during resize, use a timer:
```javascript
function onResize() {
    myElement.left = view.width - myElement.width;
    myElement.top = view.height - myElement.height;
}
```

## Resize Strategies

### Strategy 1: Alignment Attributes (Recommended for Simple Cases)
Use alignment attributes for elements that anchor to edges:
```xml
<!-- Anchored to bottom-right corner -->
<subview horizontalAlignment="right" verticalAlignment="bottom" ... />

<!-- Stretches to fill space with margins -->
<subview left="34" top="48" horizontalAlignment="stretch" verticalAlignment="stretch" ... />
```

### Strategy 2: Timer-Based Repositioning (For Complex Scaling)
When elements need to scale proportionally with content:
```javascript
var BASE_W = 283, BASE_H = 388;

function onResize() {
    var sw = view.width / BASE_W;
    var sh = view.height / BASE_H;

    element.left = Math.round(originalLeft * sw);
    element.top = Math.round(originalTop * sh);
    element.width = Math.round(originalWidth * sw);
    element.height = Math.round(originalHeight * sh);
}
```

### Strategy 3: Nine Grid for Frames
For frames with decorative borders that shouldn't scale:
```xml
<subview backgroundImage="frame.png"
         nineGridMargins="34,48,32,38"
         resizeImages="true"
         horizontalAlignment="stretch"
         verticalAlignment="stretch" />
```

## Common Issues & Solutions

### Issue: Buttongroups Inside resizeImages Parents Don't Resize
**Cause**: JS cannot directly control buttongroup size when inside a parent with `resizeImages="true"`. The buttongroup stays at its XML-defined size.
**Solution**: Use the Container Pattern:
1. Put the buttongroup in its OWN container subview (not sharing with background image)
2. Position container at ABSOLUTE view coordinates
3. Set `horizontalAlignment="stretch" verticalAlignment="stretch"` on inner buttongroup
4. JS controls container size; buttongroup stretches to fill

```xml
<!-- WRONG: buttongroup inside parent with background -->
<subview id="parent" backgroundImage="bg.jpg" resizeImages="true">
    <buttongroup id="btns" left="4" top="199" ... /> <!-- Won't resize! -->
</subview>

<!-- RIGHT: separate container for buttongroup -->
<subview id="bgOnly" backgroundImage="bg.jpg" resizeImages="true" />
<subview id="btnContainer" left="38" top="247" width="208" height="100">
    <buttongroup horizontalAlignment="stretch" verticalAlignment="stretch"
        resizeImages="true" ... /> <!-- Fills container! -->
</subview>
```

### Issue: Elements Drift During Resize
**Cause**: Scale factors for parent and child are calculated independently, causing accumulated rounding errors.
**Solution**: Calculate child positions relative to actual parent dimensions:
```javascript
child.left = Math.round(parent.width * originalChildLeft / originalParentWidth);
```

### Issue: JScript Attributes Don't Update
**Cause**: JScript expressions in XML attributes only evaluate at load time.
**Solution**: Use timer-based JavaScript to update properties dynamically.

### Issue: Mapping Image Misaligns When Scaled
**Cause**: mappingImage scales with the buttongroup, but click detection may not align perfectly.
**Solution**: Ensure `resizeImages="true"` on the buttongroup and parent elements.

### Issue: Buttonelements Can't Have Individual Images
**Cause**: `<buttonelement>` uses the PARENT buttongroup's image/hoverImage/downImage with mappingColor to determine click regions. Individual buttonelements cannot have their own image attributes.
**Solution**: For buttons that need different images (like prev/next arrows), use separate `<button>` elements, NOT buttonelements in a buttongroup:

```xml
<!-- WRONG: buttonelements can't have individual images -->
<buttongroup>
    <buttonelement image="prev.png" ... />  <!-- image attribute ignored! -->
    <buttonelement image="next.png" ... />
</buttongroup>

<!-- RIGHT: separate buttons for different images -->
<button id="navPrev" image="prev.png" hoverImage="prev_hov.png" ... />
<button id="navNext" image="next.png" hoverImage="next_hov.png" ... />
```

### Issue: Dynamic backgroundImage Doesn't Scale
**Cause**: `resizeBackgroundImage` only triggers on actual resize EVENTS, not when dimensions are set via JS or when new images are loaded.
**Solution**: Force a resize event by "jiggling" dimensions:
```javascript
// After setting backgroundImage, force rescale:
element.width = targetW + 1;
element.height = targetH + 1;
element.width = targetW;  // Back to correct size
element.height = targetH;
```
**Also**: Element must have an initial `backgroundImage` in XML (not empty) for `resizeBackgroundImage` to work.

### Issue: Flash of Unscaled Image on Dynamic Load
**Cause**: When setting a new backgroundImage, the image may briefly display at native size before the rescale runs.
**Solution**: Use the Occlude-Load-Rescale-Reveal pattern:
```javascript
// 1. OCCLUDE - hide before loading
element.alphaBlend = 0;

// 2. LOAD - set new image
element.backgroundImage = newImage;

// 3. RESCALE - force resize event
element.width = targetW + 1;
element.height = targetH + 1;
element.width = targetW;
element.height = targetH;

// 4. REVEAL - fade in (150ms for snappy feel)
element.alphaBlendTo(255, 150);
```
**Critical**: `alphaBlend = 0` MUST be set BEFORE changing `backgroundImage`, not after.

### Issue: Magenta Bleed Artifacts When Upscaling
**Cause**: WMP's bilinear interpolation mixes magenta (#ff00ff) transparency color with edge pixels when upscaling.
**Solution**: Pre-upscale images to max size with "bleed guard":
1. Expand edge pixels 3-4 pixels INTO the magenta area (copy edge color)
2. Upscale to max size using LANCZOS
3. Re-apply magenta mask using NEAREST neighbor from original (no interpolation)
4. WMP will only downscale (which doesn't cause artifacts)

```python
# Bleed guard - extend edges into magenta before upscaling
for iteration in range(bleed_radius):
    # Find magenta adjacent to content, copy content color into magenta
```

### Issue: Non-Uniform Scaling of Frame
**Cause**: Using `resizeImages="true"` without nineGridMargins scales entire image uniformly.
**Solution**: Use `nineGridMargins` to preserve corners and scale only edges/center.

## HL2 Info Panel Specific Notes

### Element Hierarchy
```
VIEW (283x388)
├── SUBVIEW (frame, c_back.png) - stretch both directions
├── SUBVIEW (menuBack, c_back.jpg) - content area
│   └── BUTTONGROUP (menuBackButtons) - menu links
├── SUBVIEW (closeButton) - X button
├── SUBVIEW (resizeHandle) - bottom-right grabber
└── ... other elements
```

### Key Dimensions
| Element | Left | Top | Width | Height |
|---------|------|-----|-------|--------|
| Frame (c_back.png) | 0 | 0 | 283 | 388 |
| Content (menuBack) | 34 | 48 | 217 | 302 |
| Menu Buttons | 4* | 199* | 208 | 100 |
| Close Button | 205 | 5 | 68 | 23 |
| Resize Handle | 249 | 358 | 34 | 30 |

*Relative to menuBack, not view

### Aspect Ratio Lock
```javascript
var RATIO = 283 / 388;  // 0.729
if (view.width != lastWidth) {
    view.height = Math.round(view.width / RATIO);
    lastWidth = view.width;
}
```

## References
- [WMP SDK Documentation](https://learn.microsoft.com/en-us/previous-versions/windows/desktop/wmp/windows-media-player-sdk)
- [Ambient Attributes](https://learn.microsoft.com/en-us/previous-versions/windows/desktop/wmp/ambient-attributes)
- [VIEW Element](https://learn.microsoft.com/en-us/previous-versions/windows/desktop/wmp/view-element)
- [SUBVIEW Element](https://learn.microsoft.com/en-us/previous-versions/windows/desktop/wmp/subview-element)
