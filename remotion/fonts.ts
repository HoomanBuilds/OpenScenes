import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadRoboto } from '@remotion/google-fonts/Roboto';
import { loadFont as loadRobotoMono } from '@remotion/google-fonts/RobotoMono';
import { loadFont as loadMerriweather } from '@remotion/google-fonts/Merriweather';
import { loadFont as loadOswald } from '@remotion/google-fonts/Oswald';
import { loadFont as loadPlayfairDisplay } from '@remotion/google-fonts/PlayfairDisplay';
import { loadFont as loadBebasNeue } from '@remotion/google-fonts/BebasNeue';
import { loadFont as loadLora } from '@remotion/google-fonts/Lora';
import { loadFont as loadMontserrat } from '@remotion/google-fonts/Montserrat';
import { loadFont as loadLato } from '@remotion/google-fonts/Lato';
import { loadFont as loadOpenSans } from '@remotion/google-fonts/OpenSans';
import { loadFont as loadPoppins } from '@remotion/google-fonts/Poppins';
import { loadFont as loadVT323 } from '@remotion/google-fonts/VT323';
import { loadFont as loadOrbitron } from '@remotion/google-fonts/Orbitron';
import { loadFont as loadOutfit } from '@remotion/google-fonts/Outfit';

// Use more stable loading options
const heavyOptions = { 
    subsets: ['latin'], 
    weights: ['400', '700', '900'],
    ignoreTooManyRequestsWarning: true
};

const boldOptions = { 
    subsets: ['latin'], 
    weights: ['400', '700'],
    ignoreTooManyRequestsWarning: true
};

const regularOptions = { 
    subsets: ['latin'], 
    weights: ['400'],
    ignoreTooManyRequestsWarning: true
};

// Fallback helper to prevent render crashes if a font weight is missing
const safeLoad = (loader: any, options: any, fallbackName: string) => {
    try {
        const { fontFamily } = loader('normal', options);
        return fontFamily;
    } catch (e) {
        console.warn(`[SafeFontLoad] Failed to load font with options, falling back to regular:`, e);
        try {
            // Try loading only the regular weight
            const { fontFamily } = loader('normal', { 
                weights: ['400'], 
                subsets: ['latin'],
                ignoreTooManyRequestsWarning: true 
            });
            return fontFamily;
        } catch (e2) {
             console.error(`[SafeFontLoad] Critical failure loading font:`, fallbackName, e2);
             return fallbackName;
        }
    }
};

const interFamily = safeLoad(loadInter, heavyOptions, 'Inter');
const robotoFamily = safeLoad(loadRoboto, heavyOptions, 'Roboto');
const robotoMonoFamily = safeLoad(loadRobotoMono, boldOptions, 'Roboto Mono');
const merriweatherFamily = safeLoad(loadMerriweather, heavyOptions, 'Merriweather');
const oswaldFamily = safeLoad(loadOswald, boldOptions, 'Oswald');
const playfairFamily = safeLoad(loadPlayfairDisplay, heavyOptions, 'Playfair Display');
const bebasFamily = safeLoad(loadBebasNeue, regularOptions, 'Bebas Neue');
const loraFamily = safeLoad(loadLora, boldOptions, 'Lora');
const montserratFamily = safeLoad(loadMontserrat, heavyOptions, 'Montserrat');
const latoFamily = safeLoad(loadLato, heavyOptions, 'Lato');
const openSansFamily = safeLoad(loadOpenSans, boldOptions, 'Open Sans');
const poppinsFamily = safeLoad(loadPoppins, heavyOptions, 'Poppins');
const vt323Family = safeLoad(loadVT323, regularOptions, 'VT323');
const orbitronFamily = safeLoad(loadOrbitron, heavyOptions, 'Orbitron');
const outfitFamily = safeLoad(loadOutfit, heavyOptions, 'Outfit');

export const fontFamilyMap: Record<string, string> = {
    'Inter': interFamily,
    'Roboto': robotoFamily,
    'Roboto Mono': robotoMonoFamily,
    'Merriweather': merriweatherFamily,
    'Oswald': oswaldFamily,
    'Playfair Display': playfairFamily,
    'Bebas Neue': bebasFamily,
    'Lora': loraFamily,
    'Montserrat': montserratFamily,
    'Lato': latoFamily,
    'Open Sans': openSansFamily,
    'Poppins': poppinsFamily,
    'VT323': vt323Family,
    'Orbitron': orbitronFamily,
    'Outfit': outfitFamily,
};

// Maps each font to the numeric weights that were actually loaded
const loadedWeights: Record<string, number[]> = {
    'Inter': [400, 700, 900],
    'Roboto': [400, 700, 900],
    'Roboto Mono': [400, 700],
    'Merriweather': [400, 700, 900],
    'Oswald': [400, 700],
    'Playfair Display': [400, 700, 900],
    'Bebas Neue': [400],
    'Lora': [400, 700],
    'Montserrat': [400, 700, 900],
    'Lato': [400, 700, 900],
    'Open Sans': [400, 700],
    'Poppins': [400, 700, 900],
    'VT323': [400],
    'Orbitron': [400, 700, 900],
    'Outfit': [400, 700, 900],
};

// Named weight lookup
const namedWeightMap: Record<string, number> = {
    'normal': 400,
    'bold': 700,
    'semibold': 600,
    'bolder': 700,
    'lighter': 400,
};

export const getFontFamily = (fontName: string): string => {
    return fontFamilyMap[fontName] || fontFamilyMap['Inter'] || 'sans-serif';
};

/**
 * Clamps a requested fontWeight to the nearest weight that was actually loaded
 * for the given font, preventing Remotion render crashes.
 */
export const getSafeFontWeight = (fontName: string, weight: string | number | undefined): string | number => {
    if (weight === undefined) return 'normal';

    // Convert named weights to numeric
    const numericWeight = typeof weight === 'string'
        ? (namedWeightMap[weight.toLowerCase()] ?? parseInt(weight, 10))
        : weight;

    // If it's not a valid number, return as-is (e.g. 'normal', 'bold')
    if (isNaN(numericWeight)) return weight;

    const available = loadedWeights[fontName] || loadedWeights['Inter'] || [400, 700];

    // If the exact weight is available, use it
    if (available.includes(numericWeight)) return numericWeight;

    // Otherwise find the closest available weight
    let closest = available[0];
    let minDiff = Math.abs(numericWeight - closest);
    for (const w of available) {
        const diff = Math.abs(numericWeight - w);
        if (diff < minDiff) {
            closest = w;
            minDiff = diff;
        }
    }
    return closest;
};
