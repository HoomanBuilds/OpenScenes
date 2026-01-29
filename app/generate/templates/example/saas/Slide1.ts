import { Slide } from '../../../types';

export const SaaS_Slide1 = (id: string): Slide => {
    return {
        id,
        type: 'SaaS Intro',
        props: {},
        duration: 120,
        background: { 
            type: 'gradient', 
            value: 'radial-gradient(circle at top right, #1e1b4b 0%, #09090b 100%)' 
        },
        elements: [
            {
                id: `${id}-glow`,
                type: 'shape',
                content: '',
                x: -100, y: -100, width: 600, height: 600,
                color: '#22d3ee', borderRadius: 999,
                opacity: 0.05, zIndex: 0,
                animation: { type: 'fade', duration: 3, delay: 0 }
            },
            {
                id: `${id}-badge`,
                type: 'shape',
                content: '',
                x: 100, y: 100, width: 140, height: 32,
                color: '#22d3ee', borderRadius: 16,
                opacity: 0.1, zIndex: 5,
                animation: { type: 'fade', duration: 1, delay: 0.2 }
            },
            {
                id: `${id}-badge-text`,
                type: 'text',
                content: 'v2.0 IS LIVE',
                x: 120, y: 106, width: 100,
                color: '#22d3ee', fontSize: 12, fontWeight: 'bold',
                textAlign: 'center',
                opacity: 1, zIndex: 10,
                animation: { type: 'fade', duration: 1, delay: 0.4 }
            },
            {
                id: `${id}-title`,
                type: 'headline',
                content: 'Automate your\nWorkflow with AI',
                x: 100, y: 160, width: 800,
                color: '#ffffff', fontSize: 84, fontWeight: 'black',
                lineHeight: 1.1,
                opacity: 1, zIndex: 10,
                animation: { type: 'slide', direction: 'up', duration: 1, delay: 0.6 }
            },
            {
                id: `${id}-sub`,
                type: 'subheadline',
                content: 'The all-in-one platform for modern engineering teams.',
                x: 100, y: 400, width: 500,
                color: '#94a3b8', fontSize: 24,
                opacity: 1, zIndex: 10,
                animation: { type: 'fade', duration: 1, delay: 1.2 }
            }
        ]
    };
};
