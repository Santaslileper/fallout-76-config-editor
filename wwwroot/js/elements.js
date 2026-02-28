export const elements = {
    tabBtns: document.querySelectorAll('.nav-tab'),
    sections: document.querySelectorAll('.config-section'),
    saveBtn: document.getElementById('save-btn'),
    loadBtn: document.getElementById('load-btn'),
    resetBtn: document.getElementById('reset-btn'),
    launchBtn: document.getElementById('launch-btn'),
    restartBtn: document.getElementById('restart-btn'),
    searchBar: document.getElementById('settings-search'),
    searchBtn: document.getElementById('search-btn'),
    searchResults: document.getElementById('settings-search-results'),
    output: document.getElementById('config-output'),
    backendDot: document.getElementById('backend-dot'),
    backendText: document.getElementById('backend-text'),
    inputs: {}
};

export const inputIds = [
    'skip-intro', 'disable-splash', 'dialogue-cam', 'compass', 'quest-markers',
    'pipboy-color', 'pipboy-scale', 'instant-pipboy', 'instant-terminal', 'terminal-speed',
    'pipboy-r', 'pipboy-g', 'pipboy-b',
    'window-mode', 'resolution', 'fov-fp', 'fov-tp', 'autosave-count', 'safe-zone-x', 'safe-zone-y',
    'map-menu-fix', 'disable-enlighten', 'show-hit-vector', 'ping-monitor',
    'loading-fade-speed', 'dir-shadow-dist',
    'grass-dist', 'grass-density',
    'fps-limit', 'shadow-res', 'anisotropy', 'shadow-dist', 'compute-shader-lighting', 'antialiasing',
    'mouse-sens', 'mouse-smoothing', 'invert-y', 'ads-sens', 'gamepad-enable', 'rumble', 'gamepad-sens', 'mouse-accel',
    'toggle-sprint', 'toggle-crouch',
    'master-vol', 'music-vol', 'main-menu-music', 'radio-vol', 'voice-chat-mode', 'push-to-talk',
    'always-run', 'toggle-aim', 'crosshair-enabled', 'subtitles', 'quick-map', 'loading-fade',
    'pacifist-mode', 'damage-numbers', 'pa-hud', 'backpack-visible',
    'dof', 'mblur', 'lens', 'godrays', 'crosshair-r', 'crosshair-g', 'crosshair-b',
    'water-reflections', 'water-refractions', 'wetness-occlusion', 'ssr',
    'lod-objects', 'lod-actors', 'lod-items', 'rain-occlusion', 'custom-ini',
    'clear-water', 'disable-grass', 'pause-on-alt-tab', 'disable-gore', 'read-only'
];
