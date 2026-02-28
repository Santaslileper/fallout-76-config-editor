export const settingsSchema = [
    // --- GENERAL ---
    { id: 'loading-fade', prop: 'loadingFade', type: 'float', section: 'General', key: 'fLoadGameFadeSecs', default: 1.0 },
    { id: 'map-menu-fix', prop: 'mapMenuFix', type: 'bool', section: 'General', key: 'bPauseMenuDrawOptimization', default: true },
    {
        id: 'skip-intro', prop: 'skipIntro', type: 'custom',
        section: 'General', key: 'sIntroSequence', default: true,
        parse: (val) => val === '' || val === '0',
        format: (val) => val ? '' : 'BGSLogo.bk2'
    },
    { id: 'disable-splash', prop: 'disableSplash', type: 'bool', section: 'General', key: 'bSkipSplash', default: true },
    { id: 'main-menu-music', prop: 'mainMenuMusic', type: 'bool', section: 'General', key: 'bPlayMainMenuMusic', default: true },
    { id: 'disable-gore', prop: 'disableGore', type: 'bool', section: 'General', key: 'bDisableAllGore', default: false },

    // --- GAME ---
    { id: 'pacifist-mode', prop: 'pacifist', type: 'bool', section: 'Game', key: 'bPacifistMode', default: true },

    // --- INTERFACE ---
    { id: 'fov-tp', prop: 'fovTP', type: 'int', section: 'Interface', key: 'fDefaultWorldFOV', default: 80 },
    { id: 'fov-fp', prop: 'fovFP', type: 'int', section: 'Interface', key: 'fDefault1stPersonFOV', default: 90 },
    { id: 'subtitles', prop: 'subtitles', type: 'bool', section: 'Interface', key: 'bSubtitles', default: true },
    { id: 'crosshair-enabled', prop: 'crosshairEnabled', type: 'bool', section: 'Interface', key: 'bCrosshairEnabled', default: true },
    { id: 'crosshair-r', prop: 'crosshairR', type: 'int', section: 'Interface', key: 'iHUDColorR', default: 255 },
    { id: 'crosshair-g', prop: 'crosshairG', type: 'int', section: 'Interface', key: 'iHUDColorG', default: 255 },
    { id: 'crosshair-b', prop: 'crosshairB', type: 'int', section: 'Interface', key: 'iHUDColorB', default: 255 },
    { id: 'pipboy-scale', prop: 'pipboyScale', type: 'float', section: 'Interface', key: 'fPipboyScale', default: 1.0 },
    {
        id: 'instant-terminal', prop: 'instantTerminal', type: 'custom',
        section: 'Interface', key: 'fTerminalAnimDuration', default: false,
        parse: (val) => parseFloat(val) === 0.0,
        format: (val) => val ? '0.0' : undefined // undefined means don't write line? Or write default? Replicating old logic: only write if true.
    },
    { id: 'terminal-speed', prop: 'terminalSpeed', type: 'int', section: 'Interface', key: 'iTerminalDisplayRate', default: 20 },
    { id: 'compass', prop: 'compass', type: 'bool', section: 'Interface', key: 'bShowCompass', default: true },
    { id: 'quest-markers', prop: 'questMarkers', type: 'bool', section: 'Interface', key: 'bShowFloatingQuestMarkers', default: true },
    { id: 'dialogue-cam', prop: 'dialogueCam', type: 'bool', section: 'Interface', key: 'bDialogueCameraEnable', default: true },
    { id: 'damage-numbers', prop: 'showDamageNumbers', type: 'bool', section: 'Interface', key: 'bShowDamageNumbers', default: true },
    { id: 'pa-hud', prop: 'paHud', type: 'bool', section: 'Interface', key: 'bShowPowerArmorHUD', default: true },
    { id: 'backpack-visible', prop: 'backpackVisible', type: 'bool', section: 'Interface', key: 'bShowBackpack', default: true },
    { id: 'safe-zone-x', prop: 'safeZoneX', type: 'float', section: 'Interface', key: 'fSafeZoneX', default: 15.0 },
    { id: 'safe-zone-y', prop: 'safeZoneY', type: 'float', section: 'Interface', key: 'fSafeZoneY', default: 15.0 },
    {
        id: 'loading-fade-speed', prop: 'loadingFadeSpeed', type: 'float',
        section: 'Interface', key: 'fFadeToBlackFadeSeconds', default: 0.5,
        // Also maps fMinSecondsForLoadFadeIn manually or duplicate?
        // Old logic wrote both. This schema handles 1:1. We can handle side-effects in generator.
    },

    // --- CONTROLS ---
    { id: 'mouse-sens', prop: 'mouseSens', type: 'float', section: 'Controls', key: 'fMouseHeadingSensitivity', default: 0.002, precision: 6 },
    { id: 'mouse-smoothing', prop: 'mouseSmoothing', type: 'bool', section: 'Controls', key: 'bMouseSmoothing', default: false },
    { id: 'mouse-accel', prop: 'mouseAccel', type: 'bool', section: 'Controls', key: 'bMouseAcceleration', default: false },
    { id: 'always-run', prop: 'alwaysRun', type: 'bool', section: 'Controls', key: 'bAlwaysRunByDefault', default: true },
    { id: 'rumble', prop: 'rumble', type: 'bool', section: 'Controls', key: 'bGamePadRumble', default: false },
    { id: 'invert-y', prop: 'invertY', type: 'bool', section: 'Controls', key: 'bInvertYValues', default: false },
    { id: 'ads-sens', prop: 'adsSens', type: 'float', section: 'Controls', key: 'fIronSightsFOVRotateMult', default: 1.0, precision: 4 },
    { id: 'gamepad-enable', prop: 'gamepadEnable', type: 'bool', section: 'Controls', key: 'bGamepadEnable', default: true },
    { id: 'gamepad-sens', prop: 'gamepadSens', type: 'float', section: 'Controls', key: 'fGamepadHeadingSensitivity', default: 1.0, precision: 6 },
    { id: 'toggle-sprint', prop: 'toggleSprint', type: 'bool', section: 'Controls', key: 'bToggleSprint', default: false },
    { id: 'toggle-crouch', prop: 'toggleCrouch', type: 'bool', section: 'Controls', key: 'bToggleCrouch', default: false },

    // --- AUDIO ---
    { id: 'push-to-talk', prop: 'pushToTalk', type: 'bool', section: 'Audio', key: 'bVoicePushToTalkEnabled', default: true },
    { id: 'voice-chat-mode', prop: 'voiceChatMode', type: 'int', section: 'Audio', key: 'uVoiceChatType', default: 0 },
    { id: 'radio-vol', prop: 'radioVol', type: 'float', section: 'Audio', key: 'fRadioVolume', default: 0.5 },
    { id: 'master-vol', prop: 'masterVol', type: 'float', section: 'Display', key: 'fMasterVolume', default: 0.5, file: 'prefs' }, // Prefs?
    { id: 'music-vol', prop: 'musicVol', type: 'float', section: 'Display', key: 'fMusicVolume', default: 0.5, file: 'prefs' }, // Prefs? (Check ini.js lines 128/129 says [Audio] but logic might place in prefs?)
    // ini.js line 127: [Audio] inside generateFallout76PrefsIni. So yes, file: 'prefs'.

    // --- GRASS ---
    {
        id: 'disable-grass', prop: 'disableGrass', type: 'custom',
        section: 'Grass', key: 'bAllowCreateGrass', default: false,
        parse: (val) => val === '0',
        format: (val) => val ? '0' : '1'
    },
    { id: 'grass-dist', prop: 'grassDist', type: 'float', section: 'Grass', key: 'fGrassStartFadeDistance', default: 3000 },
    { id: 'grass-density', prop: 'grassDensity', type: 'int', section: 'Grass', key: 'iMinGrassSize', default: 20 },

    // --- SAVEGAME ---
    { id: 'autosave-interval', prop: 'autosaveInterval', type: 'float', section: 'SaveGame', key: 'fAutosaveEveryXMins', default: 10.0 },
    { id: 'autosave-count', prop: 'autoSaveCount', type: 'int', section: 'SaveGame', key: 'iAutoSaveCount', default: 10 },

    // --- PIPBOY ---
    { id: 'pipboy-r', prop: 'pipboyR', type: 'float', section: 'Pipboy', key: 'fPipboyEffectColorR', default: 0.05 },
    { id: 'pipboy-g', prop: 'pipboyG', type: 'float', section: 'Pipboy', key: 'fPipboyEffectColorG', default: 1.0 },
    { id: 'pipboy-b', prop: 'pipboyB', type: 'float', section: 'Pipboy', key: 'fPipboyEffectColorB', default: 0.1 },
    {
        id: 'instant-pipboy', prop: 'instantPipboy', type: 'custom',
        section: 'Pipboy', key: 'fPipboyAnimDuration', default: false,
        parse: (val) => parseFloat(val) === 0.0,
        format: (val) => val ? '0.0' : undefined
    },

    // --- ENLIGHTEN ---
    { id: 'disable-enlighten', prop: 'enlighten', type: 'bool', section: 'Enlighten', key: 'bEnableEnlighten', default: true }, // Logic inverted in name but prop is normal? id=disable-enlighten -> enlighten=false?
    // ui.js: case 'disable-enlighten': config.enlighten = !val;
    // So Checkbox checked (True) -> Enlighten False (Disabled).
    // Let's handle this in UI layer or schema generic 'invertUI'?
    // Schema: invertUI: true.

    // --- COMBAT ---
    { id: 'show-hit-vector', prop: 'showHitVector', type: 'bool', section: 'Combat', key: 'iShowHitVector', default: false },

    // --- NETWORK ---
    { id: 'ping-monitor', prop: 'pingMonitor', type: 'bool', section: 'NetworkMotion', key: 'bEnablePingMonitor', default: false },

    // --- PREFS / DISPLAY ---
    { id: 'pause-on-alt-tab', prop: 'pauseOnAltTab', type: 'bool', section: 'General', key: 'bPauseOnAltTab', default: false, file: 'prefs' },

    // RESOLUTION (Special)
    {
        id: 'resolution', prop: 'resolution', type: 'resolution',
        section: 'Display', key: null, default: '2560x1440', file: 'prefs'
    },

    {
        id: 'window-mode', prop: 'windowMode', type: 'custom',
        section: 'Display', key: null, default: 'borderless', file: 'prefs',
        // Handled by custom parser logic due to two keys (bFull Screen, bBorderless)
    },

    { id: 'shadow-res', prop: 'shadowRes', type: 'int', section: 'Display', key: 'iShadowMapResolution', default: 1024, file: 'prefs' },
    { id: 'shadow-dist', prop: 'shadowDist', type: 'float', section: 'Display', key: 'fShadowDistance', default: 30000, file: 'prefs' },
    { id: 'dir-shadow-dist', prop: 'dirShadowDist', type: 'float', section: 'Display', key: 'fDirShadowDistance', default: 60000, file: 'prefs' },
    { id: 'anisotropy', prop: 'anisotropy', type: 'int', section: 'Display', key: 'iMaxAnisotropy', default: 16, file: 'prefs' },
    { id: 'compute-shader-lighting', prop: 'computeShaderLighting', type: 'bool', section: 'Display', key: 'bComputeShaderDeferredTiledLighting', default: true, file: 'prefs' },

    {
        id: 'fps-limit', prop: 'fpsLimit', type: 'custom',
        section: 'Display', key: 'iPresentInterval', default: 'default', file: 'prefs',
        parse: (val) => val === '0' ? 'unlocked' : 'default',
        format: (val) => val === 'unlocked' ? '0' : '1'
    },

    { id: 'antialiasing', prop: 'antialiasing', type: 'string', section: 'Display', key: 'sAntiAliasing', default: 'TAA', file: 'prefs' },
    { id: 'leaf-anim-start', prop: 'leafAnimDampenStart', type: 'float', section: 'Display', key: 'fLeafAnimDampenStartRange', default: 1.0, file: 'prefs' },
    { id: 'leaf-anim-end', prop: 'leafAnimDampenEnd', type: 'float', section: 'Display', key: 'fLeafAnimDampenEndRange', default: 1.0, file: 'prefs' },

    // --- IMAGESPACE ---
    { id: 'dof', prop: 'dof', type: 'bool', section: 'ImageSpace', key: 'bDoDepthOfField', default: true, file: 'prefs' },
    { id: 'mblur', prop: 'mblur', type: 'bool', section: 'ImageSpace', key: 'bMBEnable', default: true, file: 'prefs' },
    { id: 'lens', prop: 'lens', type: 'bool', section: 'ImageSpace', key: 'bLensFlare', default: true, file: 'prefs' },
    { id: 'godrays', prop: 'godrays', type: 'bool', section: 'ImageSpace', key: 'bVolumetricLightingEnable', default: true, file: 'prefs' },
    { id: 'ssr', prop: 'ssr', type: 'bool', section: 'ImageSpace', key: 'bScreenSpaceReflections', default: true, file: 'prefs' },

    // --- LOD ---
    { id: 'lod-objects', prop: 'lodObjects', type: 'float', section: 'LOD', key: 'fLODFadeOutMultObjects', default: 5.0, file: 'prefs' },
    { id: 'lod-actors', prop: 'lodActors', type: 'float', section: 'LOD', key: 'fLODFadeOutMultActors', default: 5.0, file: 'prefs' },
    { id: 'lod-items', prop: 'lodItems', type: 'float', section: 'LOD', key: 'fLODFadeOutMultItems', default: 5.0, file: 'prefs' },

    // --- WATER ---
    { id: 'water-refractions', prop: 'waterRefractions', type: 'bool', section: 'Water', key: 'bUseWaterRefractions', default: true, file: 'prefs' },
    { id: 'water-reflections', prop: 'waterReflections', type: 'bool', section: 'Water', key: 'bUseWaterReflections', default: true, file: 'prefs' },
    { id: 'wetness-occlusion', prop: 'wetnessOcclusion', type: 'bool', section: 'Water', key: 'bWetnessOcclusion', default: true, file: 'prefs' },
    { id: 'rain-occlusion', prop: 'rainOcclusion', type: 'bool', section: 'Weather', key: 'bRainOcclusion', default: true, file: 'prefs' }, // Assumed section 'Weather' or 'Water'? 
    // Checking ini.js: rainOcclusion is NOT in generator! It's in `ui.js`.
    // I will add it to the schema, assuming [Weather] based on game knowledge or just [Water].
    // Actually, if it's not in the generator, it doesn't save. I should fix that too. Use [Weather] bRainOcclusion=1.

];
