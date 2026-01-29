import { Slide } from '../../../types';

export const HyperDrive_Slide1 = (id: string): Slide => {
    return {
        id,
        type: 'HyperDrive Intro',
        props: {},
        duration: 150,
        background: {
            type: 'color',
            value: '#18181b'
        },
        elements: [
            {
                id: `${id}-accent-top`,
                type: 'shape',
                content: 'rect',
                x: 0, y: 0, width: 1000, height: 10,
                color: '#6366f1',
                zIndex: 1
            },
            {
                id: `${id}-title`,
                type: 'headline',
                content: 'Project Hyper-Drive',
                x: 0, y: 200, width: 1000, height: 80,
                fontSize: 60, fontWeight: 'bold',
                textColor: '#6366f1', textAlign: 'center',
                verticalAlign: 'center',
                zIndex: 2,
                animation: {
                    type: 'pop',
                    duration: 0.8,
                    delay: 0.2
                }
            },
            {
                id: `${id}-sub-headline`,
                type: 'subheadline',
                content: 'The Next-Generation Serverless Database for Edge Computing',
                x: 0, y: 280, width: 1000, height: 60,
                fontSize: 32, fontWeight: 'normal',
                textColor: '#34d399', textAlign: 'center',
                zIndex: 2,
                animation: {
                    type: 'fade',
                    duration: 1,
                    delay: 0.6
                }
            },
            {
                id: `${id}-glow`,
                type: 'shape',
                content: 'circle',
                x: 800, y: 362, width: 400, height: 400,
                color: '#6366f1',
                opacity: 0.05,
                zIndex: 0
            }
        ]
    };
};
