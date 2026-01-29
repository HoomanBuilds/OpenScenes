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
                     <h2 className="text-2xl font-black bg-white text-transparent bg-clip-text uppercase tracking-tighter">Sequence_buffer</h2>
                     <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-mono">Operations // Timeline</p>
                </div>
                <button 
                    onClick={onAdd}
                    className="flex items-center space-x-2 px-6 py-3 bg-zinc-950 border-2 border-zinc-800 hover:border-purple-600 hover:bg-zinc-900 transition-all group relative overflow-hidden"
                >
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-zinc-800 group-hover:bg-purple-600 transition-colors" />
                    <span className="text-purple-600 group-hover:text-purple-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-300 group-hover:text-white">New_Slot</span>
                </button>
            </div>

            <div className="relative">
                {/* Vertical Timeline Track - Hard Line */}
                <div className="absolute left-8 top-10 bottom-20 w-0.5 bg-zinc-900 pointer-events-none" />

                <Reorder.Group axis="y" values={slides} onReorder={onReorder} className="space-y-0">
                    {slides.map((slide, index) => (
                        <Reorder.Item key={slide.id} value={slide}>
                            <div className="relative pl-20 group">
                                {/* Slide Number - Hex/Square Tag */}
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-zinc-950 border-2 border-zinc-800 text-[10px] font-black text-zinc-500 font-mono z-20 shadow-xl group-hover:border-purple-600 group-hover:text-purple-400 transition-all">
                                    {String(index + 1).padStart(2, '0')}
                                </div>

                            <div 
                                onClick={() => onSelect(slide.id)}
                                className={`
                                    relative bg-zinc-950/80 border-2 p-0 cursor-pointer transition-all duration-200
                                    ${selectedSlideId === slide.id 
                                        ? 'border-purple-600 shadow-[0_0_0_1px_#9333ea]' 
                                        : 'border-zinc-800 hover:border-zinc-500'
                                    }
                                `}
                            >
                                {slide.type === 'skeleton' ? (
                                    /* --- SKELETON STATE --- */
                                    <div className="flex gap-0 animate-pulse select-none pointer-events-none p-4">
                                         <div className="w-48 aspect-video bg-zinc-900 rounded-none border border-zinc-800 shrink-0" />
                                         <div className="flex-1 px-6 py-2 space-y-3">
                                             <div className="h-4 w-32 bg-zinc-900" />
                                             <div className="h-3 w-48 bg-zinc-900/50" />
                                             <div className="flex space-x-2 mt-4">
                                                 <div className="h-5 w-16 bg-zinc-900/50" />
                                                 <div className="h-5 w-16 bg-zinc-900/50" />
                                             </div>
                                             {generationLog && (
                                                <div className="pt-2 text-[10px] font-mono text-purple-500 animate-pulse flex items-center space-x-2">
                                                    <span className="w-1.5 h-1.5 bg-purple-500" />
                                                    <span className="uppercase tracking-wider">System: {generationLog}</span>
                                                </div>
                                             )}
                                         </div>
                                    </div>
                                ) : (
                                    /* --- REAL STATE --- */
                                    <div className="flex">
                                        {/* --- RICH PREVIEW THUMBNAIL --- */}
                                        <div className="w-48 aspect-video bg-black border-r-2 border-zinc-900 relative overflow-hidden shrink-0 group-hover/thumb:opacity-90 transition-opacity">
                                            <SlidePreview slide={slide} scale={0.15} />
                                            {/* Corner Accents */}
                                            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/20 pointer-events-none" />
                                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/20 pointer-events-none" />
                                        </div>

                                        {/* Slide Info */}
                                        <div className="flex-1 p-4 flex flex-col justify-between bg-zinc-950/40">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className={`font-black text-sm uppercase tracking-wide ${selectedSlideId === slide.id ? 'text-white' : 'text-zinc-400'}`}>
                                                        {slide.type === 'default' ? `SLIDE_SEQ_${String(index + 1).padStart(3, '0')}` : slide.type.toUpperCase()}
                                                    </h3>
                                                    <p className="text-[10px] font-mono text-zinc-600 mt-1 line-clamp-1 w-[90%] uppercase">
                                                        {slide.elements?.filter(e => e.type === 'headline' || e.type === 'subheadline').map(e => e.content).join(' // ') || 'EMPTY_BUFFER'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Meta Stats */}
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                                                    <span className="w-1.5 h-1.5 bg-zinc-800 rounded-sm"></span>
                                                    <span>{slide.elements?.filter(e => e.type === 'image').length || 0} IMG</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                                                    <span className="w-1.5 h-1.5 bg-zinc-800 rounded-sm"></span>
                                                    <span>{slide.elements?.length || 0} OBJ</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Drag Handle - Industrial Grip */}
                                        <div className="w-8 border-l-2 border-zinc-900 flex items-center justify-center bg-zinc-950 group-hover:bg-zinc-900 transition-colors text-zinc-700 hover:text-zinc-400">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 12h16M4 16h16"/></svg>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* --- INTER-SLIDE CONTROLS (Timer | Transition) --- */}
                            {index !== slides.length - 1 && (
                                <div className="flex items-center justify-center py-6 relative z-10">
                                    {/* Horizontal connection line */}
                                    <div className="absolute left-8 right-0 top-1/2 -translate-y-1/2 border-t-2 border-zinc-900"></div>
                                    
                                    {/* Controls Container - Block Module */}
                                    <div className="relative flex items-center space-x-0 bg-zinc-950 px-0 py-0 border-2 border-zinc-800 shadow-xl">
                                        
                                        {/* Timer (Duration) */}
                                        <div className="flex items-center bg-zinc-900 px-2 py-1 border-r-2 border-zinc-800 space-x-2">
                                            <span className="text-[9px] font-black text-zinc-500 uppercase">Dur</span>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onDurationChange(slide.id, -15); }}
                                                className="w-4 h-4 flex items-center justify-center bg-zinc-950 border border-zinc-700 hover:border-white text-zinc-400 hover:text-white transition-colors text-[10px]"
                                            >
                                                -
                                            </button>
                                            <span className="text-[10px] font-mono w-8 text-center text-zinc-300">{(slide.duration / 30).toFixed(1)}s</span>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onDurationChange(slide.id, 15); }}
                                                className="w-4 h-4 flex items-center justify-center bg-zinc-950 border border-zinc-700 hover:border-white text-zinc-400 hover:text-white transition-colors text-[10px]"
                                            >
                                                +
                                            </button>
                                        </div>

                                        {/* Transition Selector */}
                                        <div className="flex items-center px-2 py-1 bg-zinc-950 space-x-2 min-w-[100px] justify-between">
                                            <span className="text-[9px] text-zinc-600 uppercase font-bold">FX</span>
                                            <select 
                                                className="bg-transparent text-[10px] text-purple-400 font-bold uppercase focus:outline-none cursor-pointer text-right appearance-none"
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
                                                <option value="none">CUT</option>
                                                <option value="fade">FADE</option>
                                                <option value="slide">SLIDE</option>
                                                <option value="wipe">WIPE</option>
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
            
            {/* Empty State */}
            {slides.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-zinc-800 bg-zinc-900/10">
                    <p className="text-zinc-600 font-black uppercase tracking-widest text-sm mb-2">Sequence Buffer Empty</p>
                    <p className="text-[10px] font-mono text-zinc-700">Initiate generation or add manual slot</p>
                </div>
            )}
        </div>
    );
};

export default SlideSequence;
