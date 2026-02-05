import React, { useRef, useState } from 'react';
import { GenerationStatus, ContextFile } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { getAllThemes, themes } from '../lib/themes';

export interface RenderOptions {
    resolution: '720p' | '1080p' | '4k';
    fps?: number;
    scale?: number;
    quality?: 'low' | 'medium' | 'high' | 'ultra';
}

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
    renderProgress: number;
    renderPhase: string;

    onRender: (options: RenderOptions) => void;
    onAbort: () => void;
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
    renderProgress,
    renderPhase,
    onRender,
    onAbort
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showOptions, setShowOptions] = useState(false);
    const [renderOptions, setRenderOptions] = useState<RenderOptions>({
        resolution: '1080p',
        quality: 'high'
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
            alert('Please select text-based context files (PDF, CSV, JSON, TXT, MD).');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert('File too large. Context files should be under 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            onAddContextFile({
                id: `ctx-${Date.now()}`,
                name: file.name,
                type: file.type,
                content: content.slice(0, 50000)
            });
        };

        reader.onerror = () => {
            alert('Failed to read context file.');
        };

        reader.readAsText(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRenderClick = () => {
        if (renderStatus === 'rendering') return;
        onRender(renderOptions);
    };

    return (
        <div className="space-y-8">
             <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-black flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-sm"></div>
                    <span>Visual Tone</span>
                </label>
                <div className="space-y-2 p-1 bg-zinc-950 border-2 border-zinc-900">
                    <select
                        value={getAllThemes().find(t => t.prompt_injection === visualStyle)?.id || ''}
                        onChange={(e) => {
                            const t = themes[e.target.value];
                            if (t) setVisualStyle(t.prompt_injection);
                        }}
                        className="w-full bg-zinc-900 border border-black text-[10px] text-zinc-300 p-2 focus:outline-none focus:border-purple-500 uppercase tracking-wide font-mono"
                    >
                        <option value="" disabled>Select Theme...</option>
                        {getAllThemes().map(t => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))}
                    </select>

                    {(() => {
                        const currentTheme = getAllThemes().find(t => t.prompt_injection === visualStyle);
                        if (currentTheme) {
                            return (
                                <div className="p-3 bg-black/50 border border-zinc-800 space-y-2">
                                    <div 
                                        className="h-12 w-full rounded-sm relative overflow-hidden"
                                        style={{ background: currentTheme.preview_gradient }}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center">
                                             <span className="text-[9px] font-black uppercase text-white drop-shadow-md tracking-widest">
                                                 {currentTheme.name}
                                             </span>
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-zinc-500 leading-relaxed">
                                        {currentTheme.description}
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {currentTheme.tags.map(tag => (
                                            <span key={tag} className="px-1.5 py-0.5 bg-zinc-800 text-[8px] text-zinc-400 uppercase tracking-wider rounded-[1px]">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>
            </div>

            <div className="bg-[#09090b] p-5 border-2 border-zinc-900 relative group transition-colors hover:border-zinc-700">
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
                    disabled={generationStatus === 'generating' || renderStatus === 'rendering'}
                    className={`w-full mt-6 h-14 relative group transition-all flex items-center justify-between px-6 border-b-[4px] border-r-[4px] border-black active:border-0 active:translate-y-[4px] active:translate-x-[4px] ${
                        generationStatus === 'generating' || renderStatus === 'rendering'
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
                    <div className="mt-3 relative sticky bottom-0 bg-[#09090b] pt-2 pb-2 z-20 border-t border-zinc-900">
                        {/* Main Render Button */}
                        <div className="flex">
                            <button
                                onClick={handleRenderClick}
                                disabled={renderStatus === 'rendering'}
                                className={`flex-1 h-12 relative group transition-all flex items-center justify-between px-6 border-b-[3px] border-r-[3px] border-black active:border-0 active:translate-y-[3px] active:translate-x-[3px] ${
                                    renderStatus === 'rendering'
                                        ? 'bg-zinc-800 cursor-not-allowed border-zinc-700'
                                        : renderStatus === 'done'
                                        ? 'bg-green-600 hover:bg-green-500'
                                        : 'bg-purple-600 hover:bg-purple-500'
                                }`}
                            >
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[9px] font-black uppercase tracking-widest mb-0.5 text-white/70">
                                        {renderStatus === 'rendering' ? `${renderProgress}%` : renderStatus === 'done' ? 'Completed' : `${slidesCount} Slides`}
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

                            {renderStatus === 'rendering' ? (
                                <button
                                    onClick={onAbort}
                                    className="w-10 h-12 flex items-center justify-center border-b-[3px] border-r-[3px] border-black bg-red-600 hover:bg-red-500 transition-all active:border-0 active:translate-y-[3px] active:translate-x-[3px]"
                                    title="Abort Rendering"
                                >
                                    <div className="w-3 h-3 bg-white rounded-[2px]"></div>
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowOptions(!showOptions)}
                                    className={`w-10 h-12 flex items-center justify-center border-b-[3px] border-r-[3px] border-black transition-all ${
                                        showOptions
                                            ? 'bg-zinc-900'
                                            : 'bg-zinc-800 hover:bg-zinc-700'
                                    }`}
                                >
                                    <LucideIcons.ChevronDown className={`w-4 h-4 text-white transition-transform ${showOptions ? 'rotate-180' : ''}`} />
                                </button>
                            )}
                        </div>

                        {renderStatus === 'rendering' && (
                            <div className="mt-2 space-y-1">
                                <div className="h-2 bg-zinc-900 border border-zinc-800 overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-purple-600 to-purple-400"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${renderProgress}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-mono text-zinc-500 uppercase">
                                        {renderPhase || 'connecting'}
                                    </span>
                                    <span className="text-[9px] font-mono text-zinc-400">
                                        {renderProgress}%
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Options Dropdown */}
                        <AnimatePresence>
                            {showOptions && renderStatus !== 'rendering' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, y: -10, height: 0 }}
                                    className="mt-2 bg-zinc-900 border-2 border-zinc-800 p-4 space-y-4"
                                >
                                    {/* Resolution Option */}
                                    <div>
                                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">
                                            Resolution
                                        </label>
                                        <div className="flex gap-2">
                                            {(['720p', '1080p', '4k'] as const).map(r => (
                                                <button
                                                    key={r}
                                                    onClick={() => setRenderOptions(prev => ({ ...prev, resolution: r }))}
                                                    className={`flex-1 py-2 text-[10px] font-black uppercase transition-all ${
                                                        renderOptions.resolution === r
                                                            ? 'bg-purple-600 text-white'
                                                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                                                    }`}
                                                >
                                                    {r}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">
                                            Quality
                                        </label>
                                        <div className="flex gap-2">
                                            {(['low', 'medium', 'high', 'ultra'] as const).map(q => (
                                                <button
                                                    key={q}
                                                    onClick={() => setRenderOptions(prev => ({ ...prev, quality: q }))}
                                                    className={`flex-1 py-2 text-[10px] font-black uppercase transition-all relative overflow-hidden group/btn ${
                                                        renderOptions.quality === q
                                                            ? q === 'ultra' 
                                                                ? 'bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                                                                : 'bg-purple-600 text-white'
                                                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                                                    }`}
                                                >
                                                    {q === 'ultra' && (
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                                                    )}
                                                    {q}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

