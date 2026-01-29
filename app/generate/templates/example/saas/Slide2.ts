import { Slide } from '../../../types';

export const SaaS_Slide2 = (id: string): Slide => {
    return {
        id,
        type: 'SaaS Metrics',
        props: {},
        duration: 150,
        background: { type: 'color', value: '#09090b' },
        elements: [
            {
                id: `${id}-title`,
                type: 'headline',
                content: 'Unprecedented Growth',
                x: 80, y: 60, width: 600,
                color: '#ffffff', fontSize: 42, fontWeight: 'bold',
                opacity: 1, zIndex: 10,
                animation: { type: 'slide', direction: 'right', duration: 0.8, delay: 0 }
            },
            {
                id: `${id}-chart-bg`,
                type: 'shape',
                content: '',
                x: 80, y: 150, width: 840, height: 400,
                color: '#111114', borderRadius: 24,
                opacity: 1, zIndex: 2,
                animation: { type: 'fade', duration: 1, delay: 0.5 }
            },
            {
                id: `${id}-chart`,
                type: 'chart',
                chartType: 'area',
                content: 'Mon 2400 1400\nTue 3200 1800\nWed 4500 2100\nThu 5100 2400\nFri 6200 3200\nSat 7800 4500\nSun 9400 5200',
                x: 120, y: 190, width: 760, height: 320,
                color: '#22d3ee',
                chartProps: { showGrid: false, showXAxis: true, transparent: true },
                opacity: 1, zIndex: 5,
                animation: { type: 'fade', duration: 1.5, delay: 1 }
            },
            {
                id: `${id}-metric-label`,
                type: 'text',
                content: 'Active Users',
                x: 120, y: 170, width: 200,
                color: '#94a3b8', fontSize: 14, fontWeight: 'bold',
                opacity: 1, zIndex: 10,
                animation: { type: 'fade', duration: 0.5, delay: 1.2 }
            }
        ]
    };
};
