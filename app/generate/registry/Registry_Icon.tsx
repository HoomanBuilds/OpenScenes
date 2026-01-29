import React from 'react';
import { SlideElement } from '../types';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

interface RegistryIconProps {
    element: SlideElement;
    scale: number;
}

export const Registry_Icon: React.FC<RegistryIconProps> = ({ element, scale }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: element.opacity ?? 1, scale: 1 }}
            transition={{ duration: element.animation?.duration || 0.5, delay: element.animation?.delay || 0 }}
            style={{
                position: 'absolute',
                left: element.x * scale,
                top: element.y * scale,
                width: (element.fontSize || 48) * scale,
                height: (element.fontSize || 48) * scale,
                color: element.color,
                zIndex: element.zIndex,
                transform: `rotate(${element.rotation || 0}deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            {(() => {
                const iconName = element.content
                    .split('-')
                    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                    .join('');
                
                const Icon = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
                return <Icon size={(element.fontSize || 48) * scale} color={element.color || 'currentColor'} strokeWidth={2} />;
            })()}
        </motion.div>
    );
};
