import { Variants } from 'framer-motion';
import { SlideElement } from './types';

export const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F'];

export const getAnimationVariants = (anim: SlideElement['animation'], targetOpacity: number = 1): Variants => {
    if (!anim || anim.type === 'none') {
        return {
            initial: { opacity: targetOpacity },
            animate: { opacity: targetOpacity }
        };
    }

    const duration = anim.duration || 1;
    const delay = anim.delay || 0;

    const transition = { duration, delay, ease: "easeOut" as const };

    switch (anim.type) {
        case 'fade':
            return {
                initial: { opacity: 0 },
                animate: { opacity: targetOpacity, transition },
            };
        case 'scale':
            return {
                initial: { opacity: 0, scale: 0.5 },
                animate: { opacity: targetOpacity, scale: 1, transition },
            };
        case 'pop':
            return {
                initial: { opacity: 0, scale: 0.8, y: 20 },
                animate: { opacity: targetOpacity, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20, delay } },
            };
        case 'slide':
            const dist = 50;
            const initial = 
                anim.direction === 'left' ? { x: dist } :
                anim.direction === 'right' ? { x: -dist } :
                anim.direction === 'down' ? { y: -dist } :
                { y: dist };
            return {
                initial: { opacity: 0, ...initial },
                animate: { opacity: targetOpacity, x: 0, y: 0, transition },
            };
        default:
            return {
                initial: { opacity: targetOpacity },
                animate: { opacity: targetOpacity }
            };
    }
};
