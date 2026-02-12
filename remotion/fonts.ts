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
const options = { 
    subsets: ['latin'], 
    weights: ['400', '700', '900'],
    ignoreTooManyRequestsWarning: true
};

const normalOnlyOptions = { 
    subsets: ['latin'], 
    weights: ['400'],
    ignoreTooManyRequestsWarning: true
};

const { fontFamily: interFamily } = loadInter('normal', options as any);
const { fontFamily: robotoFamily } = loadRoboto('normal', options as any);
const { fontFamily: robotoMonoFamily } = loadRobotoMono('normal', options as any);
const { fontFamily: merriweatherFamily } = loadMerriweather('normal', options as any);
const { fontFamily: oswaldFamily } = loadOswald('normal', options as any);
const { fontFamily: playfairFamily } = loadPlayfairDisplay('normal', options as any);
const { fontFamily: bebasFamily } = loadBebasNeue('normal', normalOnlyOptions as any);
const { fontFamily: loraFamily } = loadLora('normal', options as any);
const { fontFamily: montserratFamily } = loadMontserrat('normal', options as any);
const { fontFamily: latoFamily } = loadLato('normal', options as any);
const { fontFamily: openSansFamily } = loadOpenSans('normal', options as any);
const { fontFamily: poppinsFamily } = loadPoppins('normal', options as any);
const { fontFamily: vt323Family } = loadVT323('normal', normalOnlyOptions as any);
const { fontFamily: orbitronFamily } = loadOrbitron('normal', options as any);
const { fontFamily: outfitFamily } = loadOutfit('normal', options as any);

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
