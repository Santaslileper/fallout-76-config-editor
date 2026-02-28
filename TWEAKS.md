# Fallout 76 Safe Config Tweaks

## ⚖️ Disclaimer
**USE AT YOUR OWN RISK.** The developers take NO responsibility for any bans, performance issues, or game instability resulting from these tweaks. By applying these settings, you assume all risk.

---

## 🎯 FOV Settings

### `Fallout76.ini` ([Interface])
```ini
[Interface]
fDefaultWorldFOV = 100        ; Third-person world FOV
fDefault1stPersonFOV = 100    ; First-person FOV
```

### `Fallout76Prefs.ini` ([Display] & [Camera])
```ini
[Display]
fDefaultWorldFOV=100.0000

[Camera]
fTPWorldFOV=100.0000
fFPWorldFOV=100.0000
```

---

## ⚡ Performance Tweaks (`Fallout76Prefs.ini`)

### Graphics & Lighting
```ini
[Display]
iPresentInterval=0            ; Uncap FPS (set to 1 for VSync)
bDoDepthOfField=0             ; Disable DOF blur
bVolumetricLightingEnable=0   ; Disable god rays (Big FPS gain)
bSAOEnable=0                  ; Disable ambient occlusion
iShadowMapResolution=512      ; Lower shadow quality
fShadowDistance=20000.0000    ; Reduce shadow draw distance
```

### Image Space Effects
```ini
[ImageSpace]
bDoDepthOfField=0
bMBEnable=0                   ; Disable motion blur
bLensFlare=0                  ; Disable lens flare
bScreenSpaceBokeh=0
```

### Decals & Grass
```ini
[Decals]
bDecals=0                     ; Disable blood/bullet holes
bSkinnedDecals=0

[Grass]
fGrassStartFadeDistance=2000.0000
iMinGrassSize=80              ; Less dense grass (Higher = Less)
```

---

## 🖥️ Quality of Life

### Background Rendering
```ini
[General]
bAlwaysActive=1               ; Game stays active when alt-tabbed
```

### Mouse Responsiveness
```ini
[Controls]
fMouseHeadingXScale=.015
fMouseHeadingYScale=.015
```

---

## 🔒 Safety Guidelines

### ✅ SAFE to use:
- FOV changes
- Disabling visual effects
- Texture/shadow quality changes
- HUD customization

### ❌ DO NOT modify (Will result in bans):
- Removing terrain/walls (Wallhacks)
- Speed hacks or teleportation
- Item duplication exploits
- Any `.dll` injection mods
