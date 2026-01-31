'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { SlideElement } from './types';
import { getAnimationVariants } from './InteractiveSlidePreview_Utils';
import { ElementRenderer } from './InteractiveSlidePreview_Renderer';
import { ResizeHandles } from './InteractiveSlidePreview_ResizeHandles';

interface DraggableElementProps {
    element: SlideElement;
    slideId: string;
    isSelected: boolean;
    onUpdate: (slideId: string, elementId: string, x: number, y: number, changes?: Partial<SlideElement>) => void;
    onSelect: (id: string, multi: boolean) => void;
    onDrop?: (e: React.DragEvent, id: string) => void;
    scale?: number;
}

export const DraggableElement: React.FC<DraggableElementProps> = ({ 
    element, slideId, isSelected, onUpdate, onSelect, onDrop, scale = 1 
}) => {
    const [isResizing, setIsResizing] = useState(false);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const width = useMotionValue(element.width || 400);
    const height = useMotionValue(element.height || 300);
    const fontSize = useMotionValue(element.fontSize || 24);

    useEffect(() => {
        // Reset motion values when element props change
        x.set(0);
        y.set(0);
        width.set(element.width || 400);
        height.set(element.height || 300);
        fontSize.set(element.fontSize || 24);
    }, [element.x, element.y, element.width, element.height, element.fontSize]);

    const handleResizeStart = () => {
        setIsResizing(true);
    };

    const handleResize = (dx: number, dy: number, type: 'tl' | 'tr' | 'bl' | 'br') => {
        let newX = 0;
        let newY = 0;
        const originalW = element.width || 400;
        const originalH = element.height || 300;
        let newW = originalW;
        let newH = originalH;

        if (type.includes('l')) {
            // Left edge: shrink/expand from left
            newW = Math.max(20, originalW - dx / scale);
            // Offset = how much the width actually changed (keeps right edge fixed)
            newX = originalW - newW;
        } else {
            // Right edge: shrink/expand from right  
            newW = Math.max(20, originalW + dx / scale);
        }

        if (type.includes('t')) {
            // Top edge: shrink/expand from top
            newH = Math.max(20, originalH - dy / scale);
            // Offset = how much the height actually changed (keeps bottom edge fixed)
            newY = originalH - newH;
        } else {
            // Bottom edge: shrink/expand from bottom
            newH = Math.max(20, originalH + dy / scale);
        }

        width.set(newW);
        height.set(newH);
        x.set(newX);
        y.set(newY);

        // Keep existing shape scaling logic
        if (element.type === 'shape') {
            fontSize.set(Math.max(12, Math.round(newH * 0.3)));
        }
    };

    const handleResizeEnd = () => {
        setIsResizing(false);
        onUpdate(slideId, element.id, element.x + x.get(), element.y + y.get(), {
            width: width.get(),
            height: height.get(),
            fontSize: fontSize.get()
        });
        x.set(0); y.set(0);
    };

    const commonProps = {
        style: { 
            left: element.x, 
            top: element.y,
            x, y,
            width: width,
            height: height,
            zIndex: element.zIndex,
            rotate: element.rotation,
            position: 'absolute' as const,
            color: element.textColor || element.color || 'inherit',
            fontSize: fontSize,
            fontWeight: element.fontWeight || 'normal',
            fontFamily: (element.fontFamily && element.fontFamily !== 'Inter') ? `${element.fontFamily}, sans-serif` : 'Inter, sans-serif',
            lineHeight: (element.type === 'headline' || element.type === 'subheadline' || element.type === 'text') ? 1 : (element.lineHeight || 1.5),
            textAlign: element.textAlign || 'left',
            backgroundColor: element.type === 'shape' ? (element.color || '#3b82f6') : undefined,
            borderRadius: (element.type === 'shape' || element.type === 'video' || element.type === 'image') ? `${element.borderRadius || 0}px` : undefined,
            borderWidth: (element.type === 'shape' || element.type === 'image' || element.type === 'video') ? (element.strokeWidth || 0) : undefined,
            borderColor: (element.type === 'shape' || element.type === 'image' || element.type === 'video') ? (element.strokeColor || 'transparent') : undefined,
            borderStyle: (element.strokeWidth && element.strokeWidth > 0) ? 'solid' : 'none',
        },
        initial: "initial",
        animate: "animate",
        variants: getAnimationVariants(element.animation, element.opacity ?? 1),
        // Disable drag while resizing
        drag: !isResizing,
        dragMomentum: false,
        onDragEnd: () => {
            if (!isResizing) {
                onUpdate(slideId, element.id, element.x + x.get() / scale, element.y + y.get() / scale);
                x.set(0); y.set(0);
            }
        },
        onPointerDown: (e: React.PointerEvent) => {
            if (e.button !== 0) return; // Only left click
            e.stopPropagation(); // Prevent canvas click from deselecting
        },
        onTap: (e: any) => {
            onSelect(element.id, e.shiftKey);
        },
        onDragOver: (e: React.DragEvent) => {
            if (element.type === 'image' || element.type === 'video') { 
                e.preventDefault(); 
                e.stopPropagation(); 
            }
        },
        onDrop: (e: React.DragEvent) => onDrop && onDrop(e, element.id),
        className: `cursor-grab active:cursor-grabbing group absolute ${isSelected ? 'ring-2 ring-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'hover:ring-1 hover:ring-white/30'}`,
    };

    return (
        <motion.div {...commonProps} data-element-id={element.id}>
            <div className={`
                relative w-full h-full flex flex-col
                ${isSelected ? 'ring-2 ring-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'hover:ring-1 hover:ring-white/30'}
                ${element.type === 'chart' ? `rounded-xl p-4 border border-zinc-800 backdrop-blur-sm ${element.chartProps?.transparent ? 'bg-transparent border-transparent shadow-none' : 'bg-zinc-900/80'}` : ''}
                ${element.type === 'shape' ? 'shadow-lg' : ''} 
            `}
            style={{
                width: '100%', 
                height: '100%',
                borderRadius: (element.type === 'image' || element.type === 'video') ? (element.borderRadius ? `${element.borderRadius}px` : '12px') : undefined,
                overflow: (element.type === 'image' || element.type === 'video') ? 'hidden' : 'visible',
                alignItems: element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start',
                justifyContent: element.verticalAlign === 'center' ? 'center' : element.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start',
            }}
            >
                <ElementRenderer element={element} fontSizeValue={fontSize} />
            </div>

            <ResizeHandles 
                isSelected={isSelected} 
                onResizeStart={handleResizeStart}
                onResize={handleResize} 
                onResizeEnd={handleResizeEnd} 
            />
        </motion.div>
    );
};
