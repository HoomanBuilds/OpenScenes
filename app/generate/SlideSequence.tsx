'use client';

import React from 'react';
import { Slide, SlideElement } from './types';
import { motion, Reorder } from 'framer-motion';

interface SlideSequenceProps {
    slides: Slide[];
    selectedSlideId: string | null;
    onReorder: (newSlides: Slide[]) => void;
    onSelect: (id: string) => void;
    onAdd: () => void;
    onDurationChange: (slideId: string, delta: number) => void;
    onUpdateSlide: (id: string, changes: Partial<Slide>) => void;
    generationLog?: string;
}

import SlidePreview from './SlidePreview';

const SlideSequence: React.FC<SlideSequenceProps> = ({ 
    slides, 
    onReorder, 
    onSelect, 
    selectedSlideId,
    onAdd,
    onDurationChange,
    onUpdateSlide,
    generationLog
}) => {
    return (
        <div className="p-8 pb-32 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                     <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">Sequence</h2>
                     <p className="text-sm text-zinc-500 mt-1">Drag to reorder • Adjust duration</p>
                </div>
                <button 
                    onClick={onAdd}
                    className="flex items-center space-x-2 px-4 py-2 bg-zinc-900 border border-zinc-700 hover:border-purple-500/50 hover:bg-zinc-800 rounded-lg transition-all group"
                >
                    <span className="bg-purple-500/20 text-purple-400 p-1 rounded group-hover:bg-purple-500 group-hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                    </span>
                    <span className="text-sm font-medium text-zinc-300">Add Slide</span>
                </button>
            </div>

            <div className="relative">
                {/* Vertical Timeline Track */}
                <div className="absolute left-8 top-10 bottom-20 w-px border-l border-dashed border-zinc-800 pointer-events-none" />

                <Reorder.Group axis="y" values={slides} onReorder={onReorder} className="space-y-4">
                    {slides.map((slide, index) => (
                        <Reorder.Item key={slide.id} value={slide}>
                            <div className="relative pl-16 group">
                                {/* Slide Number - Vertically & Horizontally Centered in Gutter */}
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-zinc-950 border border-zinc-800 text-[10px] font-bold text-zinc-500 font-mono z-20 shadow-xl group-hover:border-purple-500/50 group-hover:text-purple-400 transition-all">
                                    {String(index + 1).padStart(2, '0')}
                                </div>

                            <div 
                                onClick={() => onSelect(slide.id)}
                                className={`
                                    relative bg-zinc-900/50 border rounded-xl p-4 cursor-pointer transition-all duration-300 overflow-hidden
                                    ${selectedSlideId === slide.id 
                                        ? 'border-purple-500/50 shadow-[0_0_30px_-5px_rgba(168,85,247,0.15)] bg-zinc-900 scale-[1.01]' 
                                        : 'border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/80 hover:shadow-lg'
                                    }
                                `}
                            >
                                {slide.type === 'skeleton' ? (
                                    /* --- SKELETON STATE --- */
                                    <div className="flex gap-6 animate-pulse select-none pointer-events-none">
                                         <div className="w-40 aspect-video bg-zinc-800/50 rounded border border-zinc-700/50 shrink-0" />
                                         <div className="flex-1 py-1 space-y-3">
                                             <div className="h-5 w-32 bg-zinc-800 rounded" />
                                             <div className="h-3 w-48 bg-zinc-800/50 rounded" />
                                             <div className="flex space-x-2 mt-2">
                                                 <div className="h-6 w-16 bg-zinc-800/50 rounded" />
                                                 <div className="h-6 w-16 bg-zinc-800/50 rounded" />
                                             </div>
                                             {generationLog && (
                                                <div className="pt-2 text-[10px] font-mono text-purple-400 animate-pulse flex items-center space-x-2">
                                                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full inline-block" />
                                                    <span>{generationLog}</span>
                                                </div>
                                             )}
                                         </div>
                                    </div>
                                ) : (
                                    /* --- REAL STATE --- */
                                    <div className="flex gap-6">
                                        {/* --- RICH PREVIEW THUMBNAIL --- */}
                                        <div className="w-40 aspect-video bg-zinc-950 rounded border border-zinc-800 relative overflow-hidden shrink-0 shadow-inner group-hover/thumb:scale-105 transition-transform duration-500">
                                            {/* We pass a fixed scale for the thumbnail. 
                                                Assuming standard slide is ~1280 wide and thumbnail is w-40 (~160px).
                                                Scale ~ 160 / 1280 = 0.125
                                            */}
                                            <SlidePreview slide={slide} scale={0.125} />
                                        </div>

                                        {/* Slide Info */}
                                        <div className="flex-1 py-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className={`font-medium text-lg ${selectedSlideId === slide.id ? 'text-white' : 'text-zinc-300'}`}>
                                                        {slide.type === 'default' ? `Slide ${index + 1}` : slide.type}
                                                    </h3>
                                                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2 w-[80%]">
                                                        {slide.elements?.filter(e => e.type === 'headline' || e.type === 'subheadline').map(e => e.content).join(' · ') || 'No content'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Meta Stats */}
                                            <div className="flex items-center space-x-4 mt-4">
                                                <div className="flex items-center space-x-1.5 text-[10px] text-zinc-500 bg-zinc-950/50 px-2 py-1 rounded-md border border-zinc-800/50">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    <span>{slide.elements?.filter(e => e.type === 'image').length || 0} Images</span>
                                                </div>
                                                <div className="flex items-center space-x-1.5 text-[10px] text-zinc-500 bg-zinc-950/50 px-2 py-1 rounded-md border border-zinc-800/50">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    <span>{slide.elements?.length || 0} Elements</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Drag Handle */}
                                        <div className="flex items-center text-zinc-700 group-hover:text-zinc-500">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"/></svg>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* --- INTER-SLIDE CONTROLS (Timer | Transition) --- */}
                            {index !== slides.length - 1 && (
                                <div className="flex items-center justify-center py-3 relative">
                                    {/* Horizontal connection line - Aligned with vertical track */}
                                    <div className="absolute left-8 right-0 top-1/2 -translate-y-1/2 border-t border-dashed border-zinc-800/50"></div>
                                    
                                    {/* Controls Container */}
                                    <div className="relative z-10 flex items-center space-x-3 bg-zinc-950 backdrop-blur-md px-3 py-1.5 rounded-full border border-zinc-800 shadow-xl">
                                        
                                        {/* Timer (Duration) for CURRENT slide */}
                                        <div className="flex items-center space-x-1 pr-3 border-r border-zinc-800">
                                            <svg className="w-3 h-3 text-zinc-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onDurationChange(slide.id, -15); }}
                                                className="w-4 h-4 flex items-center justify-center rounded hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors text-xs"
                                            >
                                                -
                                            </button>
                                            <span className="text-xs font-mono w-8 text-center text-zinc-300">{(slide.duration / 30).toFixed(1)}s</span>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onDurationChange(slide.id, 15); }}
                                                className="w-4 h-4 flex items-center justify-center rounded hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors text-xs"
                                            >
                                                +
                                            </button>
                                        </div>

                                        {/* Dropdown (Transition) for NEXT slide */}
                                        <div className="flex items-center space-x-1">
                                            <span className="text-[10px] text-zinc-600 uppercase tracking-wider">To Next:</span>
                                            <select 
                                                className="bg-transparent text-xs text-purple-400 font-medium focus:outline-none cursor-pointer"
                                                value={slides[index + 1]?.transition?.type || 'none'}
                                                onChange={(e) => {
                                                    const newType = e.target.value as any;
                                                    onUpdateSlide(slides[index + 1].id, { 
                                                        transition: { 
                                                            type: newType, 
                                                            duration: slides[index + 1]?.transition?.duration || 0.5 
                                                        } 
                                                    });
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <option value="none">None</option>
                                                <option value="fade">Fade</option>
                                                <option value="slide">Slide</option>
                                                <option value="wipe">Wipe</option>
                                            </select>
                                        </div>

                                    </div>
                                </div>
                            )}
                        </div>
                    </Reorder.Item>
                ))}
                </Reorder.Group>
            </div>
            
            {/* Empty State / Prompt Link */}
            {slides.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                    <p className="text-zinc-500 mb-4">No slides yet</p>
                    <p className="text-sm text-zinc-600">Generate using ai or do manually</p>
                </div>
            )}
        </div>
    );
};

export default SlideSequence;
