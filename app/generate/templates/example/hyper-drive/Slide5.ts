import { Slide } from '../../../types';

export const HyperDrive_Slide5 = (id: string): Slide => {
    return {
        id,
        type: 'HyperDrive CTA',
        props: {},
        duration: 150,
        background: {
            type: 'gradient',
            value: 'linear-gradient(225deg, #09090b 0%, #064e3b 100%)'
        },
        elements: [
            {
                id: `${id}-glow`,
                type: 'shape',
                content: 'circle',
                x: 300, y: 100, width: 400, height: 400,
                color: '#34d399',
                opacity: 0.1,
                borderRadius: 50,
                zIndex: 0
            },
            {
                id: `${id}-header`,
                type: 'headline',
                content: 'SCALE TO\nINFINITUM.',
                x: 0, y: 160, width: 1000, height: 160,
                fontSize: 80, 
                fontWeight: '900',
                textColor: '#ffffff', 
                textAlign: 'center',
                lineHeight: 0.9,
                zIndex: 2,
                animation: {
                    type: 'pop',
                    duration: 1,
                    delay: 0.2
                }
            },
            {
                id: `${id}-divider`,
                type: 'shape',
                content: 'rect',
                x: 450, y: 340, width: 100, height: 4,
                color: '#34d399',
                zIndex: 1
            },
            {
                id: `${id}-sub`,
                type: 'text',
                content: 'JOIN THE EDGE REVOLUTION',
                x: 0, y: 380, width: 1000, height: 30,
                fontSize: 16, 
                fontWeight: '700',
                textColor: '#34d399', 
                textAlign: 'center',
                zIndex: 2
            },
            {
                id: `${id}-link-bg`,
                type: 'shape',
                content: 'rect',
                x: 350, y: 440, width: 300, height: 44,
                color: '#18181b',
                borderRadius: 22,
                strokeWidth: 1,
                strokeColor: '#27272a',
                zIndex: 1
            },
            {
                id: `${id}-link`,
                type: 'text',
                content: 'github.com/hyper-drive/core',
                x: 350, y: 440, width: 300, height: 44,
                fontSize: 14, 
                textColor: '#ffffff', 
                textAlign: 'center',
                verticalAlign: 'center',
                fontFamily: 'monospace',
                zIndex: 2
            }
        ]
    };
};
