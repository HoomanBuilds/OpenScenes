'use client';

import React from 'react';
import { motion, MotionValue } from 'framer-motion';

interface ResizeHandlesProps {
    isSelected: boolean;
    onResizeStart?: () => void;
    onResize: (dx: number, dy: number, type: 'tl' | 'tr' | 'bl' | 'br') => void;
    onResizeEnd: () => void;
}

export const ResizeHandles: React.FC<ResizeHandlesProps> = ({ isSelected, onResizeStart, onResize, onResizeEnd }) => {
    if (!isSelected) return null;

    const handles = [
        { pos: '-top-1.5 -left-1.5', cursor: 'nwse-resize', type: 'tl' as const },
        { pos: '-top-1.5 -right-1.5', cursor: 'nesw-resize', type: 'tr' as const },
        { pos: '-bottom-1.5 -left-1.5', cursor: 'nesw-resize', type: 'bl' as const },
        { pos: '-bottom-1.5 -right-1.5', cursor: 'nwse-resize', type: 'br' as const },
    ];

    const handlePointerDown = (e: React.PointerEvent, type: 'tl' | 'tr' | 'bl' | 'br') => {
        e.preventDefault();
        e.stopPropagation();
        
        // Notify parent that resize is starting (to disable drag)
        onResizeStart?.();

        const startX = e.clientX;
        const startY = e.clientY;

        const handlePointerMove = (moveEvent: PointerEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;
            onResize(dx, dy, type);
        };

        const handlePointerUp = () => {
            onResizeEnd();
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
    };

    return (
        <>
            {handles.map((h) => (
                <motion.div
                    key={h.type}
                    className={`absolute ${h.pos} w-3 h-3 bg-white border-2 border-purple-600 rounded-full shadow-lg pointer-events-auto z-[100]`}
                    style={{ cursor: h.cursor }}
                    onPointerDown={(e) => handlePointerDown(e, h.type)}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.9 }}
                />
            ))}
        </>
    );
};
