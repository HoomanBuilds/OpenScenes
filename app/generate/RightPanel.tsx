'use client';

import React from 'react';
import { GenerationStatus, Slide, ViewMode, SlideElement } from './types';
import SlideSequence from './SlideSequence';
import InteractiveSlidePreview from './InteractiveSlidePreview';
import { motion } from 'framer-motion';

interface RightPanelProps {
    slides: Slide[];
    selectedSlideId: string | null;
    selectedElementId: string | null;
    selectedElementIds: string[];
    generationStatus: GenerationStatus;
    viewMode: ViewMode;
    onReorder: (newSlides: Slide[]) => void;
    onSelect: (id: string) => void;
    onSelectElement: (id: string | null, multi?: boolean) => void;
    onAdd: () => void;
    onCloseFocus: () => void;
    onUpdateElement: (slideId: string, elementId: string, newX: number, newY: number, changes?: Partial<SlideElement>) => void;
    onDurationChange: (slideId: string, delta: number) => void;
    onUpdateSlide: (slideId: string, changes: Partial<Slide>) => void;
    onAddElement: (slideId: string, type: SlideElement['type'], position: { x: number, y: number }) => void;
    refreshKey: number;
    log?: string;
}

const RightPanel: React.FC<RightPanelProps> = ({
    slides,
    selectedSlideId,
    selectedElementId,
    selectedElementIds,
    generationStatus,
    viewMode,
    onReorder,
    onSelect,
    onSelectElement,
    onAdd,
    onCloseFocus,
    onUpdateElement,
    onDurationChange,
    onUpdateSlide,
    onAddElement,
    refreshKey,
    log = ''
}) => {
    const selectedSlide = slides.find(s => s.id === selectedSlideId);

    return (
        <div className="flex-1 bg-zinc-950 relative overflow-hidden flex flex-col h-full">
            {/* Background Aesthetics */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-zinc-950 to-zinc-950 pointer-events-none" />
            
            {/* Top Bar Status */}
            <div className="h-16 border-b border-zinc-800/50 flex items-center justify-end px-6 space-x-6 z-10 bg-zinc-950/50 backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                     <span className={`w-2 h-2 rounded-full ${generationStatus === 'generating' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                     <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                        {generationStatus === 'generating' ? 'Generating Video' : 'Ready'}
                     </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden relative z-0 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                
                {viewMode === 'sequence' && (
                        <SlideSequence 
                        slides={slides}
                        onReorder={onReorder}
                        onSelect={onSelect}
                        selectedSlideId={selectedSlideId}
                        onAdd={onAdd}
                        onDurationChange={onDurationChange}
                        onUpdateSlide={onUpdateSlide}
                        generationLog={log}
                    />
                )}

                {viewMode === 'focus' && selectedSlide && (
                    <InteractiveSlidePreview 
                        key={refreshKey} // Forces remount on refresh
                        slide={selectedSlide}
                        onClose={onCloseFocus}
                        onUpdateElement={onUpdateElement}
                        onSelectElement={onSelectElement}
                        selectedElementId={selectedElementId}
                        selectedElementIds={selectedElementIds}
                        onAddElement={onAddElement}
                    />
                )}
            </div>
        </div>
    );
};

export default RightPanel;
