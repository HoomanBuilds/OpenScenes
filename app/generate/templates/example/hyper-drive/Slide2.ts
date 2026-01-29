import { Slide } from '../../../types';

export const HyperDrive_Slide2 = (id: string): Slide => {
    return {
        id,
        type: 'HyperDrive Features',
        props: {},
        duration: 200,
        background: {
            type: 'color',
            value: '#09090b'
        },
        elements: [
            {
                id: `${id}-sidebar`,
                type: 'shape',
                content: 'rect',
                x: 0, y: 0, width: 300, height: 562.5,
                color: '#18181b',
                zIndex: 1
            },
            {
                id: `${id}-sidebar-accent`,
                type: 'shape',
                content: 'rect',
                x: 298, y: 0, width: 2, height: 562.5,
                color: '#6366f1',
                opacity: 0.3,
                zIndex: 2
            },
            {
                id: `${id}-header`,
                type: 'headline',
                content: 'CORE\nFEATURES',
                x: 40, y: 60, width: 220, height: 100,
                fontSize: 40, 
                fontWeight: '900',
                textColor: '#ffffff', 
                textAlign: 'left',
                lineHeight: 0.9,
                zIndex: 3
            },
            {
                id: `${id}-line`,
                type: 'shape',
                content: 'rect',
                x: 40, y: 180, width: 40, height: 4,
                color: '#6366f1',
                zIndex: 3
            },
            {
                id: `${id}-list`,
                type: 'text',
                textFormat: 'markdown',
                content: '### Performance\n- **0ms Cold Starts** via V8 snapshots\n- **SQL-compatible** KV performance\n\n### Reliability\n- **Global replication** in 24 regions\n- **Automatic failover** protocols\n\n### Intelligence\n- **AI-native Vector Search**\n- **Edge caching** optimizations',
                x: 360, y: 80, width: 580, height: 400,
                fontSize: 22, 
                fontWeight: '400',
                textColor: '#d1d5db', 
                textAlign: 'left',
                verticalAlign: 'top',
                fontFamily: 'Inter',
                zIndex: 2,
                animation: {
                    type: 'slide',
                    duration: 0.8,
                    delay: 0.5,
                    direction: 'right'
                }
            },
            {
                id: `${id}-glow`,
                type: 'shape',
                content: 'circle',
                x: 850, y: 400, width: 300, height: 300,
                color: '#6366f1',
                opacity: 0.05,
                borderRadius: 50,
                zIndex: 0
            }
        ]
    };
};
