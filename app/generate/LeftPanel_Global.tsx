import React from 'react';
import { GenerationStatus } from './types';
import { motion } from 'framer-motion';

interface LeftPanel_GlobalProps {
    globalPrompt: string;
    setGlobalPrompt: (val: string) => void;
    onGenerate: () => void;
    generationStatus: GenerationStatus;
    onBackToGlobal: () => void;
    visualStyle: string;
    setVisualStyle: (style: string) => void;
}

export const LeftPanel_Global: React.FC<LeftPanel_GlobalProps> = ({
    globalPrompt,
    setGlobalPrompt,
    onGenerate,
    generationStatus,
    onBackToGlobal,
    visualStyle,
    setVisualStyle
}) => {
    return (
        <div className="space-y-6">
             <div className="space-y-3">
                <label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold flex items-center space-x-2">
                    <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
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
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Video Prompt</label>
                    <button onClick={onBackToGlobal} className="text-[10px] text-purple-400 hover:text-purple-300">
                        Reset Context
                    </button>
                </div>
                <textarea
                    className="w-full bg-zinc-950/50 text-sm text-zinc-300 p-3 rounded-lg border border-zinc-800 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 focus:outline-none transition-all resize-none min-h-[100px]"
                    placeholder="Describe your video topic..."
                    value={globalPrompt}
                    onChange={(e) => setGlobalPrompt(e.target.value)}
                />
                <button
                    onClick={onGenerate}
                    disabled={generationStatus === 'generating'}
                    className={`w-full mt-4 py-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center space-x-2 ${
                        generationStatus === 'generating'
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-900/20'
                    }`}
                >
                    {generationStatus === 'generating' ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Generating...</span>
                        </>
                    ) : (
                        <>
                            <span>Generate Video</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
