import { Slide } from '../../../types';

export const SaaS_Slide3 = (id: string): Slide => {
    return {
        id,
        type: 'SaaS Pricing',
        props: {},
        duration: 120,
        background: { type: 'color', value: '#09090b' },
        elements: [
            {
                id: `${id}-title`,
                type: 'headline',
                content: 'Ready to Scale?',
                x: 0, y: 80, width: 1280,
                color: '#ffffff', fontSize: 56, fontWeight: 'black',
                textAlign: 'center',
                opacity: 1, zIndex: 10,
                animation: { type: 'slide', direction: 'down', duration: 0.8, delay: 0 }
            },
            // Pricing Card 1 (Pro)
            {
                id: `${id}-card-1`,
                type: 'shape',
                content: '',
                x: 340, y: 200, width: 280, height: 350,
                color: '#18181b', borderRadius: 24,
                strokeWidth: 1, strokeColor: '#27272a',
                opacity: 1, zIndex: 2,
                animation: { type: 'pop', duration: 0.6, delay: 0.5 }
            },
            {
                id: `${id}-plan-1`,
                type: 'subheadline',
                content: 'Pro Plan',
                x: 370, y: 240, width: 220,
                color: '#ffffff', fontSize: 24, fontWeight: 'bold',
                opacity: 1, zIndex: 10,
                animation: { type: 'fade', duration: 0.5, delay: 0.8 }
            },
            {
                id: `${id}-price-1`,
                type: 'headline',
                content: '$49/mo',
                x: 370, y: 280, width: 220,
                color: '#22d3ee', fontSize: 42, fontWeight: 'black',
                opacity: 1, zIndex: 10,
                animation: { type: 'fade', duration: 0.5, delay: 1 }
            },
            // Pricing Card 2 (Enterprise)
            {
                id: `${id}-card-2`,
                type: 'shape',
                content: '',
                x: 660, y: 200, width: 280, height: 350,
                color: '#1e1b4b', borderRadius: 24,
                strokeWidth: 2, strokeColor: '#4f46e5',
                opacity: 1, zIndex: 2,
                animation: { type: 'pop', duration: 0.6, delay: 0.7 }
            },
            {
                id: `${id}-plan-2`,
                type: 'subheadline',
                content: 'Enterprise',
                x: 690, y: 240, width: 220,
                color: '#ffffff', fontSize: 24, fontWeight: 'bold',
                opacity: 1, zIndex: 10,
                animation: { type: 'fade', duration: 0.5, delay: 1 }
            },
            {
                id: `${id}-price-2`,
                type: 'headline',
                content: 'Custom',
                x: 690, y: 280, width: 220,
                color: '#818cf8', fontSize: 42, fontWeight: 'black',
                opacity: 1, zIndex: 10,
                animation: { type: 'fade', duration: 0.5, delay: 1.2 }
            },
            {
                id: `${id}-cta`,
                type: 'text',
                content: 'Contact sales to get a personalized demo.',
                x: 0, y: 600, width: 1280,
                color: '#71717a', fontSize: 18,
                textAlign: 'center',
                opacity: 1, zIndex: 10,
                animation: { type: 'fade', duration: 1, delay: 1.5 }
            }
        ]
    };
};
