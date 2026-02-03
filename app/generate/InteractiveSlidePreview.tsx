'use client';

import React from 'react';
import { Slide, SlideElement } from './types';
import { DraggableElement } from './DraggableElement';
import { resolveElementValues } from './valueKeywords';

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
    const isSelected = (id: string) => selectedElementIds.includes(id) || selectedElementId === id;

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy'; // Changed from 'move' to match source effect
    };

    const handleDropOnCanvas = (e: React.DragEvent) => {
        e.preventDefault();
        let data = e.dataTransfer.getData('application/json');
        if (!data) data = e.dataTransfer.getData('text/plain'); // Fallback
        
        if (!data) return;

        try {
            const parsed = JSON.parse(data);
            const rect = e.currentTarget.getBoundingClientRect();
            
            // Calculate coordinates scaled to 1000px width canvas
            const scale = rect.width / 1000;
            const x = (e.clientX - rect.left) / scale;
            const y = (e.clientY - rect.top) / scale;

            if (parsed.type === 'component') {
                // Adjust for component width/height (approx centering)
                const finalX = x - (parsed.componentType === 'text' ? 200 : 150);
                const finalY = y - (parsed.componentType === 'text' ? 30 : 100);

                if (onAddElement) {
                    onAddElement(slide.id, parsed.componentType, { x: finalX, y: finalY }, parsed.preset);
                }
            } else if (parsed.type === 'asset' && (parsed.assetType === 'image' || parsed.assetType === 'video')) {
                const finalX = x - 150;
                const finalY = y - 100;
                
                if (onAddElement) {
                    onAddElement(slide.id, parsed.assetType, { x: finalX, y: finalY }, undefined, parsed.url);
                }
            }
        } catch (err) {
            console.error("Drop failed:", err);
        }
    };

    const handleDropOnElement = (e: React.DragEvent, elementId: string) => {
        let data = e.dataTransfer.getData('application/json');
        if (!data) data = e.dataTransfer.getData('text/plain');
        
        if (!data) return;

        try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'asset' && (parsed.assetType === 'image' || parsed.assetType === 'video')) {
                // If it's an asset drop on an existing element, we handle it and stop propagation
                e.preventDefault();
                e.stopPropagation();
                onUpdateElement(slide.id, elementId, 0, 0, { content: parsed.url });
            }
            // If it's a 'component' drop, we DON'T preventDefault or stopPropagation
            // so it bubbles up to the canvas handleDropOnCanvas
        } catch (err) {
            console.error("Asset drop failed:", err);
        }
    };

    const handlePointerDownBackground = (e: React.PointerEvent) => {
        onSelectElement(null);
    };

    return (
        <div 
            className="h-full w-full flex items-center justify-center p-12 bg-[#09090b]/95 backdrop-blur-md relative overflow-hidden"
            onPointerDown={handlePointerDownBackground}
        >
            
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-6 left-6 w-16 h-16 border-l-[3px] border-t-[3px] border-zinc-600 rounded-tl-sm opacity-50"></div>
                <div className="absolute top-6 right-6 w-16 h-16 border-r-[3px] border-t-[3px] border-zinc-600 rounded-tr-sm opacity-50"></div>
                <div className="absolute bottom-6 left-6 w-16 h-16 border-l-[3px] border-b-[3px] border-zinc-600 rounded-bl-sm opacity-50"></div>
                <div className="absolute bottom-6 right-6 w-16 h-16 border-r-[3px] border-b-[3px] border-zinc-600 rounded-br-sm opacity-50"></div>

                <div className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center space-x-4">
                    <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded-sm">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                </div>

            </div>

            <div 
                className="relative bg-black shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden cursor-crosshair border-2 border-zinc-800 group"
                onPointerDown={handlePointerDownBackground}
                style={{ 
                    aspectRatio: '16/9', 
                    width: '100%', 
                    maxWidth: '1000px',
                    ...(() => {
                        const bgType = slide.background?.type;
                        const bgValue = slide.background?.value;
                        const isTransparent = !bgValue || bgValue === 'transparent';

                        if (!isTransparent && (bgType === 'color' || bgType === 'gradient')) {
                            return {
                                background: bgValue,
                                backgroundSize: 'cover'
                            };
                        }
                        
                        return {
                            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 1.5px, transparent 1.5px)',
                            backgroundSize: '24px 24px',
                            backgroundColor: '#09090b',
                        };
                    })()
                }}
                onDragOver={handleDragOver}
                onDrop={handleDropOnCanvas}
            >
                {slide.background?.type === 'image' && (
                    <img 
                        src={slide.background.value} 
                        className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none" 
                        alt="bg"
                    />
                )}

                {slide.elements?.map((element) => {
                    const resolvedElement = resolveElementValues(element) as SlideElement;
                    return (
                        <DraggableElement 
                            key={element.id}
                            element={resolvedElement}
                            slideId={slide.id}
                            isSelected={isSelected(element.id)}
                            onUpdate={(sid, eid, x, y, ch) => onUpdateElement(sid, eid, x, y, ch)}
                            onSelect={(id, multi) => onSelectElement(id, multi)}
                            onDrop={handleDropOnElement}
                        />
                    );
                })}

                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity" style={{ 
                    backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                    backgroundSize: '100px 100px'
                }}></div>
            </div>

            <button 
                onClick={onClose}
                className="absolute top-6 right-6 h-10 px-4 bg-zinc-900 border-b-[3px] border-r-[3px] border-black rounded-sm hover:-translate-y-0.5 transition-transform flex items-center space-x-2 z-20 group"
            >
                <span className="text-[10px] font-black uppercase text-zinc-500 group-hover:text-red-400 transition-colors">Exit</span>
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full group-hover:bg-red-500"></div>
            </button>
        </div>
    );
};

export default InteractiveSlidePreview;
