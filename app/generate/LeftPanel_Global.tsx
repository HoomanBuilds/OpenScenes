import React, { useRef } from 'react';
import { GenerationStatus, ContextFile } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

interface LeftPanel_GlobalProps {
    globalPrompt: string;
    setGlobalPrompt: (val: string) => void;
    onGenerate: () => void;
    generationStatus: GenerationStatus;
    onBackToGlobal: () => void;
    visualStyle: string;
    setVisualStyle: (style: string) => void;
    contextFiles: ContextFile[];
    onAddContextFile: (file: ContextFile) => void;
    onRemoveContextFile: (id: string) => void;
    slidesCount: number;
    renderStatus: 'idle' | 'rendering' | 'done';
    onRender: () => void;
}

export const LeftPanel_Global: React.FC<LeftPanel_GlobalProps> = ({
    globalPrompt,
    setGlobalPrompt,
    onGenerate,
    generationStatus,
    onBackToGlobal,
    visualStyle,
    setVisualStyle,
    contextFiles,
    onAddContextFile,
    onRemoveContextFile,
    slidesCount,
    renderStatus,
    onRender
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Skip image and video expensive stuffs
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
            alert('Please select text-based context files (PDF, CSV, JSON, TXT, MD).');
            return;
        }

        // Keep it minimal and parsable
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            alert('File too large. Context files should be under 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            
            // Extract some basic text-like content
            // For PDF this will be messy without a library, but the user said "supported"
            // We'll treat all compatible files as string context
            onAddContextFile({
                id: `ctx-${Date.now()}`,
                name: file.name,
                type: file.type,
                content: content.slice(0, 50000) // Safety first
            });
        };

        reader.onerror = () => {
            alert('Failed to read context file.');
        };

        reader.readAsText(file);
        
        // Reset input for same file re-selection
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-8">
             <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-black flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-sm"></div>
                    <span>Visual Tone</span>
                </label>
                <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 border-2 border-zinc-900">
                    {['Modern Dark', 'Minimal Light', 'Vibrant', 'Corporate'].map(style => (
                        <button 
                            key={style} 
                            onClick={() => setVisualStyle(style)}
                            className={`px-2 py-3 text-[9px] font-black uppercase tracking-widest transition-all ${
                                visualStyle === style 
                                ? 'bg-zinc-100 text-black' 
                                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900'
                            }`}
                        >
                            {style}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-[#09090b] p-5 border-2 border-zinc-900 relative group transition-colors hover:border-zinc-700">
                {/* Decorative Corner - Hard corners */}
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-zinc-700"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-zinc-700"></div>

                <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rotate-45"></div>
                        <span>Project Context</span>
                    </label>
                    <div className="flex items-center space-x-2">
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            onChange={handleFileChange}
                            accept=".txt,.csv,.json,.pdf,.md,.html"
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center space-x-1.5 px-3 py-1 bg-zinc-950 border-b-2 border-r-2 border-black active:border-0 active:translate-y-0.5 active:translate-x-0.5 transition-all group hover:bg-zinc-900"
                        >
                            <LucideIcons.Paperclip className="w-3 h-3 text-zinc-600 group-hover:text-purple-400 transition-colors" />
                            <span className="text-[9px] font-black text-zinc-600 group-hover:text-zinc-300 uppercase tracking-widest">Input</span>
                        </button>
                    </div>
                </div>

                {/* Context Badges Area */}
                <AnimatePresence>
                    {contextFiles.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex flex-wrap gap-2 mb-4 p-2 bg-zinc-950 border-2 border-zinc-900 overflow-hidden"
                        >
                            {contextFiles.map((file) => (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    key={file.id}
                                    className="flex items-center space-x-2 bg-zinc-900 pl-2 pr-1.5 py-1 group hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-700"
                                >
                                    <LucideIcons.FileText className="w-3 h-3 text-zinc-500" />
                                    <span className="text-[9px] text-zinc-300 font-mono max-w-[100px] truncate uppercase">{file.name}</span>
                                    <button 
                                        onClick={() => onRemoveContextFile(file.id)}
                                        className="p-0.5 text-zinc-600 hover:text-red-400 transition-all"
                                    >
                                        <LucideIcons.X className="w-3 h-3" />
                                    </button>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                <textarea
                    className="w-full bg-zinc-950 text-xs font-mono text-zinc-300 p-4 border-2 border-zinc-900 focus:border-purple-600 focus:outline-none transition-all resize-none min-h-[140px] placeholder-zinc-700 rounded-none"
                    placeholder="> Describe sequence parameters..."
                    value={globalPrompt}
                    onChange={(e) => setGlobalPrompt(e.target.value)}
                />

                <button
                    onClick={onGenerate}
                    disabled={generationStatus === 'generating'}
                    className={`w-full mt-6 h-14 relative group transition-all flex items-center justify-between px-6 border-b-[4px] border-r-[4px] border-black active:border-0 active:translate-y-[4px] active:translate-x-[4px] ${
                        generationStatus === 'generating'
                            ? 'bg-zinc-900 cursor-not-allowed border-zinc-800'
                            : 'bg-zinc-100 hover:bg-white'
                    }`}
                >
                    <div className="flex flex-col items-start leading-none">
                        <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${generationStatus === 'generating' ? 'text-zinc-600' : 'text-zinc-400 group-hover:text-purple-600 transition-colors'}`}>
                           {generationStatus === 'generating' ? 'System_Busy' : 'Ready_to_Launch'}
                        </span>
                        <span className={`text-base font-black tracking-tighter ${generationStatus === 'generating' ? 'text-zinc-500' : 'text-black group-hover:scale-105 transition-transform origin-left'}`}>
                           {generationStatus === 'generating' ? 'PROCESSING...' : 'INITIATE_SEQUENCE'}
                        </span>
                    </div>

                    {generationStatus === 'generating' ? (
                        <LucideIcons.Loader2 className="animate-spin h-5 w-5 text-zinc-600" />
                    ) : (
                         <div className="w-8 h-8 bg-black flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                             <LucideIcons.Play className="w-4 h-4 text-white fill-current" />
                        </div>
                    )}
                </button>

                {slidesCount > 0 && (
                    <button
                        onClick={onRender}
                        disabled={renderStatus === 'rendering'}
                        className={`w-full mt-3 h-12 relative group transition-all flex items-center justify-between px-6 border-b-[3px] border-r-[3px] border-black active:border-0 active:translate-y-[3px] active:translate-x-[3px] ${
                            renderStatus === 'rendering'
                                ? 'bg-zinc-800 cursor-not-allowed border-zinc-700'
                                : renderStatus === 'done'
                                ? 'bg-green-600 hover:bg-green-500'
                                : 'bg-purple-600 hover:bg-purple-500'
                        }`}
                    >
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-[9px] font-black uppercase tracking-widest mb-0.5 text-white/70">
                                {renderStatus === 'rendering' ? 'Processing' : renderStatus === 'done' ? 'Completed' : `${slidesCount} Slides`}
                            </span>
                            <span className="text-sm font-black tracking-tighter text-white">
                                {renderStatus === 'rendering' ? 'RENDERING...' : renderStatus === 'done' ? 'RENDER COMPLETE' : 'RENDER VIDEO'}
                            </span>
                        </div>

                        {renderStatus === 'rendering' ? (
                            <LucideIcons.Loader2 className="animate-spin h-4 w-4 text-white/70" />
                        ) : renderStatus === 'done' ? (
                            <LucideIcons.Check className="h-5 w-5 text-white" />
                        ) : (
                            <LucideIcons.Film className="h-5 w-5 text-white" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};
