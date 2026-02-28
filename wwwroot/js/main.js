import { initUI, handleLoad, generateOutput } from './ui.js';
import { initDatabase, startNewsTicker, setConfigUpdateCallback } from './database.js';
import { checkBackendStatus } from './api.js';
import { elements } from './elements.js';

async function init() {
    console.log("Initializing Fallout 76 Config Editor (Module)...");
    setConfigUpdateCallback(generateOutput);
    initUI();
    initDatabase();
    startNewsTicker();

    let attempts = 0;
    const maxAttempts = 10;

    const checkLoop = async () => {
        const isOnline = await checkBackendStatus();
        if (isOnline) {
            elements.backendDot.style.background = '#e1b000';
            elements.backendText.textContent = 'CONNECTED';
            // Backend found, load config immediately
            handleLoad(null, true);
            return;
        } else {
            elements.backendDot.style.background = '#ff0000';
            elements.backendText.textContent = 'CONNECTING...';
            attempts++;
            if (attempts < maxAttempts) {
                setTimeout(checkLoop, 1000);
            } else {
                elements.backendText.textContent = 'OFFLINE';
                console.error("Backend connection timeout");
            }
        }
    };

    checkLoop();

    // Disable context menu for "App-like" feel
    document.addEventListener('contextmenu', event => event.preventDefault());
}

document.addEventListener('DOMContentLoaded', init);
