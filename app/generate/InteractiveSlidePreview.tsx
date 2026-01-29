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
        <div className="h-full w-full flex items-center justify-center p-12 bg-[#09090b]/95 backdrop-blur-md relative overflow-hidden">
            
            {/* --- MONITOR OVERLAY UI --- */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Corner Brackets */}
                <div className="absolute top-6 left-6 w-16 h-16 border-l-[3px] border-t-[3px] border-zinc-600 rounded-tl-sm opacity-50"></div>
                <div className="absolute top-6 right-6 w-16 h-16 border-r-[3px] border-t-[3px] border-zinc-600 rounded-tr-sm opacity-50"></div>
                <div className="absolute bottom-6 left-6 w-16 h-16 border-l-[3px] border-b-[3px] border-zinc-600 rounded-bl-sm opacity-50"></div>
                <div className="absolute bottom-6 right-6 w-16 h-16 border-r-[3px] border-b-[3px] border-zinc-600 rounded-br-sm opacity-50"></div>

                {/* Status Marks */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center space-x-4">
                    <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded-sm">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-[9px] font-mono font-bold text-zinc-400 tracking-widest">LIVE EDITOR</span>
                    </div>
                </div>

                <div className="absolute top-8 left-8 font-mono text-[9px] text-zinc-600 tracking-[0.2em] opacity-80">
                    CAM-204 [HQ]
                </div>

                <div className="absolute bottom-8 right-8 font-mono text-[9px] text-zinc-600 tracking-[0.2em] opacity-80">
                    ISO 800 | 24FPS
                </div>
            </div>

            {/* Aspect Ratio Container (16:9) */}
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

                        // Case 1: Active Color/Gradient (Not Transparent)
                        if (!isTransparent && (bgType === 'color' || bgType === 'gradient')) {
                            return {
                                background: bgValue,
                                backgroundSize: 'cover'
                            };
                        }
                        
                        // Case 2: Fallback Dotted Grid (Transparent or Undefined)
                        return {
                            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 1.5px, transparent 1.5px)',
                            backgroundSize: '24px 24px',
                            backgroundColor: '#09090b', // explicit base color for the grid to sit on
                        };
                    })()
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

                {/* Grid Overlay on Hover (Subtle) */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity" style={{ 
                    backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                    backgroundSize: '100px 100px'
                }}></div>
            </div>

            {/* Back Button Overlay */}
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
