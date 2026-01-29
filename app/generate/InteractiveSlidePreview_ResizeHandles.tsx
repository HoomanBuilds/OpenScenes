'use client';

import React from 'react';
import { motion, MotionValue } from 'framer-motion';

interface ResizeHandlesProps {
    isSelected: boolean;
    onResize: (dx: number, dy: number, type: 'tl' | 'tr' | 'bl' | 'br') => void;
    onResizeEnd: () => void;
}

export const ResizeHandles: React.FC<ResizeHandlesProps> = ({ isSelected, onResize, onResizeEnd }) => {
    if (!isSelected) return null;

    const handles = [
        { pos: '-top-1.5 -left-1.5', cursor: 'nwse-resize', type: 'tl' as const },
        { pos: '-top-1.5 -right-1.5', cursor: 'nesw-resize', type: 'tr' as const },
        { pos: '-bottom-1.5 -left-1.5', cursor: 'nesw-resize', type: 'bl' as const },
        { pos: '-bottom-1.5 -right-1.5', cursor: 'nwse-resize', type: 'br' as const },
    ];

    return (
        <>
            {handles.map((h) => (
                <motion.div
                    key={h.type}
                    className={`absolute ${h.pos} w-3 h-3 bg-white border-2 border-purple-600 rounded-full shadow-lg pointer-events-auto z-[100]`}
                    style={{ cursor: h.cursor }}
                    drag
                    dragMomentum={false}
                    dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onDrag={(e, info) => onResize(info.offset.x, info.offset.y, h.type)}
                    onDragEnd={onResizeEnd}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.9 }}
                />
            ))}
        </>
    );
};
