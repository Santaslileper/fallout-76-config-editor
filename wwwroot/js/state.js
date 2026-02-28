import { settingsSchema } from './schema.js';

// Build the initial config object from the Schema
const initialConfig = {};

settingsSchema.forEach(item => {
    initialConfig[item.prop] = item.default;
});

// Add runtime-only or special fields not in schema (or not yet fully mapped)
// These are essential for the app to function as currently designed.
Object.assign(initialConfig, {
    customIniLines: '',
    readOnly: true,
    pipboyColor: 'green',

    // Legacy/Unmapped but actively used in UI/Presets
    clearWater: false,

    // Keep some placeholders if other parts of the app crash without them.
    // Based on inspection, most unused variables were truly unused.
});

export const config = initialConfig;

export const pipboyColors = {
    green: { r: 0.05, g: 1.0, b: 0.1 },
    amber: { r: 1.0, g: 0.7, b: 0.1 },
    white: { r: 1.0, g: 1.0, b: 1.0 }
};

export const presets = {
    potato: {
        shadowRes: 512,
        shadowDist: 2000,
        grassDist: 1000,
        grassDensity: 40,
        lodActors: 2,
        lodObjects: 2,
        lodItems: 2,
        antialiasing: '0',
        anisotropy: 1,
        // volumetricQuality: 0, // Removed from schema/ini? Check if needed.
        // It's in `presets` but not in `ini.js` parser or generator? 
        // Checking old ini.js... 
        // `volumetricQuality` was NOT in generator. `bVolumetricLightingEnable` (godrays) IS.
        // So `volumetricQuality` was doing nothing. Removing safety.
        computeShaderLighting: false,
        disableGrass: true,
        dof: false,
        mblur: false,
        godrays: false,
        clearWater: true
    },
    medium: {
        shadowRes: 1024,
        shadowDist: 30000,
        grassDist: 3000,
        grassDensity: 30,
        lodActors: 6,
        lodObjects: 6,
        lodItems: 6,
        antialiasing: 'FXAA',
        anisotropy: 8,
        // volumetricQuality: 1,
        computeShaderLighting: true,
        disableGrass: false,
        dof: true,
        mblur: true,
        godrays: true,
        clearWater: false
    },
    high: {
        shadowRes: 2048,
        shadowDist: 60000,
        grassDist: 5000,
        grassDensity: 20,
        lodActors: 10,
        lodObjects: 10,
        lodItems: 10,
        antialiasing: 'TAA',
        anisotropy: 16,
        // volumetricQuality: 2,
        computeShaderLighting: true,
        disableGrass: false,
        dof: true,
        mblur: true,
        godrays: true,
        clearWater: false
    },
    ultra: {
        shadowRes: 2048,
        shadowDist: 120000,
        grassDist: 7000,
        grassDensity: 15,
        lodActors: 15,
        lodObjects: 15,
        lodItems: 15,
        antialiasing: 'TAA',
        anisotropy: 16,
        // volumetricQuality: 3,
        computeShaderLighting: true,
        disableGrass: false,
        dof: true,
        mblur: true,
        godrays: true,
        clearWater: false
    }
};

export const defaultConfig = JSON.parse(JSON.stringify(config));

export const state = {
    currentTab: 'general',
    savedConfig: null,
    savedControlMap: null, // Ensure this exists as logic uses it
    configMap: {}
};
