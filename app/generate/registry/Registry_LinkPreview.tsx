import React from 'react';
import { SlideElement } from '../types';
import { motion } from 'framer-motion';

interface RegistryLinkPreviewProps {
    element: SlideElement;
    scale: number;
}

export const Registry_LinkPreview: React.FC<RegistryLinkPreviewProps> = ({ element, scale }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: element.opacity ?? 1, y: 0 }}
            transition={{ duration: element.animation?.duration || 0.5, delay: element.animation?.delay || 0 }}
            style={{
                position: 'absolute',
                left: element.x * scale,
                top: element.y * scale,
                width: element.width ? element.width * scale : 300 * scale,
                height: element.height ? element.height * scale : 100 * scale,
                zIndex: element.zIndex,
                transform: `rotate(${element.rotation || 0}deg)`,
                overflow: 'hidden',
                borderRadius: (element.borderRadius || 12) * scale,
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
             <div style={{ flex: 1, padding: 12 * scale }}>
                 <p style={{ fontSize: 12 * scale, color: '#aaa' }}>Link Preview</p>
                 <p style={{ fontSize: 14 * scale, color: '#fff', fontWeight: 500, marginTop: 4 * scale }}>{element.content}</p>
             </div>
             <div style={{ height: 4 * scale, backgroundColor: element.color || '#3b82f6' }} />
        </motion.div>
    );
};
