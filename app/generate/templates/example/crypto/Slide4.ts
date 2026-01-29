import { Slide } from '../../../types';

export const Slide4 = (id: string): Slide => {
    return {
        id,
        type: 'Roadmap',
        props: {},
        duration: 120,
        background: { type: 'color', value: '#09090b' },
        elements: [
            {
                id: `${id}-title`,
                type: 'headline',
                content: 'Strategic Roadmap 2026',
                x: 80, y: 60, width: 800,
                color: '#ffffff', fontSize: 42, fontWeight: 'black',
                opacity: 1, zIndex: 10,
                animation: { type: 'slide', direction: 'down', duration: 0.8, delay: 0 }
            },
            {
                id: `${id}-line-bg`,
                type: 'shape',
                content: '',
                x: 80, y: 300, width: 840, height: 2,
                color: '#3f3f46',
                opacity: 0.5, zIndex: 1,
                animation: { type: 'fade', duration: 1, delay: 0.5 }
            },
            // Phase 1
            {
                id: `${id}-dot-1`,
                type: 'shape',
                content: '',
                x: 80, y: 291, width: 20, height: 20,
                color: '#f59e0b', borderRadius: 99,
                opacity: 1, zIndex: 5,
                animation: { type: 'pop', duration: 0.5, delay: 1 }
            },
            {
                id: `${id}-p1`,
                type: 'subheadline',
                content: 'Phase 01',
                x: 80, y: 330, width: 200,
                color: '#f59e0b', fontSize: 24, fontWeight: 'bold',
                opacity: 1, zIndex: 10,
                animation: { type: 'fade', duration: 0.5, delay: 1.2 }
            },
            {
                id: `${id}-p1-desc`,
                type: 'text',
                content: 'Infrastucture Build & Core Protocol Launch',
                x: 80, y: 370, width: 220,
                color: '#71717a', fontSize: 16,
                opacity: 1, zIndex: 10,
                animation: { type: 'fade', duration: 0.5, delay: 1.4 }
            },
            // Phase 2
            {
                id: `${id}-dot-2`,
                type: 'shape',
                content: '',
                x: 480, y: 291, width: 20, height: 20,
                color: '#3b82f6', borderRadius: 99,
                opacity: 1, zIndex: 5,
                animation: { type: 'pop', duration: 0.5, delay: 1.6 }
            },
            {
                id: `${id}-p2`,
                type: 'subheadline',
                content: 'Phase 02',
                x: 480, y: 330, width: 200,
                color: '#3b82f6', fontSize: 24, fontWeight: 'bold',
                opacity: 1, zIndex: 10,
                animation: { type: 'fade', duration: 0.5, delay: 1.8 }
            },
            {
                id: `${id}-p2-desc`,
                type: 'text',
                content: 'Global Exchange Listing & Liquidity Farming',
                x: 480, y: 370, width: 220,
                color: '#71717a', fontSize: 16,
                opacity: 1, zIndex: 10,
                animation: { type: 'fade', duration: 0.5, delay: 2 }
            }
        ]
    };
};
