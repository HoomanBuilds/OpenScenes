import { Slide } from '../../../types';

export const Slide2 = (id: string): Slide => {
    return {
        id,
        type: 'Market Analysis',
        props: {},
        duration: 150, // 5 seconds
        background: { type: 'color', value: '#09090b' },
        elements: [
            {
                id: `${id}-title`,
                type: 'headline',
                content: 'Market Dominance',
                x: 80, y: 60, width: 600,
                color: '#ffffff', fontSize: 42, fontWeight: 'bold',
                opacity: 1, zIndex: 10,
                animation: { type: 'slide', direction: 'right', duration: 0.8, delay: 0 }
            },
            {
                id: `${id}-chart`,
                type: 'chart',
                chartType: 'pie',
                content: 'Bitcoin 48\nEthereum 19\nStablecoins 10\nSolana 5\nOthers 18',
                x: 80, y: 150, width: 500, height: 400,
                color: '#f59e0b',
                chartProps: { showLegend: true, transparent: true },
                opacity: 1, zIndex: 5,
                animation: { type: 'pop', duration: 1, delay: 0.5 }
            },
            {
                id: `${id}-stats-bg`,
                type: 'shape',
                content: '',
                x: 650, y: 150, width: 280, height: 400,
                color: '#18181b', borderRadius: 24,
                opacity: 1, zIndex: 2,
                animation: { type: 'fade', duration: 1, delay: 0.8 }
            },
            {
                id: `${id}-stat-1`,
                type: 'subheadline',
                content: '$2.4T',
                x: 680, y: 200, width: 200,
                color: '#f59e0b', fontSize: 48, fontWeight: 'black',
                opacity: 1, zIndex: 10,
                animation: { type: 'pop', duration: 0.5, delay: 1.2 }
            },
            {
                id: `${id}-stat-label-1`,
                type: 'text',
                content: 'Total Market Cap',
                x: 680, y: 260, width: 200,
                color: '#71717a', fontSize: 16,
                opacity: 1, zIndex: 10,
                animation: { type: 'fade', duration: 0.5, delay: 1.4 }
            },
            {
                id: `${id}-stat-2`,
                type: 'subheadline',
                content: '84%',
                x: 680, y: 350, width: 200,
                color: '#10b981', fontSize: 48, fontWeight: 'black',
                opacity: 1, zIndex: 10,
                animation: { type: 'pop', duration: 0.5, delay: 1.6 }
            },
            {
                id: `${id}-stat-label-2`,
                type: 'text',
                content: 'Yearly Growth',
                x: 680, y: 410, width: 200,
                color: '#71717a', fontSize: 16,
                opacity: 1, zIndex: 10,
                animation: { type: 'fade', duration: 0.5, delay: 1.8 }
            }
        ]
    };
};
