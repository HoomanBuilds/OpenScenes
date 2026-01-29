import { Slide } from '../../../types';

export const HyperDrive_Slide2 = (id: string): Slide => {
    return {
        id,
        type: 'HyperDrive Features',
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
                content: 'Core Features',
                x: 50, y: 50, width: 900, height: 80,
                fontSize: 60, fontWeight: 'bold',
                textColor: '#6366f1', textAlign: 'left',
                zIndex: 2
            },
            {
                id: `${id}-list`,
                type: 'text',
                textFormat: 'markdown',
                content: '- 0ms Cold Starts via V8 snapshots\n- Global replication across 24 regions\n- SQL-compatible Key-Value performance\n- AI-native Vector Search built-in',
                x: 80, y: 180, width: 840, height: 300,
                fontSize: 32, fontWeight: 'normal',
                textColor: '#d1d5db', textAlign: 'left',
                verticalAlign: 'top',
                zIndex: 2,
                animation: {
                    type: 'slide',
                    duration: 0.8,
                    delay: 0.3,
                    direction: 'right'
                }
            }
        ]
    };
};
