import { Slide } from '../../../types';

export const HyperDrive_Slide3 = (id: string): Slide => {
    return {
        id,
        type: 'HyperDrive Performance',
        props: {},
        duration: 200,
        background: {
            type: 'color',
            value: '#18181b'
        },
        elements: [
            {
                id: `${id}-header`,
                type: 'headline',
                content: 'Global Latency (ms)',
                x: 0, y: 40, width: 1000, height: 80,
                fontSize: 60, fontWeight: 'bold',
                textColor: '#6366f1', textAlign: 'center',
                zIndex: 2
            },
            {
                id: `${id}-chart`,
                type: 'chart',
                chartType: 'bar',
                content: 'US-East 12 85\nEurope 15 92\nAsia 22 110\nSouth-Am 28 145',
                x: 150, y: 150, width: 700, height: 350,
                chartProps: {
                    colors: ['#34d399', '#ef4444'],
                    showXAxis: true,
                    showYAxis: true,
                    showGrid: true,
                    showLegend: true
                },
                zIndex: 1,
                animation: {
                    type: 'scale',
                    duration: 1,
                    delay: 0.5
                }
            }
        ]
    };
};
