import React from 'react';
import { SlideElement } from '../types';
import { motion } from 'framer-motion';

interface RegistryImageProps {
    element: SlideElement;
    scale: number;
}

export const Registry_Image: React.FC<RegistryImageProps> = ({ element, scale }) => {
    return (
        <motion.img
            src={(element.content && (element.content.startsWith('http') || element.content.startsWith('blob:'))) ? element.content : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'}
            alt="slide-asset"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: element.opacity ?? 1, scale: 1 }}
            transition={{ duration: element.animation?.duration || 0.5, delay: element.animation?.delay || 0 }}
            style={{
                position: 'absolute',
                left: element.x * scale,
                top: element.y * scale,
                width: element.width ? element.width * scale : undefined,
                height: element.height ? element.height * scale : undefined,
                borderRadius: (element.borderRadius || 0) * scale,
                zIndex: element.zIndex,
                transform: `rotate(${element.rotation || 0}deg)`,
                objectFit: element.objectFit || 'cover'
            }}
        />
    );
};
