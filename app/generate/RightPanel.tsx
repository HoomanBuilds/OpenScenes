'use client';

import React, { useRef } from 'react';
import { GenerationStatus, Slide, ViewMode, SlideElement } from './types';
import SlideSequence from './SlideSequence';
import InteractiveSlidePreview from './InteractiveSlidePreview';
import { motion } from 'framer-motion';
import { Play, Upload, Download, ArrowLeft, Film, Check } from 'lucide-react';

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
    onImport?: (file: File) => void;
    refreshKey: number;
    log?: string;
    renderStatus: 'idle' | 'rendering' | 'done';
    renderedVideoUrl?: string | null;
    renderFileName?: string;
    onDownload?: () => void;
    onResetRender?: () => void;
    onExport?: () => void;
    projectName?: string;
    setProjectName?: (name: string) => void;
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
    onImport,
    refreshKey,
    log = '',
    renderStatus,
    renderedVideoUrl,
    renderFileName,
    onDownload,
    onResetRender,
    onExport,
    projectName,
    setProjectName
}) => {
    const selectedSlide = slides.find(s => s.id === selectedSlideId);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onImport) {
            onImport(file);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    if (renderStatus === 'done' && renderedVideoUrl) {
        return (
            <div className="flex-1 bg-zinc-950 relative overflow-hidden flex flex-col h-full">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-zinc-950 to-zinc-950 pointer-events-none" />
                
                <div className="h-16 border-b-2 border-black flex items-center justify-between px-6 z-10 bg-[#09090b]">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-400">
                            Render Complete
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500 bg-zinc-900 px-2 py-1 border border-zinc-800">
                            {renderFileName || 'video.mp4'}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onResetRender}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border-2 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all group"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Editor
                        </button>
                        
                        <button
                            onClick={onDownload}
                            className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-500 border-2 border-green-700 text-white text-[10px] font-black uppercase tracking-widest transition-all group"
                        >
                            <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
                            Download
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center p-8">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative bg-black border-4 border-zinc-800 shadow-2xl max-w-4xl w-full"
                    >
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-green-500"></div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-green-500"></div>
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-green-500"></div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-green-500"></div>
                        
                        <video
                            src={renderedVideoUrl}
                            controls
                            autoPlay
                            className="w-full aspect-video"
                        />
                        
                        <div className="bg-zinc-900 border-t-2 border-zinc-800 px-4 py-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Check size={12} className="text-green-500" />
                                <span className="text-[9px] font-mono text-zinc-400 uppercase">
                                    Ready for Download
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[9px] font-mono text-zinc-600">{slides.length} Slides</span>
                                <span className="text-[9px] font-mono text-zinc-600">MP4</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-zinc-950 relative overflow-hidden flex flex-col h-full">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-zinc-950 to-zinc-950 pointer-events-none" />
            
            <div className="h-16 border-b-2 border-black flex items-center justify-between px-6 z-10 bg-[#09090b]">
                <div className="flex items-center gap-4">
                     <a href="/projects" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-zinc-900 border border-zinc-700 flex items-center justify-center rounded hover:bg-zinc-800 transition-colors">
                            <ArrowLeft size={14} className="text-zinc-500 group-hover:text-white transition-colors" />
                        </div>
                     </a>
                     
                     <div className="flex flex-col">
                         <input 
                            value={projectName}
                            onChange={(e) => setProjectName && setProjectName(e.target.value)}
                            className="bg-transparent border-none p-0 text-lg font-bold text-white focus:ring-0 placeholder-zinc-700 w-64 hover:text-purple-400 transition-colors"
                            placeholder="UNTITLED PROJECT"
                         />
                     </div>
                </div>

                <div className="flex items-center space-x-4">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                />
                
                {onImport && renderStatus !== 'rendering' && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border-2 border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all group"
                        style={{
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            borderLeft: '1px solid rgba(255,255,255,0.05)',
                        }}
                    >
                        <Upload size={14} className="text-blue-500 group-hover:text-blue-400" />
                        Import
                    </button>
                )}
                
                {slides.length > 0 && onExport && renderStatus !== 'rendering' && (
                    <button
                        onClick={onExport}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border-2 border-zinc-800 hover:border-yellow-500/50 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all group"
                        style={{
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            borderLeft: '1px solid rgba(255,255,255,0.05)',
                        }}
                    >
                        <Download size={14} className="text-yellow-500 group-hover:text-yellow-400" />
                        Export
                    </button>
                )}

                {slides.length > 0 && onPreview && renderStatus !== 'rendering' && (
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

                {renderStatus === 'rendering' && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900 border-2 border-purple-600/50">
                        <Film size={14} className="text-purple-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                            Rendering...
                        </span>
                    </div>
                )}
            </div>
        </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden relative z-0 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                
                {renderStatus === 'rendering' && (
                    <div className="absolute inset-0 bg-zinc-950/80 z-20 flex items-center justify-center">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-4"
                        >
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                className="w-16 h-16 border-4 border-zinc-800 border-t-purple-600 rounded-full mx-auto"
                            />
                            <div className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                                Rendering Video
                            </div>
                            <div className="text-[9px] font-mono text-zinc-600">
                                This may take a few moments...
                            </div>
                        </motion.div>
                    </div>
                )}

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
                        key={refreshKey}
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
}

export default RightPanel;
