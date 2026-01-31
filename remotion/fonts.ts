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
import { loadFont as loadPressStart2P } from '@remotion/google-fonts/PressStart2P';
import { loadFont as loadVT323 } from '@remotion/google-fonts/VT323';

// Load fonts with only latin subset and common weights to reduce network requests
// Note: We use type assertion to any to avoid strict type mismatches with @remotion/google-fonts definitions
const options = { subsets: ['latin'], weights: ['400', '700'], ignoreTooManyRequestsWarning: true } as any;
const normalOptions = { subsets: ['latin'], ignoreTooManyRequestsWarning: true } as any;

const { fontFamily: interFamily } = loadInter('normal', options);
const { fontFamily: robotoFamily } = loadRoboto('normal', options);
const { fontFamily: robotoMonoFamily } = loadRobotoMono('normal', options);
const { fontFamily: merriweatherFamily } = loadMerriweather('normal', options);
const { fontFamily: oswaldFamily } = loadOswald('normal', options);
const { fontFamily: playfairFamily } = loadPlayfairDisplay('normal', options);
const { fontFamily: bebasFamily } = loadBebasNeue('normal', normalOptions);
const { fontFamily: loraFamily } = loadLora('normal', options);
const { fontFamily: montserratFamily } = loadMontserrat('normal', options);
const { fontFamily: latoFamily } = loadLato('normal', options);
const { fontFamily: openSansFamily } = loadOpenSans('normal', options);
const { fontFamily: poppinsFamily } = loadPoppins('normal', options);
const { fontFamily: pressStart2PFamily } = loadPressStart2P('normal', normalOptions);
const { fontFamily: vt323Family } = loadVT323('normal', normalOptions);

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
    'Press Start 2P': pressStart2PFamily,
    'VT323': vt323Family,
};

export const getFontFamily = (fontName: string): string => {
    return fontFamilyMap[fontName] || fontFamilyMap['Inter'] || 'sans-serif';
};
