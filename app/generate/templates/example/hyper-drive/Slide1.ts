import { Slide } from '../../../types';

export const HyperDrive_Slide1 = (id: string): Slide => {
    return {
        id,
        type: 'HyperDrive Intro',
        props: {},
        duration: 150,
        background: {
            type: 'gradient',
            value: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)'
        },
        elements: [
            {
                id: `${id}-accent-line`,
                type: 'shape',
                content: 'rect',
                x: 0, y: 0, width: 1000, height: 4,
                color: '#6366f1',
                zIndex: 10
            },
            {
                id: `${id}-glow-1`,
                type: 'shape',
                content: 'circle',
                x: -100, y: -100, width: 400, height: 400,
                color: '#6366f1',
                opacity: 0.1,
                borderRadius: 50,
                zIndex: 0
            },
            {
                id: `${id}-glow-2`,
                type: 'shape',
                content: 'circle',
                x: 700, y: 300, width: 500, height: 500,
                color: '#34d399',
                opacity: 0.05,
                borderRadius: 50,
                zIndex: 0
            },
            {
                id: `${id}-title`,
                type: 'headline',
                content: 'PROJECT\nHYPER-DRIVE',
                x: 0, y: 200, width: 1000, height: 160,
                fontSize: 80, 
                fontWeight: '900',
                textColor: '#ffffff', 
                textAlign: 'center',
                verticalAlign: 'center',
                lineHeight: 0.9,
                fontFamily: 'Inter',
                zIndex: 2,
                animation: {
                    type: 'pop',
                    duration: 0.8,
                    delay: 0.2
                }
            },
            {
                id: `${id}-sub-headline`,
                type: 'subheadline',
                content: 'THE NEXT-GENERATION SERVERLESS DATABASE FOR EDGE COMPUTING',
                x: 0, y: 380, width: 1000, height: 40,
                fontSize: 18, 
                fontWeight: '500',
                textColor: '#6366f1', 
                textAlign: 'center',
                fontFamily: 'Inter',
                zIndex: 2,
                animation: {
                    type: 'fade',
                    duration: 1,
                    delay: 0.8
                }
            },
            {
                id: `${id}-badge-bg`,
                type: 'shape',
                content: 'rect',
                x: 440, y: 160, width: 120, height: 24,
                color: '#6366f1',
                borderRadius: 12,
                opacity: 0.2,
                zIndex: 1
            },
            {
                id: `${id}-badge-text`,
                type: 'text',
                content: 'v2.0 PREVIEW',
                x: 440, y: 160, width: 120, height: 24,
                fontSize: 10,
                fontWeight: '900',
                textColor: '#6366f1',
                textAlign: 'center',
                verticalAlign: 'center',
                zIndex: 2
            }
        ]
    };
};
