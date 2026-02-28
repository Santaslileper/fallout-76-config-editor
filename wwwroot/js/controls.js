import { showNotification } from './utils.js';

let currentControlMapLines = [];

export function setControlMapLines(lines) {
    currentControlMapLines = lines;
}

export function getControlMapLines() {
    return currentControlMapLines;
}

export function generateControlMap() {
    if (currentControlMapLines.length > 0) {
        return currentControlMapLines.join('\n');
    }
    return null;
}

const dxKeyCodes = {
    0x01: "Esc", 0x02: "1", 0x03: "2", 0x04: "3", 0x05: "4", 0x06: "5", 0x07: "6", 0x08: "7", 0x09: "8", 0x0A: "9", 0x0B: "0", 0x0C: "-", 0x0D: "=", 0x0E: "Bksp",
    0x0F: "Tab", 0x10: "Q", 0x11: "W", 0x12: "E", 0x13: "R", 0x14: "T", 0x15: "Y", 0x16: "U", 0x17: "I", 0x18: "O", 0x19: "P", 0x1A: "[", 0x1B: "]", 0x1C: "Enter",
    0x1D: "LCtrl", 0x1E: "A", 0x1F: "S", 0x20: "D", 0x21: "F", 0x22: "G", 0x23: "H", 0x24: "J", 0x25: "K", 0x26: "L", 0x27: ";", 0x28: "'", 0x29: "`", 0x2A: "LShift",
    0x2B: "\\", 0x2C: "Z", 0x2D: "X", 0x2E: "C", 0x2F: "V", 0x30: "B", 0x31: "N", 0x32: "M", 0x33: ",", 0x34: ".", 0x35: "/", 0x36: "RShift", 0x37: "Num*",
    0x38: "LAlt", 0x39: "Space", 0x3A: "Caps", 0x3B: "F1", 0x3C: "F2", 0x3D: "F3", 0x3E: "F4", 0x3F: "F5", 0x40: "F6", 0x41: "F7", 0x42: "F8", 0x43: "F9",
    0x44: "F10", 0x45: "Num7", 0x46: "Num8", 0x47: "Num9", 0x48: "Num-", 0x49: "Num4", 0x4A: "Num5", 0x4B: "Num6", 0x4C: "Num+", 0x4D: "Num1", 0x4E: "Num2",
    0x4F: "Num3", 0x50: "Num0", 0x51: "Num.", 0x57: "F11", 0x58: "F12", 0x9C: "Enter", 0x9D: "RCtrl", 0xC8: "Up", 0xC9: "PgUp", 0xCB: "Left", 0xCD: "Right",
    0xD0: "Down", 0xD1: "PgDn", 0xFF: "None", 0x11: "W",
};

const friendlyControlActions = [
    { id: "Forward", name: "Move Forward", defaultKey: 0x11, defaultGP: "LS Up" },
    { id: "Back", name: "Move Back", defaultKey: 0x1F, defaultGP: "LS Down" },
    { id: "StrafeLeft", name: "Move Left", defaultKey: 0x1E, defaultGP: "LS Left" },
    { id: "StrafeRight", name: "Move Right", defaultKey: 0x20, defaultGP: "LS Right" },
    { id: "Attack", name: "Attack / Fire", defaultKey: 0xFF, defaultGP: "R2 / RT" },
    { id: "PowerAttack", name: "Melee / Grenade / Bash", defaultKey: 0x38, defaultGP: "R1 / RB" },
    { id: "Activate", name: "Activate / Interact", defaultKey: 0x12, defaultGP: "X / A" },
    { id: "Jump", name: "Jump", defaultKey: 0x39, defaultGP: "Triangle / Y" },
    { id: "ReadyWeapon", name: "Draw / Reload", defaultKey: 0x13, defaultGP: "Square / X" },
    { id: "Pipboy", name: "Pip-Boy", defaultKey: 0x0F, defaultGP: "Circle / B" },
    { id: "VATS", name: "V.A.T.S.", defaultKey: 0x10, defaultGP: "L1 / LB" },
    { id: "Sprint", name: "Sprint", defaultKey: 0x2A, defaultGP: "L3 Click" },
    { id: "Sneak", name: "Crouch / Sneak", defaultKey: 0x1D, defaultGP: "R3 Click" },
    { id: "Run", name: "Walk / Run Toggle", defaultKey: 0x2E, defaultGP: "---" },
    { id: "ToggleAlwaysRun", name: "Toggle Always Run", defaultKey: 0x3A, defaultGP: "---" },
    { id: "AutoMove", name: "Auto-Move", defaultKey: 0x2D, defaultGP: "---" },
    { id: "Bash", name: "Bash / Power Attack", defaultKey: 0x38, defaultGP: "R1 / RB" },
    { id: "QuickInventory", name: "Quick Inventory", defaultKey: 0x17, defaultGP: "---" },
    { id: "QuickMap", name: "Quick Map", defaultKey: 0x32, defaultGP: "Map Btn" },
    { id: "QuickStats", name: "Quick Stats", defaultKey: 0x25, defaultGP: "---" },
    { id: "QuickRadio", name: "Quick Radio", defaultKey: 0x18, defaultGP: "---" },
    { id: "TogglePOV", name: "Toggle Camera (1st/3rd)", defaultKey: 0x2F, defaultGP: "Touchpad" },
    { id: "Favorites", name: "Favorites Wheel", defaultKey: 0x21, defaultGP: "D-Pad Up" },
    { id: "Wait", name: "Wait (Seated)", defaultKey: 0x14, defaultGP: "---" }
];

