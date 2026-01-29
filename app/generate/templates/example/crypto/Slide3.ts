import { Slide } from '../../../types';

export const Slide3 = (id: string): Slide => {
    return {
        id,
        type: 'Key Benefits',
        props: {},
        duration: 120, // 4 seconds
        background: { 
            type: 'gradient', 
            value: 'linear-gradient(to right, #09090b, #18181b)' 
        },
        elements: [
            {
                id: `${id}-title`,
                type: 'headline',
                content: 'Why Blockchain?',
                x: 80, y: 80, width: 600,
                color: '#ffffff', fontSize: 56, fontWeight: 'black',
                opacity: 1, zIndex: 10,
                animation: { type: 'slide', direction: 'down', duration: 0.8, delay: 0 }
            },
            {
                id: `${id}-list`,
                type: 'list',
                content: 'Decentralization of Power\nImmutable Ledger Technology\nPermissionless Global Access\nProgrammable Smart Contracts',
                x: 80, y: 200, width: 800,
                color: '#ffffff', fontSize: 32, fontWeight: 'medium',
                listSpacing: 30, listType: 'disc',
                opacity: 1, zIndex: 10,
                animation: { type: 'fade', duration: 1, delay: 0.5 }
            },
            {
                id: `${id}-callout`,
                type: 'shape',
                content: '',
                x: 80, y: 480, width: 840, height: 100,
                color: '#f59e0b', borderRadius: 12,
                opacity: 0.1, zIndex: 1,
                animation: { type: 'scale', duration: 1, delay: 1 }
            },
            {
                id: `${id}-callout-text`,
                type: 'text',
                content: 'Join the revolution of digital ownership and open finance.',
                x: 120, y: 515, width: 800,
                color: '#f59e0b', fontSize: 24, fontWeight: 'bold',
                textAlign: 'center',
                opacity: 1, zIndex: 10,
                animation: { type: 'fade', duration: 1, delay: 1.2 }
            }
        ]
    };
};
