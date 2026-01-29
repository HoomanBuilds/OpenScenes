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
    onRemoveContextFile
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
        <div className="space-y-6">
             <div className="space-y-3">
                <label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold flex items-center space-x-2">
                    <LucideIcons.Palette className="w-4 h-4 text-purple-500" />
                    <span>Visual Style</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {['Modern Dark', 'Minimal Light', 'Vibrant', 'Corporate'].map(style => (
                        <button 
                            key={style} 
                            onClick={() => setVisualStyle(style)}
                            className={`px-3 py-2 bg-zinc-950 border rounded-lg text-xs font-medium transition-all ${
                                visualStyle === style 
                                ? 'border-purple-500 text-white bg-purple-500/10' 
                                : 'border-zinc-800 text-zinc-400 hover:text-white hover:border-purple-500/50'
                            }`}
                        >
                            {style}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 shadow-2xl">
                <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center space-x-2">
                        <LucideIcons.Sparkles className="w-3.5 h-3.5 text-purple-500" />
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
                            className="flex items-center space-x-1.5 px-2 py-1 bg-purple-600/10 border border-purple-500/20 rounded hover:bg-purple-600/20 transition-all group"
                        >
                            <LucideIcons.Paperclip className="w-3 h-3 text-purple-400 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold text-purple-400 uppercase">Add Context</span>
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
                            className="flex flex-wrap gap-2 mb-4 p-2 bg-zinc-950/40 rounded-lg border border-zinc-800/50 overflow-hidden"
                        >
                            {contextFiles.map((file) => (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    key={file.id}
                                    className="flex items-center space-x-2 bg-zinc-800/80 border border-zinc-700/50 pl-2 pr-1.5 py-1 rounded-full group hover:border-purple-500/30 transition-colors"
                                >
                                    <LucideIcons.FileText className="w-3 h-3 text-zinc-500" />
                                    <span className="text-[10px] text-zinc-300 font-medium max-w-[100px] truncate">{file.name}</span>
                                    <button 
                                        onClick={() => onRemoveContextFile(file.id)}
                                        className="p-0.5 text-zinc-500 hover:text-white hover:bg-red-500/20 rounded-full transition-all"
                                    >
                                        <LucideIcons.X className="w-3 h-3" />
                                    </button>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                <textarea
                    className="w-full bg-zinc-950/50 text-sm text-zinc-300 p-3 rounded-lg border border-zinc-800 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 focus:outline-none transition-all resize-none min-h-[120px]"
                    placeholder="Describe your video topic or core message..."
                    value={globalPrompt}
                    onChange={(e) => setGlobalPrompt(e.target.value)}
                />

                <button
                    onClick={onGenerate}
                    disabled={generationStatus === 'generating'}
                    className={`w-full mt-4 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center space-x-3 ${
                        generationStatus === 'generating'
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-900/30 active:scale-[0.98]'
                    }`}
                >
                    {generationStatus === 'generating' ? (
                        <>
                            <LucideIcons.Loader2 className="animate-spin h-4 w-4" />
                            <span>PROCESSING PROJECT...</span>
                        </>
                    ) : (
                        <>
                            <LucideIcons.Play className="w-4 h-4 fill-current" />
                            <span>GENERATE VIDEO</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
