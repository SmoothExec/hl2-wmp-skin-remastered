# Future Plans

## Dual-Mode Skin (1x / 1.5x Toggle)

### Overview
Add a "Full Size" mode that displays the skin at 150% scale with crisp, properly upscaled textures. Users can toggle between normal and large mode using the existing "return to full mode" button.

### Implementation Steps

#### Phase 1: Generate 1.5x Textures
1. Re-run Real-ESRGAN 4x upscale on all original textures
2. Resize to 1.5x original dimensions (instead of 1x)
3. Apply same magenta removal technique (remove before upscale, restore after)
4. Name convention: `filename_large.png`

#### Phase 2: Create Large View in WMS
1. Duplicate the main view section in `hl2_se.wms`
2. Set `id="large"` on the duplicate
3. Multiply all coordinate values by 1.5:
   - `left`, `top`, `width`, `height`
   - `fontSize`
   - Any hardcoded pixel values
4. Update all image references to use `_large` variants

#### Phase 3: Wire Up Toggle Button
```javascript
// In hl2.js
function toggleSize() {
    if (theme.currentViewID == "normal") {
        theme.currentViewID = "large";
    } else {
        theme.currentViewID = "normal";
    }
}
```

#### Phase 4: Update Button Mapping
- Repurpose existing "return to full mode" button
- Or add new dedicated size toggle button

### Files to Generate at 1.5x
- All PNG files (~80 files)
- All JPG files (~25 files)
- Shutter frames (17 interpolated frames)

### Estimated Impact
- Current WMZ size: ~3.7 MB
- With dual textures: ~7-8 MB
- No performance impact (only one view loaded at a time)

### Considerations
- GIF animations may need separate handling
- Hit-map PNGs should remain at 1x (they're not visible)
- Test thoroughly - coordinate mismatches cause visual glitches

### Priority
Low - Current 1x version is fully functional. This is a nice-to-have enhancement.
