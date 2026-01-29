import { Slide } from '../../../types';

export const HyperDrive_Slide3 = (id: string): Slide => {
    return {
        id,
        type: 'HyperDrive Performance',
        props: {},
        duration: 200,
        background: {
            type: 'color',
            value: '#09090b'
        },
        elements: [
            {
                id: `${id}-bg-grid`,
                type: 'shape',
                content: 'rect',
                x: 0, y: 0, width: 1000, height: 562.5,
                color: '#6366f1',
                opacity: 0.02,
                zIndex: 0
            },
            {
                id: `${id}-header`,
                type: 'headline',
                content: 'GLOBAL PERFORMANCE',
                x: 0, y: 60, width: 1000, height: 50,
                fontSize: 32, 
                fontWeight: '900',
                textColor: '#ffffff', 
                textAlign: 'center',
                fontFamily: 'Inter',
                zIndex: 2
            },
            {
                id: `${id}-sub`,
                type: 'text',
                content: 'Average Read Latency (ms) - Lower is Better',
                x: 0, y: 110, width: 1000, height: 30,
                fontSize: 14,
                textColor: '#6b7280',
                textAlign: 'center',
                zIndex: 2
            },
            {
                id: `${id}-chart-container`,
                type: 'shape',
                content: 'rect',
                x: 100, y: 160, width: 800, height: 340,
                color: '#18181b',
                borderRadius: 16,
                strokeWidth: 1,
                strokeColor: '#27272a',
                zIndex: 1
            },
            {
                id: `${id}-chart`,
                type: 'chart',
                chartType: 'bar',
                content: 'US-East 12 85\nEurope 15 92\nAsia 22 110\nSouth-Am 28 145',
                x: 130, y: 190, width: 740, height: 280,
                chartProps: {
                    colors: ['#6366f1', '#34d399'],
                    showXAxis: true,
                    showYAxis: true,
                    showGrid: false,
                    showLegend: true,
                    transparent: true
                },
                zIndex: 2,
                animation: {
                    type: 'scale',
                    duration: 1,
                    delay: 0.5
                }
            },
            {
                id: `${id}-accent`,
                type: 'shape',
                content: 'circle',
                x: 880, y: 50, width: 40, height: 40,
                color: '#34d399',
                opacity: 0.2,
                borderRadius: 50,
                zIndex: 1
            }
        ]
    };
};
