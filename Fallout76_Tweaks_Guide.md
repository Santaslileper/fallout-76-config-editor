# Fallout 76 Safe Config Tweaks
## These settings are CLIENT-SIDE ONLY and will NOT get you banned

---

## 🎯 FOV Settings (Fallout76.ini - [Interface] section)

```ini
[Interface]
fDefaultWorldFOV = 100        ; Third-person world FOV (default 70, max ~120)
fDefault1stPersonFOV = 100    ; First-person FOV (default 80, max ~120)
```

## 🎯 FOV Settings (Fallout76Prefs.ini - [Display] section)

```ini
[Display]
fDefaultWorldFOV=100.0000     ; World FOV  

[Camera]
fTPWorldFOV=100.0000          ; Third-person FOV
fFPWorldFOV=100.0000          ; First-person FOV
```

---

## ⚡ Performance Tweaks (Fallout76Prefs.ini)

### [Display] Section
```ini
iPresentInterval=0            ; Uncap FPS (set to 1 for VSync ON)
bDoDepthOfField=0             ; Disable DOF blur (cleaner visuals)
bVolumetricLightingEnable=0   ; Disable god rays (big FPS gain)
bSAOEnable=0                  ; Disable ambient occlusion (FPS gain)
iShadowMapResolution=512      ; Lower shadow quality (512, 1024, 2048, 4096)
fShadowDistance=20000.0000    ; Reduce shadow draw distance
```

### [ImageSpace] Section
```ini
[ImageSpace]
bDoDepthOfField=0             ; Disable DOF
bMBEnable=0                   ; Disable motion blur
bLensFlare=0                  ; Disable lens flare
bScreenSpaceBokeh=0           ; Disable bokeh effect
```

### [Decals] Section
```ini
[Decals]
bDecals=0                     ; Disable decals (blood, bullet holes)
bSkinnedDecals=0
uMaxDecals=0
uMaxSkinDecals=0
```

### [Grass] Section
```ini
[Grass]
fGrassStartFadeDistance=2000.0000    ; Reduce grass render distance
iMinGrassSize=80              ; Less dense grass (higher = less grass)
```

---

## 🖥️ Quality of Life Tweaks

### [General] Section (Fallout76.ini)
```ini
[General]
bAlwaysActive=1               ; Game stays active when alt-tabbed
```

### [Controls] Section
```ini
[Controls]
fMouseHeadingXScale=.015      ; More responsive mouse (lower = faster)
fMouseHeadingYScale=.015
```

---

## ⚠️ THINGS THAT WILL GET YOU BANNED

❌ DO NOT modify these or use mods that:
- Remove terrain/walls (wallhacks)
- Speed hacks or teleportation
- Item duplication exploits
- Damage multipliers
- Auto-aim/aimbot
- ESP/radar hacks
- Any .dll injection mods

✅ SAFE to use:
- FOV changes
- Disabling visual effects (DOF, motion blur, etc.)
- Texture/shadow quality changes
- HUD customization
- Photomode tweaks

---

## 📁 Config File Locations

- `C:\Users\[YourName]\Documents\My Games\Fallout 76\Fallout76.ini`
- `C:\Users\[YourName]\Documents\My Games\Fallout 76\Fallout76Prefs.ini`

## 💾 Backups Created

- `Fallout76.ini.backup`
- `Fallout76Prefs.ini.backup`

---

## 🔧 How to Apply

After editing the INI files:
1. Right-click each file → Properties
2. Check "Read-only" to prevent the game from overwriting your settings
3. If settings reset, you may need to re-apply after game updates
