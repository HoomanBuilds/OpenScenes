import { Slide, SlideElement } from '../types';

export const Template_ImageRight = (id: string, prompt?: string): Slide => {
    return {
        id,
        type: 'Image Right',
        props: {},
        duration: 90, // 3 seconds at 30fps
        background: { type: 'color', value: '#09090b' },
        elements: [
            { 
                id: `${id}-el-1`, 
                type: 'headline', 
                content: 'Visual Impact', 
                x: 50, y: 200, width: 500, 
                color: '#ffffff', fontSize: 56, fontWeight: 'bold',
                opacity: 1, rotation: -5, zIndex: 10,
                animation: { type: 'pop', duration: 0.5, delay: 0.2 }
            },
            { 
                id: `${id}-el-2`, 
                type: 'image', 
                content: 'hero-shot.jpg', 
                x: 600, y: 100, width: 400, height: 300,
                opacity: 1, rotation: 5, zIndex: 1,
                animation: { type: 'fade', duration: 2, delay: 0 }
            }
        ]
    };
};
