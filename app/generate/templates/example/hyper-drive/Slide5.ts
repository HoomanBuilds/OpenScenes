import { Slide } from '../../../types';

export const HyperDrive_Slide5 = (id: string): Slide => {
    return {
        id,
        type: 'HyperDrive CTA',
        props: {},
        duration: 120,
        background: {
            type: 'color',
            value: '#18181b'
        },
        elements: [
            {
                id: `${id}-header`,
                type: 'headline',
                content: 'Scale to Infinitum.',
                x: 0, y: 180, width: 1000, height: 80,
                fontSize: 60, fontWeight: 'bold',
                textColor: '#34d399', textAlign: 'center',
                zIndex: 2
            },
            {
                id: `${id}-sub`,
                type: 'text',
                content: 'github.com/hyper-drive/core',
                x: 0, y: 280, width: 1000, height: 50,
                fontSize: 32, textColor: '#6366f1', textAlign: 'center',
                zIndex: 2
            },
            {
                id: `${id}-line`,
                type: 'shape',
                content: 'rect',
                x: 400, y: 350, width: 200, height: 4,
                color: '#6366f1',
                zIndex: 1
            }
        ]
    };
};
