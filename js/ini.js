import { config, pipboyColors } from './state.js';
import { settingsSchema } from './schema.js';

/**
 * Parses a simple INI string into a structured object:
 * { 'Section': { 'key': 'value' } }
 * Keys are normalized to lowercase.
 */
function parseIniString(iniStr) {
    const sections = {};
    let currentSection = null;

    if (!iniStr) return sections;

    const lines = iniStr.split(/\r?\n/);
    lines.forEach(line => {
        const clean = line.trim();
        if (!clean || clean.startsWith(';')) return;

        if (clean.startsWith('[') && clean.endsWith(']')) {
            const secName = clean.slice(1, -1).trim();
            if (!sections[secName]) sections[secName] = {};
            currentSection = sections[secName];
        } else if (currentSection) {
            const parts = clean.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim().toLowerCase().replace(/\s+/g, ' '); // Normalize: "isize   w" -> "isize w"
                // Handle value with potential comments? Assuming no inline comments for now or simple split.
                // Re-join parts > 1 in case value contains =? INI usually doesn't, but safely:
                const value = parts.slice(1).join('=').trim();
                currentSection[key] = value;
            }
        }
    });

    return sections;
}

/**
 * Merges source INI object into target INI object.
 * Target is modified in place.
 */
function mergeIniData(target, source) {
    for (const [sec, data] of Object.entries(source)) {
        if (!target[sec]) target[sec] = {};
        for (const [key, val] of Object.entries(data)) {
            target[sec][key] = val;
        }
    }
}

export function parseIniToConfig(customStr, prefsStr, baseStr) {
    // 1. Reset Config
    config.customIniLines = '';

    // 2. Parse all files and merge: Base -> Prefs -> Custom
    const combinedData = {};
    const baseData = parseIniString(baseStr);
    const prefsData = parseIniString(prefsStr);
    const customData = parseIniString(customStr);

    mergeIniData(combinedData, baseData);
    mergeIniData(combinedData, prefsData);
    mergeIniData(combinedData, customData);

    // 3. Extract Schema Settings
    settingsSchema.forEach(item => {
        // Handle "resolution" special case
        if (item.id === 'resolution') {
            const sec = combinedData['Display'];
            if (sec) {
                const w = sec['isize w'];
                const h = sec['isize h'];
                if (w && h) {
                    config.resolution = `${w}x${h}`;
                }
            }
            return;
        }

        // Handle "window-mode" special case
        if (item.id === 'window-mode') {
            const sec = combinedData['Display'];
            if (sec) {
                const full = sec['bfull screen'] === '1';
                const borderless = sec['bborderless'] === '1';
                if (full) config.windowMode = 'fullscreen';
                else if (borderless) config.windowMode = 'borderless';
                else config.windowMode = 'windowed';
            }
            return;
        }

        // Standard Schema Items
        const section = combinedData[item.section];
        if (section) {
            const valStr = section[item.key.toLowerCase()];
            if (valStr !== undefined) {
                let parsedVal;

                if (item.parse) {
                    parsedVal = item.parse(valStr);
                } else if (item.type === 'bool') {
                    parsedVal = (valStr === '1');
                } else if (item.type === 'int') {
                    parsedVal = parseInt(valStr);
                } else if (item.type === 'float') {
                    parsedVal = parseFloat(valStr);
                } else {
                    parsedVal = valStr;
                }

                if (!isNaN(parsedVal)) {
                    config[item.prop] = parsedVal;
                }
            }
        }
    });

    // 4. Extract Custom Lines (Unrecognized lines in Custom.ini)
    // We re-scan the customStr. Any line that maps to a schema property is skipped.
    // Anything else is preserved.

    // Build a lookup of "handled" Section+Key pairs
    const handledKeys = new Set();
    settingsSchema.forEach(item => {
        if (item.key) handledKeys.add(`${item.section.toLowerCase()}:${item.key.toLowerCase()}`);
    });
    // Add special cases
    handledKeys.add('display:isize w');
    handledKeys.add('display:isize h');
    handledKeys.add('display:bfull screen');
    handledKeys.add('display:bborderless');

    const resultLines = [];
    let currentSec = null;
    let pendingSecHeader = null;

    customStr.split(/\r?\n/).forEach(line => {
        const clean = line.trim();
        if (!clean) return; // Skip empty lines in custom block
        if (clean === '; [CUSTOM_USER_LINES]') return; // Skip marker

        if (clean.startsWith('[') && clean.endsWith(']')) {
            currentSec = clean.slice(1, -1).trim().toLowerCase();
            pendingSecHeader = line;
            return;
        }

        // If it's a value line
        if (currentSec && clean.includes('=') && !clean.startsWith(';')) {
            const parts = clean.split('=');
            const key = parts[0].trim().toLowerCase().replace(/\s+/g, ' ');

            if (handledKeys.has(`${currentSec}:${key}`)) {
                // This line is managed by our schema! Skip it in custom lines.
                return;
            }
        }

        // If we are here, it's either a comment, or an unmanaged setting.
        // If we found a useful line, ensure we added the section header if needed.
        if (pendingSecHeader) {
            resultLines.push(pendingSecHeader);
            pendingSecHeader = null;
        }
        resultLines.push(line);
    });

    config.customIniLines = resultLines.join('\n');


    // 5. Intelligent Color Matching
    let matched = 'custom';
    for (const [name, colors] of Object.entries(pipboyColors)) {
        if (Math.abs(config.pipboyR - colors.r) < 0.001 &&
            Math.abs(config.pipboyG - colors.g) < 0.001 &&
            Math.abs(config.pipboyB - colors.b) < 0.001) {
            matched = name;
            break;
        }
    }
    config.pipboyColor = matched;
}

