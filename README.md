# Half-Life 2 WMP Skin Remastered

A remastered version of the classic Half-Life 2 Windows Media Player skin with AI-upscaled textures and smoother 60 FPS animations.

![Preview](extracted/preview.png)

## Features

- **AI-Upscaled Textures**: All images enhanced using Real-ESRGAN 4x, then resized to original dimensions for crisp, clean visuals
- **Smoother Animations**: Interpolated shutter animation (9 → 17 frames) with 50ms timing
- **60 FPS UI**: Updated timer intervals for fluid interface response
- **Smoother Text Scrolling**: Reduced scroll delay (8ms) for buttery smooth song title display
- **Preserved Functionality**: All original features work - shutter animations, transport controls, volume/seek sliders, visualizations

## Installation

1. Download `hl2_wmp_skin_remastered_v1.wmz` from the [Releases](../../releases) page
2. Double-click the `.wmz` file to install, or copy to:
   ```
   C:\Program Files (x86)\Windows Media Player\Skins\
   ```
3. Open Windows Media Player → View → Skin Chooser → Select "Half-Life 2"

## Requirements

- Windows Media Player 9 or later
- Windows XP/Vista/7/8/10/11

## Technical Details

### Upscaling Process
- Original textures upscaled 4x with Real-ESRGAN
- Magenta transparency key (#FF00FF) removed before upscaling to prevent color bleed
- Exact magenta mask restored after processing
- PNG color modes preserved (RGB/RGBA) for WMP compatibility

### Timing Updates
| Setting | Original | Remastered |
|---------|----------|------------|
| UI Timer | 100ms | 16ms |
| Shutter Frames | 9 | 17 |
| Frame Timing | 100ms | 50ms |
| Scroll Delay | 80ms | 8ms |

### Files Structure
```
├── hl2_wmp_skin_remastered_v1.wmz  # Ready-to-install skin
├── hl2_wmp_skin.wmz                # Original backup
├── extracted/                       # Working files
│   ├── hl2_se.wms                  # Skin definition (UTF-16)
│   ├── hl2.js                      # Animation logic
│   ├── *.png                       # Upscaled textures
│   └── *.gif                       # Animation sprites
└── scripts/
    ├── modernize_skin.py           # Main processing script
    └── fix_pink.py                 # Artifact cleanup
```

## Building from Source

```bash
# Install dependencies
pip install pillow numpy

# Run the modernization script
python modernize_skin.py
```

Requires [Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN) in `realesrgan/` folder for AI upscaling.

## Credits

- Original skin by Valve Corporation
- Remastered by the community with AI assistance
- Real-ESRGAN by xinntao

## License

This is a fan project. Half-Life 2 and associated assets are property of Valve Corporation.
