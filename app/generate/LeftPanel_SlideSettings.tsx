import React, { useRef, useState, useEffect } from 'react';
import { Slide, SlideBackground, ChatMessage } from './types';

interface LeftPanel_SlideSettingsProps {
    selectedSlide: Slide;
    onUpdateSlideBackground: (slideId: string, bg: SlideBackground) => void;
    onUploadAsset: (file: File, type: 'image') => void;
    onSlideAIEdit: (slideId: string, instruction: string) => void;
    isGenerating: boolean;
    chatHistory: ChatMessage[];
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
    onUploadAsset,
    onSlideAIEdit,
    isGenerating,
    chatHistory
}) => {
    const bgInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [aiEditPrompt, setAiEditPrompt] = useState('');
    const [activeTab, setActiveTab] = useState<'solid' | 'gradient' | 'image'>(
        selectedSlide.background?.type === 'color' ? 'solid' : (selectedSlide.background?.type || 'solid')
    );

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, isGenerating]);

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
        <div className="space-y-6 mt-4">
            <div className="space-y-4 pt-4 border-t-2 border-zinc-900">
                <div className="flex items-center justify-between gap-2">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-600 font-black whitespace-nowrap">Background Layer</label>
                    <div className="flex bg-zinc-950 border-2 border-zinc-900">
                        {(['solid', 'gradient', 'image'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-zinc-100 text-black' : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 bg-zinc-950 border-2 border-zinc-900 relative">
                     {/* Decorative mechanical screws */}
                    <div className="absolute -top-1 -left-1 w-2 h-2 border-l border-t border-zinc-800"></div>
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-zinc-800"></div>

                    {activeTab === 'solid' && (
                        <div className="space-y-2">
                            <div className="grid grid-cols-6 gap-2">
                                 {/* Transparent / None Option */}
                                <button
                                    onClick={() => onUpdateSlideBackground(selectedSlide.id, { type: 'color', value: 'transparent' })}
                                    className={`w-full aspect-square border-2 transition-all flex items-center justify-center group relative overflow-hidden ${selectedSlide.background?.value === 'transparent' ? 'border-purple-500' : 'border-zinc-800 hover:border-zinc-600'}`}
                                    title="None (Transparent)"
                                >
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/checkerboard-cross-light.png')] opacity-20" />
                                    <div className="w-3 h-0.5 bg-red-500/50 rotate-45 transform"></div>
                                </button>

                                {PRESET_COLORS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => onUpdateSlideBackground(selectedSlide.id, { type: 'color', value: color })}
                                        className={`w-full aspect-square border-2 transition-all ${selectedSlide.background?.value === color ? 'border-purple-500 ring-1 ring-purple-500/50' : 'border-zinc-800 hover:border-zinc-600'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                                <div className="relative w-full aspect-square border-2 border-zinc-800 hover:border-zinc-600 flex items-center justify-center bg-zinc-900">
                                    <input 
                                        type="color" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        value={selectedSlide.background?.type === 'color' && selectedSlide.background.value !== 'transparent' ? selectedSlide.background.value : '#000000'}
                                        onChange={(e) => onUpdateSlideBackground(selectedSlide.id, { type: 'color', value: e.target.value })}
                                    />
                                    <span className="text-[8px] font-mono text-zinc-500">+</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'gradient' && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-2">
                                {PRESET_GRADIENTS.map((grad, i) => (
                                    <button
                                        key={i}
                                        onClick={() => onUpdateSlideBackground(selectedSlide.id, { type: 'gradient', value: grad })}
                                        className={`h-8 border-2 transition-all ${selectedSlide.background?.value === grad ? 'border-white' : 'border-zinc-800 hover:border-zinc-600'}`}
                                        style={{ background: grad }}
                                    />
                                ))}
                            </div>
                            <div className="flex gap-2 items-center pt-2 border-t border-zinc-900 border-dashed">
                                <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Custom Mix</span>
                                <div className="flex gap-1 flex-1">
                                     <input type="color" className="w-full h-6 bg-zinc-900 border-2 border-zinc-800 cursor-pointer hover:border-zinc-600" 
                                        onChange={(e) => {
                                             const start = e.target.value;
                                             onUpdateSlideBackground(selectedSlide.id, { type: 'gradient', value: `linear-gradient(135deg, ${start} 0%, #000000 100%)` })
                                        }}
                                     />
                                      <input type="color" className="w-full h-6 bg-zinc-900 border-2 border-zinc-800 cursor-pointer hover:border-zinc-600" 
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
                                className="w-full h-20 border-2 border-dashed border-zinc-800 hover:border-purple-600 hover:bg-zinc-900/50 flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden relative"
                            >
                                {selectedSlide.background?.type === 'image' ? (
                                    <>
                                        <div 
                                            className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-30 transition-opacity"
                                            style={{ backgroundImage: `url(${selectedSlide.background.value})` }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center z-10">
                                            <span className="text-[9px] bg-black text-white px-2 py-1 font-black uppercase border border-zinc-700">Replace Source</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 text-zinc-700 group-hover:text-purple-500 mb-1 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <span className="text-[8px] text-zinc-600 group-hover:text-zinc-400 font-black uppercase tracking-widest">Select Media</span>
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
