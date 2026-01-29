import React from 'react';
import { SlideElement } from '../types';
import { motion } from 'framer-motion';

interface RegistryShapeProps {
    element: SlideElement;
    scale: number;
}

export const Registry_Shape: React.FC<RegistryShapeProps> = ({ element, scale }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: element.opacity ?? 1 }}
            transition={{ duration: element.animation?.duration || 0.5, delay: element.animation?.delay || 0 }}
            style={{
                position: 'absolute',
                left: element.x * scale,
                top: element.y * scale,
                width: element.width ? element.width * scale : 100 * scale,
                height: element.height ? element.height * scale : 100 * scale,
                backgroundColor: element.color,
                borderRadius: (element.borderRadius || 0) * scale,
                borderWidth: (element.strokeWidth || 0) * scale,
                borderColor: element.strokeColor || 'transparent',
                borderStyle: element.strokeWidth && element.strokeWidth > 0 ? 'solid' : 'none',
                zIndex: element.zIndex,
                transform: `rotate(${element.rotation || 0}deg)`,
            }}
        />
    );
};
