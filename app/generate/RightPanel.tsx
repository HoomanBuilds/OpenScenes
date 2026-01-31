'use client';

import React from 'react';
import { GenerationStatus, Slide, ViewMode, SlideElement } from './types';
import SlideSequence from './SlideSequence';
import InteractiveSlidePreview from './InteractiveSlidePreview';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

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
    onPreview?: () => void;
    refreshKey: number;
    log?: string;
    renderStatus: 'idle' | 'rendering' | 'done';
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
    onPreview,
    refreshKey,
    log = '',
    renderStatus
}) => {
    const selectedSlide = slides.find(s => s.id === selectedSlideId);

    return (
        <div className="flex-1 bg-zinc-950 relative overflow-hidden flex flex-col h-full">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-zinc-950 to-zinc-950 pointer-events-none" />
            
            <div className="h-16 border-b-2 border-black flex items-center justify-end px-6 space-x-4 z-10 bg-[#09090b]">
                {slides.length > 0 && onPreview && (
                    <button
                        onClick={onPreview}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border-2 border-zinc-800 hover:border-purple-500/50 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all group"
                        style={{
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            borderLeft: '1px solid rgba(255,255,255,0.05)',
                        }}
                    >
                        <Play size={14} fill="currentColor" className="text-purple-500 group-hover:text-purple-400" />
                        Preview
                    </button>
                )}
                {slides.length > 0 && renderStatus === 'done' && (
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border-2 border-zinc-800 hover:border-green-500/50 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all group"
                        style={{
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            borderLeft: '1px solid rgba(255,255,255,0.05)',
                        }}
                    >
                        <svg className="w-3.5 h-3.5 text-green-500 group-hover:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                    </button>
                )}
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