export function renderControlMap(content) {
    const list = document.getElementById('keybinds-list');
    if (!list) return;

    if (content) {
        currentControlMapLines = content.split('\n').filter(l => l.trim().length > 0);
    }

    list.innerHTML = '';
    let mapDict = {};

    currentControlMapLines.forEach((line, index) => {
        const clean = line.trim();
        if (!clean || clean.startsWith('//') || clean.startsWith(';')) return;
        const parts = clean.split(/\s+/);
        if (parts.length >= 2) {
            mapDict[parts[0]] = { code: parts[1], lineIndex: index, parts: parts };
        }
    });

    friendlyControlActions.forEach(action => {
        const entry = mapDict[action.id];
        let currentCodeHex = entry ? entry.code : `0x${action.defaultKey.toString(16).toUpperCase()}`;
        const currentCodeInt = parseInt(currentCodeHex, 16);
        const keyName = dxKeyCodes[currentCodeInt] || currentCodeHex;
        const lineIndex = entry ? entry.lineIndex : -1;

        const tr = document.createElement('tr');
        tr.className = 'control-row';
        tr.innerHTML = `
            <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); font-weight: bold;">
                ${action.name}
                <div style="font-size: 10px; color: #666; font-family: monospace;">${action.id}</div>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <button class="key-bind-btn" onclick="listenForKeyBind(this, '${action.id}', ${lineIndex})" style="
                    background: ${lineIndex === -1 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.1)'}; 
                    border: 1px solid ${lineIndex === -1 ? 'rgba(255,255,255,0.2)' : 'var(--f76-yellow)'}; 
                    color: ${lineIndex === -1 ? '#888' : 'var(--f76-yellow)'}; 
                    padding: 4px 12px; 
                    font-size: 14px;
                    cursor: pointer;
                    min-width: 100px;
                    font-family: 'Rajdhani';
                    text-transform: uppercase;">
                    ${keyName}
                </button>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #888; font-size: 13px;">
                ${action.defaultGP}
            </td>
        `;
        list.appendChild(tr);
    });
}

export function getDefaultControlMap() {
    let newContent = "";
    friendlyControlActions.forEach(action => {
        const key = `0x${action.defaultKey.toString(16).toUpperCase()}`;
        newContent += `${action.id}\t${key}\t0xff\t0xff\t1\t1\t0\t0\n`;
    });
    return newContent;
}


window.listenForKeyBind = function (btnElement, actionId, lineIndex) {
    const originalText = btnElement.innerText;
    btnElement.innerText = "PRESS KEY...";
    btnElement.style.background = "var(--f76-yellow)";
    btnElement.style.color = "#000";

    const handler = (e) => {
        e.preventDefault();
        e.stopPropagation();

        let newCode = null;
        let keyName = e.key;

        if (keyName === " ") keyName = "Space";
        if (keyName === "Escape") keyName = "Esc";
        if (keyName === "Control") keyName = "LCtrl";
        if (keyName === "Shift") keyName = "LShift";
        if (keyName.length === 1) keyName = keyName.toUpperCase();

        for (const [hex, name] of Object.entries(dxKeyCodes)) {
            if (name.toUpperCase() === keyName.toUpperCase()) {
                newCode = `0x${parseInt(hex).toString(16).toUpperCase().padStart(2, '0')}`;
                break;
            }
        }

        if (!newCode) {
            console.warn("Unknown mapping for:", keyName);
            btnElement.innerText = "UNKNOWN";
            setTimeout(() => {
                btnElement.innerText = originalText;
                btnElement.style.background = "";
                btnElement.style.color = "";
            }, 1000);
            showNotification(`KEY '${keyName}' NOT SUPPORTED`, true);
            document.removeEventListener('keydown', handler);
            return;
        }

        if (lineIndex !== -1) {
            // Update existing line
            const currentLine = currentControlMapLines[lineIndex];
            const parts = currentLine.trim().split(/\s+/);
            parts[1] = newCode;
            currentControlMapLines[lineIndex] = parts.join('\t');
        } else {
            // Create new entry (appending to custom map)
            // We use a dummy template for other columns as we only know keyboard col
            const newLine = `${actionId}\t${newCode}\t0xff\t0xff\t1\t1\t0\t0`;
            currentControlMapLines.push(newLine);
            showNotification("WARNING: Creating custom map from scratch can cause crashes. Rebind ONE key in-game first!", true);
        }

        renderControlMap();
        showNotification(`KEY REBOUND: ${keyName}`);
        document.removeEventListener('keydown', handler);
    };

    document.addEventListener('keydown', handler, { once: true });
    btnElement.blur();
};
