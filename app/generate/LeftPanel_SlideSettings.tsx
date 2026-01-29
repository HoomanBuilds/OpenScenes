import React, { useRef, useState } from 'react';
import { Slide, SlideBackground } from './types';

interface LeftPanel_SlideSettingsProps {
    selectedSlide: Slide;
    onUpdateSlideBackground: (slideId: string, bg: SlideBackground) => void;
    onUploadAsset: (file: File, type: 'image') => void; 
}

const PRESET_COLORS = ['#000000', '#18181b', '#1e1b4b', '#1e293b', '#064e3b', '#4c1d95'];
const PRESET_GRADIENTS = [
    'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)',
    'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)',
    'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
    'linear-gradient(135deg, #475569 0%, #1e293b 100%)',
];

export const LeftPanel_SlideSettings: React.FC<LeftPanel_SlideSettingsProps> = ({
    selectedSlide,
    onUpdateSlideBackground,
    onUploadAsset
}) => {
    const bgInputRef = useRef<HTMLInputElement>(null);
    const [aiEditPrompt, setAiEditPrompt] = useState('');
    const [activeTab, setActiveTab] = useState<'solid' | 'gradient' | 'image'>(
        selectedSlide.background?.type === 'color' ? 'solid' : (selectedSlide.background?.type || 'solid')
    );

    const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            onUpdateSlideBackground(selectedSlide.id, {
                type: 'image',
                value: url,
                props: { size: 'cover', position: 'center' }
            });
            onUploadAsset(file, 'image');
        }
    };

    return (
        <div className="space-y-6">
            {/* Slide AI Prompt */}
            <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold flex items-center space-x-2">
                    <svg className="w-3.5 h-3.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    <span>Slide AI Prompt</span>
                </label>
                <div className="relative group">
                    <textarea 
                        className="w-full bg-zinc-950/50 border border-dashed border-zinc-700 rounded-md p-3 text-sm text-zinc-300 focus:border-purple-500 focus:outline-none resize-none h-20 placeholder-zinc-700 transition-colors"
                        placeholder="Update this slide (e.g. 'dark theme', 'add charts')..."
                        value={aiEditPrompt} 
                        onChange={(e) => setAiEditPrompt(e.target.value)}
                    />
                    <button 
                        className="absolute bottom-2 right-2 p-1.5 bg-zinc-800 hover:bg-purple-600 text-zinc-400 hover:text-white rounded-md transition-all opacity-0 group-hover:opacity-100"
                        onClick={() => {
                            console.log("Applying Slide Prompt:", aiEditPrompt);
                            setAiEditPrompt('');
                        }}
                    >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold whitespace-nowrap">BG ORIENTATION</label>
                    <div className="flex bg-zinc-950 rounded-lg p-0.5 border border-zinc-800/50">
                        {(['solid', 'gradient', 'image'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-md transition-all ${activeTab === tab ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-300'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-3 bg-zinc-950/50 border border-zinc-800/50 rounded-xl space-y-3">
                    {activeTab === 'solid' && (
                        <div className="space-y-2">
                            <div className="grid grid-cols-6 gap-1.5">
                                 {/* Transparent / None Option */}
                                <button
                                    onClick={() => onUpdateSlideBackground(selectedSlide.id, { type: 'color', value: 'transparent' })}
                                    className={`w-full aspect-square rounded border transition-all flex items-center justify-center group relative overflow-hidden ${selectedSlide.background?.value === 'transparent' ? 'border-purple-500 scale-110 shadow-lg' : 'border-white/5 hover:border-white/20'}`}
                                    title="None (Transparent)"
                                >
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/checkerboard-cross-light.png')] opacity-20" />
                                    <svg className="w-4 h-4 text-zinc-500 group-hover:text-red-400 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>

                                {PRESET_COLORS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => onUpdateSlideBackground(selectedSlide.id, { type: 'color', value: color })}
                                        className={`w-full aspect-square rounded border transition-all ${selectedSlide.background?.value === color ? 'border-purple-500 scale-110 shadow-lg' : 'border-white/5 hover:border-white/20'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                                <input 
                                    type="color" 
                                    className="w-full aspect-square rounded bg-transparent border-white/5 cursor-pointer p-0 overflow-hidden"
                                    value={selectedSlide.background?.type === 'color' && selectedSlide.background.value !== 'transparent' ? selectedSlide.background.value : '#000000'}
                                    onChange={(e) => onUpdateSlideBackground(selectedSlide.id, { type: 'color', value: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'gradient' && (
                        <div className="space-y-2">
                            <div className="grid grid-cols-3 gap-1.5">
                                {PRESET_GRADIENTS.map((grad, i) => (
                                    <button
                                        key={i}
                                        onClick={() => onUpdateSlideBackground(selectedSlide.id, { type: 'gradient', value: grad })}
                                        className={`h-7 rounded border transition-all ${selectedSlide.background?.value === grad ? 'border-purple-500 scale-[1.02] shadow-lg' : 'border-white/5 hover:border-white/20'}`}
                                        style={{ background: grad }}
                                    />
                                ))}
                            </div>
                            <div className="flex gap-2 items-center pt-1.5 border-t border-zinc-800/50">
                                <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Custom</span>
                                <div className="flex gap-1 flex-1">
                                     <input type="color" className="w-full h-5 rounded bg-transparent border-zinc-900 cursor-pointer" 
                                        onChange={(e) => {
                                             const start = e.target.value;
                                             onUpdateSlideBackground(selectedSlide.id, { type: 'gradient', value: `linear-gradient(135deg, ${start} 0%, #000000 100%)` })
                                        }}
                                     />
                                      <input type="color" className="w-full h-5 rounded bg-transparent border-zinc-900 cursor-pointer" 
                                        onChange={(e) => {
                                             const end = e.target.value;
                                             onUpdateSlideBackground(selectedSlide.id, { type: 'gradient', value: `linear-gradient(135deg, #ffffff 0%, ${end} 100%)` })
                                        }}
                                     />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'image' && (
                        <div className="space-y-2">
                            <div 
                                onClick={() => bgInputRef.current?.click()}
                                className="w-full h-16 rounded-lg border-2 border-dashed border-zinc-800 hover:border-purple-500/50 bg-zinc-900/50 flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden relative"
                            >
                                {selectedSlide.background?.type === 'image' ? (
                                    <>
                                        <img src={selectedSlide.background.value} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[9px] text-white font-bold uppercase">Change</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 text-zinc-700 group-hover:text-purple-500 mb-1 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <span className="text-[8px] text-zinc-500 group-hover:text-zinc-300 font-bold uppercase tracking-widest">Upload Image</span>
                                    </>
                                )}
                                <input ref={bgInputRef} type="file" className="hidden" accept="image/*" onChange={handleBgUpload} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
