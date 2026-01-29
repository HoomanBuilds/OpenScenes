import { Slide } from '../../../types';

export const HyperDrive_Slide4 = (id: string): Slide => {
    return {
        id,
        type: 'HyperDrive Comparison',
        props: {},
        duration: 150,
        background: {
            type: 'color',
            value: '#09090b'
        },
        elements: [
            {
                id: `${id}-header`,
                type: 'headline',
                content: 'ELIMINATING THE CLOUD TAX',
                x: 0, y: 50, width: 1000, height: 50,
                fontSize: 32, 
                fontWeight: '900',
                textColor: '#ffffff', 
                textAlign: 'center',
                zIndex: 2
            },
            {
                id: `${id}-vs`,
                type: 'text',
                content: 'VS',
                x: 480, y: 300, width: 40, height: 40,
                fontSize: 16,
                fontWeight: '900',
                textColor: '#6b7280',
                textAlign: 'center',
                zIndex: 3
            },
            {
                id: `${id}-box-legacy`,
                type: 'shape',
                content: 'rect',
                x: 100, y: 150, width: 360, height: 320,
                color: '#18181b', 
                borderRadius: 24,
                strokeWidth: 1,
                strokeColor: '#ef4444',
                opacity: 0.5,
                zIndex: 1
            },
            {
                id: `${id}-box-hyper`,
                type: 'shape',
                content: 'rect',
                x: 540, y: 150, width: 360, height: 320,
                color: '#064e3b', 
                borderRadius: 24,
                strokeWidth: 2,
                strokeColor: '#34d399',
                zIndex: 1
            },
            {
                id: `${id}-legacy-label`,
                type: 'text',
                content: 'LEGACY INFRA',
                x: 100, y: 180, width: 360, height: 30,
                fontSize: 14,
                fontWeight: '700',
                textColor: '#ef4444',
                textAlign: 'center',
                zIndex: 2
            },
            {
                id: `${id}-hyper-label`,
                type: 'text',
                content: 'HYPER-DRIVE',
                x: 540, y: 180, width: 360, height: 30,
                fontSize: 14,
                fontWeight: '700',
                textColor: '#34d399',
                textAlign: 'center',
                zIndex: 2
            },
            {
                id: `${id}-legacy-list`,
                type: 'text',
                textFormat: 'markdown',
                content: '- Expensive Idle Time\n- Significant Cold Starts\n- Fixed Monthly Billing\n- Complex Configuration',
                x: 130, y: 230, width: 300, height: 200,
                fontSize: 18, 
                textColor: '#9ca3af', 
                textAlign: 'left',
                zIndex: 2
            },
            {
                id: `${id}-hyper-list`,
                type: 'text',
                textFormat: 'markdown',
                content: '- **0% Idle Overhead**\n- **Instant Edge Start**\n- **Pure Consumption**\n- **Zero-Config Setup**',
                x: 570, y: 230, width: 300, height: 200,
                fontSize: 18, 
                textColor: '#ecfdf5', 
                textAlign: 'left',
                zIndex: 2
            }
        ]
    };
};
