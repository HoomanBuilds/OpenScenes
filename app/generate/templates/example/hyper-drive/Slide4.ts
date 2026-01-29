import { Slide } from '../../../types';

export const HyperDrive_Slide4 = (id: string): Slide => {
    return {
        id,
        type: 'HyperDrive Comparison',
        props: {},
        duration: 150,
        background: {
            type: 'color',
            value: '#18181b'
        },
        elements: [
            {
                id: `${id}-header`,
                type: 'headline',
                content: 'Eliminating the Cloud Tax',
                x: 0, y: 50, width: 1000, height: 80,
                fontSize: 60, fontWeight: 'bold',
                textColor: '#6366f1', textAlign: 'center',
                zIndex: 2
            },
            {
                id: `${id}-box-legacy`,
                type: 'shape',
                content: 'rect',
                x: 100, y: 180, width: 350, height: 250,
                color: '#1f2937', borderRadius: 12,
                zIndex: 1
            },
            {
                id: `${id}-box-hyper`,
                type: 'shape',
                content: 'rect',
                x: 550, y: 180, width: 350, height: 250,
                color: '#064e3b', borderRadius: 12,
                zIndex: 1
            },
            {
                id: `${id}-legacy-text`,
                type: 'text',
                content: 'Legacy Clouds\nIdle Overhead\nCold Starts\nFixed Billing',
                x: 120, y: 210, width: 310, height: 200,
                fontSize: 24, textColor: '#9ca3af', textAlign: 'center',
                zIndex: 2
            },
            {
                id: `${id}-hyper-text`,
                type: 'text',
                content: 'Hyper-Drive\n0% Idle Cost\nInstant Start\nConsumption Only',
                x: 570, y: 210, width: 310, height: 200,
                fontSize: 24, textColor: '#34d399', textAlign: 'center',
                fontWeight: 'bold',
                zIndex: 2
            }
        ]
    };
};
