import React from 'react';
import { SlideElement } from '../types';
import { motion } from 'framer-motion';

interface RegistryListProps {
    element: SlideElement;
    scale: number;
}

export const Registry_List: React.FC<RegistryListProps> = ({ element, scale }) => {
    const items = element.content.split('\n');
    return (
        <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: element.opacity ?? 1 }}
            transition={{ duration: element.animation?.duration || 0.5, delay: element.animation?.delay || 0 }}
            style={{
                position: 'absolute',
                left: element.x * scale,
                top: element.y * scale,
                width: element.width ? element.width * scale : undefined,
                color: element.color,
                fontSize: (element.fontSize || 20) * scale,
                fontFamily: element.fontFamily,
                zIndex: element.zIndex,
                transform: `rotate(${element.rotation || 0}deg)`,
                listStyleType: element.listType || 'disc',
                paddingLeft: 20 * scale,
                lineHeight: element.lineHeight || 1.5,
                textAlign: element.textAlign
            }}
        >
            {items.map((item, i) => (
                <li key={i} style={{ marginBottom: (element.listSpacing || 10) * scale, fontWeight: element.fontWeight }}>
                    {item}
                </li>
            ))}
        </motion.ul>
    );
};
