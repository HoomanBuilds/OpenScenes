'use client';

import React, { useState } from 'react';
import { Slide, Asset, GenerationStatus, SlideElement, SlideBackground, ContextFile } from './types';
import { LeftPanel_Global, RenderOptions } from './LeftPanel_Global';
import { LeftPanel_Assets } from './LeftPanel_Assets';
import { LeftPanel_ComponentLibrary } from './LeftPanel_ComponentLibrary';
import { LeftPanel_SlideSettings } from './LeftPanel_SlideSettings';
import { LeftPanel_ElementEditor } from './LeftPanel_ElementEditor';

interface LeftPanelProps {
    globalPrompt: string;
    setGlobalPrompt: (prompt: string) => void;
    selectedSlideId: string | null;
    selectedElementIds: string[];
    selectedSlide: Slide | undefined;
    slides: Slide[];
    globalAssets: Asset[];
    generationStatus: GenerationStatus;
    onGenerate: () => void;
    onBackToGlobal: () => void;
    onUploadAsset: (file: File, type: 'image' | 'audio' | 'video') => void;
    onUpdateElement: (slideId: string, elementId: string, changes: Partial<SlideElement>) => void;
    onUpdateSlideBackground: (slideId: string, bg: SlideBackground) => void;
    onRemove: () => void;
    onRegenerateSlide: (slideId: string) => void;
    onRemoveElement: (slideId: string, elementId: string) => void;
    contextFiles: ContextFile[];
    onAddContextFile: (file: ContextFile) => void;
    onRemoveContextFile: (id: string) => void;
    renderStatus: 'idle' | 'rendering' | 'done';
    renderProgress: number;
    renderPhase: string;
    onRender: (options: RenderOptions) => void;
    onAbort: () => void;
    visualStyle: string;
    setVisualStyle: (style: string) => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ 
    globalPrompt,
    setGlobalPrompt,
    selectedSlideId, 
    selectedElementIds,
    selectedSlide,
    slides, 
    globalAssets,
    generationStatus,
    onGenerate, 
    onBackToGlobal,
    onUploadAsset,
    onUpdateElement,
    onUpdateSlideBackground,
    onRemove,
    onRegenerateSlide,
    onRemoveElement,
    contextFiles,
    onAddContextFile,
    onRemoveContextFile,
    renderStatus,
    renderProgress,
    renderPhase,
    onRender,
    onAbort,
    visualStyle,
    setVisualStyle,
}) => {
    const [libraryTab, setLibraryTab] = useState<'assets' | 'components'>('assets');
    const [aiEditPrompt, setAiEditPrompt] = useState('');

    const primaryElementId = selectedElementIds[0];
    const selectedElement = selectedSlide?.elements?.find(e => e.id === primaryElementId);
    const selectionCount = selectedElementIds.length;

    const handleDragStartComponent = (e: React.DragEvent, type: SlideElement['type'], preset?: string) => {
         e.dataTransfer.setData('application/json', JSON.stringify({
            type: 'component',
            componentType: type,
            preset
        }));
    };

    return (
        <div className="w-[420px] border-r-2 border-black flex flex-col bg-[#09090b]/90 backdrop-blur-md shrink-0 h-full relative z-10 shadow-2xl">
            
             <div className="p-6 border-b-2 border-black flex justify-center bg-[#09090b] relative">
                <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}></div>

                <div className="flex items-center space-x-1 relative z-10">
                    {['S','C','E','N','E','S'].map((l, i) => (
                        <div key={i} 
                            className="w-6 h-8 bg-zinc-900 border-b-2 border-r-2 border-black flex items-center justify-center rounded-[1px] relative group hover:-translate-y-0.5 transition-transform"
                            style={{ 
                                backgroundColor: i === 0 ? '#9333ea' : '#18181b',
                                borderTop: '1px solid rgba(255,255,255,0.1)',
                                borderLeft: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            <span className={`text-[10px] font-black uppercase font-mono ${i === 0 ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                                {l}
                            </span>
                            <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white/10 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                
                {selectedSlideId ? (
                    // =========================================
                    // SLIDE CONTEXT MODE
                    // =========================================
                    <div className="animate-in slide-in-from-left-4 fade-in duration-300 pb-20">
                        <div className="flex items-center justify-between mb-8 border-b-2 border-zinc-900 pb-4">
                            <h2 className="text-sm font-black text-zinc-100 flex items-center space-x-2 uppercase tracking-widest">
                                <span className="text-purple-600">Edit</span>
                                <span className="text-zinc-600">/</span>
                                <span className="text-xs font-mono text-zinc-400 bg-zinc-950 px-2 py-1 border border-zinc-800">
                                    {selectedSlide?.type}
                                </span>
                            </h2>
                            <div className="flex space-x-1">
                                <button 
                                    onClick={() => onRegenerateSlide(selectedSlideId!)}
                                    className="w-7 h-7 flex items-center justify-center bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-purple-500/50 text-zinc-400 hover:text-white transition-all group"
                                    title="Regenerate Slide"
                                >
                                    <svg className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                </button>
                                <button 
                                    onClick={onRemove}
                                    className="w-7 h-7 flex items-center justify-center bg-zinc-900 border border-zinc-800 hover:bg-red-500/10 hover:border-red-500/50 text-zinc-400 hover:text-red-400 transition-all"
                                    title="Delete Slide"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                                <button 
                                    onClick={onBackToGlobal}
                                    className="px-3 h-7 flex items-center bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all ml-2"
                                >
                                    Exit
                                </button>
                            </div>
                        </div>

                        {selectionCount > 0 && (
                             <div className="mb-6 animate-in zoom-in-95 duration-200">
                                <div className="bg-zinc-950/50 border-2 border-zinc-900 p-0 relative overflow-hidden group">
                                    <div className="flex justify-between items-center p-2 bg-zinc-900/30 border-b border-zinc-900">
                                        <div className="flex items-center space-x-2">
                                            <span className="bg-purple-600 text-white text-[9px] font-black px-1.5 py-0.5 uppercase tracking-wide">AI_MOD</span>
                                            <span className="text-[10px] text-zinc-400 font-mono uppercase">
                                                Targeting {selectionCount} OBJ
                                            </span>
                                        </div>
                                    </div>

                                    <div className="relative p-2">
                                        <textarea 
                                            placeholder="> Enter transformation command..."
                                            value={aiEditPrompt}
                                            onChange={(e) => setAiEditPrompt(e.target.value)}
                                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-600 rounded-none py-2 px-3 text-xs font-mono text-zinc-300 placeholder-zinc-700 focus:outline-none resize-none h-20"
                                        />
                                        <button 
                                            onClick={() => {
                                                const prompt = aiEditPrompt.toLowerCase();
                                                const updates: Partial<SlideElement> = {};
                                                
                                                if (prompt.includes('red')) updates.color = '#ef4444';
                                                if (prompt.includes('blue')) updates.color = '#3b82f6';
                                                if (prompt.includes('green')) updates.color = '#22c55e';
                                                if (prompt.includes('bigger') || prompt.includes('large')) updates.fontSize = (selectedElement?.fontSize || 16) + 10;
                                                if (prompt.includes('smaller')) updates.fontSize = (selectedElement?.fontSize || 16) - 5;
                                                if (prompt.includes('bold')) updates.fontWeight = 'bold';
                                                if (prompt.includes('opacity') || prompt.includes('fade')) updates.opacity = 0.5;
                                                
                                                if (Object.keys(updates).length > 0) {
                                                    selectedElementIds.forEach(id => {
                                                        onUpdateElement(selectedSlide!.id, id, updates);
                                                    });
                                                    setAiEditPrompt('');
                                                }
                                            }}
                                            className="absolute right-3 bottom-3 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[9px] font-black uppercase tracking-widest transition-colors"
                                        >
                                            EXECUTE
                                        </button>
                                    </div>
                                </div>
                             </div>
                        )}

                        {selectedElement ? (
                            // --- ELEMENT PROPERTIES EDITOR ---
                             <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                <LeftPanel_ElementEditor 
                                    element={selectedElement}
                                    onUpdate={(changes) => onUpdateElement(selectedSlide!.id, selectedElement.id, changes)}
                                    // Pass remove function if element is selected
                                    onRemove={() => onRemoveElement(selectedSlide!.id, selectedElement.id)}
                                />
                             </div>
                        ) : (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                
                                <LeftPanel_SlideSettings 
                                    selectedSlide={selectedSlide!}
                                    onUpdateSlideBackground={onUpdateSlideBackground}
                                    onUploadAsset={onUploadAsset}
                                />

                                <div className="space-y-4 pt-4 border-t-2 border-zinc-900">
                                    <div className="flex bg-zinc-950 p-1 border-2 border-zinc-900">
                                        <button 
                                            onClick={() => setLibraryTab('assets')}
                                            className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${libraryTab === 'assets' ? 'bg-zinc-100 text-black' : 'text-zinc-600 hover:text-white hover:bg-zinc-900'}`}
                                        >
                                            Assets
                                        </button>
                                        <div className="w-px bg-zinc-800 mx-1"></div>
                                        <button 
                                            onClick={() => setLibraryTab('components')}
                                            className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${libraryTab === 'components' ? 'bg-zinc-100 text-black' : 'text-zinc-600 hover:text-white hover:bg-zinc-900'}`}
                                        >
                                            Components
                                        </button>
                                    </div>

                                    {libraryTab === 'assets' && (
                                        <LeftPanel_Assets 
                                            globalAssets={globalAssets}
                                            onUploadAsset={onUploadAsset}
                                        />
                                    )}

                                    {libraryTab === 'components' && (
                                        <LeftPanel_ComponentLibrary 
                                            onDragStart={handleDragStartComponent}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-right-4 fade-in duration-300 space-y-8">
                        <LeftPanel_Global 
                            globalPrompt={globalPrompt}
                            setGlobalPrompt={setGlobalPrompt}
                            onGenerate={onGenerate}
                            generationStatus={generationStatus}
                            onBackToGlobal={onBackToGlobal}
                            visualStyle={visualStyle}
                            setVisualStyle={setVisualStyle}
                            contextFiles={contextFiles}
                            onAddContextFile={onAddContextFile}
                            onRemoveContextFile={onRemoveContextFile}
                            slidesCount={slides.length}
                            renderStatus={renderStatus}
                            renderProgress={renderProgress}
                            renderPhase={renderPhase}
                            onRender={onRender}
                            onAbort={onAbort}
                        />
                         
                         <div className="space-y-4 pt-4 border-t-2 border-zinc-900">
                             <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-black flex items-center space-x-2">
                                <div className="w-2 h-2 bg-purple-600"></div>
                                <span>Assets Registry</span>
                             </h3>
                            <LeftPanel_Assets 
                                globalAssets={globalAssets}
                                onUploadAsset={onUploadAsset}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeftPanel;
