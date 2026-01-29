import { Slide } from '../../../types';

export const Slide1 = (id: string): Slide => {
    return {
        id,
        type: 'Crypto Intro',
        props: {},
        duration: 120,
        background: { 
            type: 'gradient', 
            value: 'linear-gradient(135deg, #09090b 0%, #1e1b4b 100%)' 
        },
        elements: [
            {
                id: `${id}-bg-icon`,
                type: 'icon',
                content: 'bitcoin',
                x: 800, y: 100, width: 400, height: 400,
                color: 'rgba(245, 158, 11, 0.05)',
                fontSize: 400,
                opacity: 1, zIndex: 0, rotation: 15,
                animation: { type: 'fade', duration: 2, delay: 0 }
            },
            {
                id: `${id}-title`,
                type: 'headline',
                content: 'The Future of\nFinance is Here',
                x: 100, y: 250, width: 800,
                color: '#ffffff', fontSize: 84, fontWeight: 'black',
                opacity: 1, zIndex: 10,
                animation: { type: 'slide', direction: 'up', duration: 1, delay: 0.2 }
            },
            {
                id: `${id}-sub`,
                type: 'subheadline',
                content: 'Understanding the Shift to Decentralized Systems',
                x: 105, y: 460, width: 600,
                color: '#f59e0b', fontSize: 24, fontWeight: 'medium',
                opacity: 1, zIndex: 10,
                animation: { type: 'fade', duration: 1, delay: 0.8 }
            },
            {
                id: `${id}-line`,
                type: 'shape',
                content: '',
                x: 100, y: 440, width: 50, height: 4,
                color: '#f59e0b',
                opacity: 1, zIndex: 10,
                animation: { type: 'scale', duration: 0.5, delay: 0.5 }
            }
        ]
    };
};
