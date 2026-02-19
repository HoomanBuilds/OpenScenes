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

export const getFontFamily = (fontName: string): string => {
    return fontFamilyMap[fontName] || fontFamilyMap['Inter'] || 'sans-serif';
};
