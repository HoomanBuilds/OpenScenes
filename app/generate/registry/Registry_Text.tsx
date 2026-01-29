import React from 'react';
import { SlideElement } from '../types';
import { motion } from 'framer-motion';

interface RegistryTextProps {
    element: SlideElement;
    scale: number;
}

export const Registry_Text: React.FC<RegistryTextProps> = ({ element, scale }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: element.opacity ?? 1, y: 0 }}
            transition={{ duration: element.animation?.duration || 0.5, delay: element.animation?.delay || 0 }}
            style={{
                position: 'absolute',
                left: element.x * scale,
                top: element.y * scale,
                width: element.width ? element.width * scale : undefined,
                height: element.height ? element.height * scale : undefined,
                color: element.color,
                fontSize: (element.fontSize || 24) * scale,
                fontWeight: element.fontWeight,
                textAlign: element.textAlign as any,
                fontFamily: element.fontFamily,
                zIndex: element.zIndex,
                transform: `rotate(${element.rotation || 0}deg)`,
                whiteSpace: 'pre-wrap'
            }}
        >
            {element.content}
        </motion.div>
    );
};
