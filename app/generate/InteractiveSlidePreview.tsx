'use client';

import React from 'react';
import { Slide, SlideElement } from './types';
import { DraggableElement } from './DraggableElement';

interface InteractiveSlidePreviewProps {
    slide: Slide;
    onClose: () => void;
    onUpdateElement: (slideId: string, elementId: string, newX: number, newY: number, changes?: Partial<SlideElement>) => void;
    onSelectElement: (elementId: string | null, multi?: boolean) => void;
    selectedElementIds?: string[];
    selectedElementId?: string | null;
    onAddElement?: (slideId: string, type: SlideElement['type'], position: { x: number, y: number }, preset?: string, content?: string) => void;
}

const InteractiveSlidePreview: React.FC<InteractiveSlidePreviewProps> = ({ 
    slide, 
    onClose,
    onUpdateElement,
    onSelectElement,
    selectedElementIds = [],
    selectedElementId, 
    onAddElement
}) => {
    // Selection helpers
    const isSelected = (id: string) => selectedElementIds.includes(id) || selectedElementId === id;

    // --- Drop Handlers ---
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDropOnCanvas = (e: React.DragEvent) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;

        try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'component') {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left - 200; // Center offset roughly
                const y = e.clientY - rect.top - 30;
                
                if (onAddElement) {
                    onAddElement(slide.id, parsed.componentType, { x, y }, parsed.preset);
                }
            } else if (parsed.type === 'asset' && (parsed.assetType === 'image' || parsed.assetType === 'video')) {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left - 150; // Offset for asset
                const y = e.clientY - rect.top - 100;
                
                if (onAddElement) {
                    onAddElement(slide.id, parsed.assetType, { x, y }, undefined, parsed.url);
                }
            }
        } catch (err) {
            console.error("Drop failed:", err);
        }
    };

    const handleDropOnElement = (e: React.DragEvent, elementId: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;

        try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'asset' && (parsed.assetType === 'image' || parsed.assetType === 'video')) {
                onUpdateElement(slide.id, elementId, 0, 0, { content: parsed.url });
            }
        } catch (err) {
            console.error("Asset drop failed:", err);
        }
    };

    const handlePointerDownBackground = (e: React.PointerEvent) => {
        // Deselect only if clicking the actual background of the canvas
        // or the outer padding area.
        if (e.target === e.currentTarget) {
            onSelectElement(null);
        }
    };

    return (
        <div className="h-full w-full flex items-center justify-center p-8 bg-zinc-950/80 backdrop-blur-sm">
            
            {/* Aspect Ratio Container (16:9) */}
            <div 
                className="relative bg-black shadow-2xl overflow-hidden cursor-crosshair border border-zinc-800"
                onPointerDown={handlePointerDownBackground}
                style={{ 
                    aspectRatio: '16/9', 
                    width: '100%', 
                    maxWidth: '1000px',
                    background: slide.background?.type === 'color' ? slide.background.value : 
                               slide.background?.type === 'gradient' ? slide.background.value : 'black'
                }}
                onDragOver={handleDragOver}
                onDrop={handleDropOnCanvas}
            >
                {/* Background Image if exists */}
                {slide.background?.type === 'image' && (
                    <img 
                        src={slide.background.value} 
                        className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none" 
                        alt="bg"
                    />
                )}

                {/* Elements */}
                {slide.elements?.map((element) => (
                    <DraggableElement 
                        key={element.id}
                        element={element}
                        slideId={slide.id}
                        isSelected={isSelected(element.id)}
                        onUpdate={(sid, eid, x, y, ch) => onUpdateElement(sid, eid, x, y, ch)}
                        onSelect={(id, multi) => onSelectElement(id, multi)}
                        onDrop={handleDropOnElement}
                    />
                ))}
            </div>

            {/* Back Button Overlay */}
            <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-zinc-900 border border-zinc-800 rounded-full hover:bg-zinc-800 transition-colors shadow-lg group"
            >
                <svg className="w-5 h-5 text-zinc-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export default InteractiveSlidePreview;
