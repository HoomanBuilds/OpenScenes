import { Slide, SlideElement } from '../types';

export const Template_TitleCard = (id: string, prompt: string): Slide => {
    return {
        id,
        type: 'Title Card',
        props: {},
        duration: 120, // 4 seconds at 30fps
        background: { type: 'gradient', value: 'linear-gradient(to bottom right, #4f46e5, #9333ea)' },
        elements: [
            { 
                id: `${id}-el-1`, 
                type: 'headline', 
                content: prompt ? `Result: ${prompt}` : 'Market Trends 2026', 
                x: 100, y: 100, width: 600, height: 100,
                color: '#ffffff', fontSize: 64, fontWeight: 'bold', textAlign: 'left',
                opacity: 1, rotation: 0, zIndex: 10,
                animation: { type: 'slide', direction: 'up', duration: 1, delay: 0.2 }
            },
            { 
                id: `${id}-el-2`, 
                type: 'subheadline', 
                content: 'AI-Generated Insight', 
                x: 100, y: 250, width: 500, height: 80,
                color: '#e4e4e7', fontSize: 32, fontWeight: 'normal', textAlign: 'left',
                opacity: 0.9, rotation: 0, zIndex: 5,
                animation: { type: 'fade', duration: 1.5, delay: 0.5 }
            }
        ]
    };
};