/**
 * Generic Generator
 */
function generateIniContent(targetFile) {
    const sections = {}; // 'Section' -> ['Key=Val']

    // Helper
    const addLine = (sec, line) => {
        if (!sections[sec]) sections[sec] = [];
        sections[sec].push(line);
    };

    settingsSchema.forEach(item => {
        // Filter by file
        const itemFile = item.file || 'custom';
        if (itemFile !== targetFile) return;

        // Skip resolution/window-mode special handling here? 
        // No, we handle them implicitly by checking if they are "custom" or "prefs".
        // Resolution is 'prefs'. WindowMode is 'prefs'.

        if (item.id === 'resolution') {
            const parts = config.resolution.split('x');
            const w = parts[0] || '1920';
            const h = parts[1] || '1080';
            addLine('Display', `iSize W=${w}`);
            addLine('Display', `iSize H=${h}`);
            return;
        }

        if (item.id === 'window-mode') {
            addLine('Display', `bFull Screen=${config.windowMode === 'fullscreen' ? 1 : 0}`);
            addLine('Display', `bBorderless=${config.windowMode === 'borderless' ? 1 : 0}`);
            return;
        }

        // Standard
        let valStr;
        const val = config[item.prop];

        if (item.format) {
            valStr = item.format(val);
        } else if (item.type === 'bool') {
            valStr = val ? '1' : '0';
        } else if (item.type === 'float') {
            if (typeof item.precision === 'number') valStr = val.toFixed(item.precision);
            else valStr = val.toString(); // or toFixed(4) default? Old used var.
            // Let's default to fixed(4) if float, unless strict.
            if (!valStr.includes('.')) valStr = val.toFixed(1);
        } else {
            valStr = val.toString();
        }

        if (valStr !== undefined) {
            addLine(item.section, `${item.key}=${valStr}`);
        }
    });

    let output = `; Fallout 76 ${targetFile.toUpperCase()} Configuration\n\n`;

    for (const [sec, lines] of Object.entries(sections)) {
        output += `[${sec}]\n${lines.join('\n')}\n\n`;
    }

    return output;
}

export function generateFallout76Ini() {
    let ini = generateIniContent('custom');

    // Append Custom User Lines in their own block/comment
    if (config.customIniLines) {
        ini += `\n; [CUSTOM_USER_LINES]\n${config.customIniLines}`;
    }
    return ini;
}

export function generateFallout76PrefsIni() {
    return generateIniContent('prefs');
}
