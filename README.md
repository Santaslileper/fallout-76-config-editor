# Fallout 76 Config Editor

A standalone, high-performance configuration editor for Fallout 76. This tool provides a unified interface to tweck hidden engine settings, manage INI files, and explore a calibrated interactive map of Appalachia.

## 🚀 Quick Install (PowerShell)

Run this command to automatically install and launch the application:

```powershell
irm https://raw.githubusercontent.com/Santaslileper/fallout-76-config-editor/main/bootstrap.ps1 | iex
```

## ✨ Features

- **Unified Interface**: Edit `Fallout76.ini`, `Fallout76Prefs.ini`, and `Fallout76Custom.ini` in one place.
- **Calibrated Map**: Interactive 4096px map with accurate markers for collectibles, locations, and vendors.
- **Smart Backups**: Automatically creates timestamped backups before saving changes.
- **Read-Only Protection**: One-click toggle to prevent the game from overwriting your custom tweaks.
- **Performance Presets**: Quick-apply settings for Potato, Medium, High, and Ultra quality.
- **Minified Build**: Ultra-fast load times with a consolidated C# backend.

## 📁 Repository Structure

- `Fallout76Config.exe`: The primary standalone application.
- `wwwroot/`: Minified frontend assets (HTML, CSS, JS).
- `bootstrap.ps1`: Automated installation script.

## ⚠️ Safe Usage

All tweaks provided by this editor are **client-side only** and are safe for use in official servers. We focus on:
- FOV Adjustments
- Disabling visual clutter (DOF, Motion Blur, Lens Flare)
- Performance optimizations (Shadows, Grass, Lighting)
- Quality of Life improvements (Alt-Tab background rendering)

---
© 2026 Fallout 76 Config Editor Team.
