'use client';

import React, { useState } from 'react';
import { Slide, Asset, GenerationStatus, SlideElement, SlideBackground, ContextFile } from './types';
import { LeftPanel_Global } from './LeftPanel_Global';
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
    onRemoveContextFile
}) => {
    const [libraryTab, setLibraryTab] = useState<'assets' | 'components'>('assets');
    const [aiEditPrompt, setAiEditPrompt] = useState('');
    const [visualStyle, setVisualStyle] = useState('Modern Dark');

    // Primary selection for property editing (first selected)
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
        <div className="w-[400px] border-r border-zinc-800 flex flex-col bg-zinc-900/50 backdrop-blur-xl shrink-0 h-full">
            
            {/* --- TOP HEADER --- */}
             <div className="p-5 border-b border-zinc-800/50 flex justify-center">
                <div className="flex items-center space-x-1">
                    {['C','L','A','R','I','T','Y'].map((l, i) => (
                        <div key={i} 
                            className="w-7 h-8 bg-zinc-800 border-b-[3px] border-r-[3px] border-black flex items-center justify-center rounded-sm relative group"
                            style={{ 
                                backgroundColor: i === 0 ? '#9333ea' : '#18181b',
                                borderTop: '1px solid rgba(255,255,255,0.1)',
                                borderLeft: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            <span className={`text-[13px] font-black uppercase font-mono ${i === 0 ? 'text-white' : 'text-zinc-500'}`}>
                                {l}
                            </span>
                            {/* Reflection pixel */}
                            <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white/20 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                
                {/* --- CONTEXT SWITCHER --- */}
                {selectedSlideId ? (
                    // =========================================
                    // SLIDE CONTEXT MODE
                    // =========================================
                    <div className="animate-in slide-in-from-left-4 fade-in duration-300 pb-20">
                         {/* Back Nav */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-zinc-100 flex items-center space-x-2">
                                <span>Slide Editor</span>
                                <span className="text-xs font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                                    {selectedSlide?.type}
                                </span>
                            </h2>
                            <div className="flex space-x-2">
                                <button 
                                    onClick={() => onRegenerateSlide(selectedSlideId!)}
                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all border border-transparent hover:border-zinc-700"
                                    title="Regenerate Slide"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                </button>
                                <button 
                                    onClick={onRemove}
                                    className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/30"
                                    title="Delete Slide"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                                <button 
                                    onClick={onBackToGlobal}
                                    className="px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider text-zinc-500 hover:text-white border border-dashed border-zinc-800 hover:border-zinc-600 transition-all"
                                >
                                    BACK
                                </button>
                            </div>
                        </div>

                        {/* --- AI SELECTION BADGE & PROMPT --- */}
                        {selectionCount > 0 && (
                             <div className="mb-6 animate-in zoom-in-95 duration-200">
                                <div className="bg-zinc-900 border border-purple-500/30 rounded-xl p-3 relative overflow-hidden group shadow-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center space-x-2">
                                            <span className="bg-purple-600/20 text-purple-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-purple-500/20">AI</span>
                                            <span className="text-xs text-zinc-300 font-medium">
                                                {selectionCount} Selected
                                            </span>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <textarea 
                                            placeholder="Update selection (e.g. 'make red', 'bigger')..."
                                            value={aiEditPrompt}
                                            onChange={(e) => setAiEditPrompt(e.target.value)}
                                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-lg py-2 px-3 text-sm text-white placeholder-zinc-600 focus:outline-none resize-none h-20"
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
                                            className="absolute right-2 bottom-2 px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-medium transition-colors"
                                        >
                                            Apply
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
                            // --- SLIDE GENERAL SETTINGS ((No Selection) ---
                            <div className="space-y-6 animate-in fade-in duration-300">
                                
                                <LeftPanel_SlideSettings 
                                    selectedSlide={selectedSlide!}
                                    onUpdateSlideBackground={onUpdateSlideBackground}
                                    onUploadAsset={onUploadAsset}
                                />

                                {/* Asset / Component Library Tabs */}
                                <div className="space-y-4 pt-2">
                                    <div className="flex border-b border-zinc-800">
                                        <button 
                                            onClick={() => setLibraryTab('assets')}
                                            className={`pb-2 px-4 text-xs font-semibold uppercase tracking-wider transition-colors ${libraryTab === 'assets' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                                        >
                                            Assets
                                        </button>
                                        <button 
                                            onClick={() => setLibraryTab('components')}
                                            className={`pb-2 px-4 text-xs font-semibold uppercase tracking-wider transition-colors ${libraryTab === 'components' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-zinc-500 hover:text-zinc-300'}`}
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
                    // =========================================
                    // GLOBAL MODE (Project Driver)
                    // =========================================
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
                        />
                         
                         <div className="space-y-3">
                             <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold flex items-center space-x-2">
                                <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span>Global Assets</span>
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
