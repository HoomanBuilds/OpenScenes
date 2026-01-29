import React, { useState } from 'react';
import { SlideElement } from './types';
import { AnimatePresence, motion } from 'framer-motion';
import { LeftPanel_ElementContent } from './LeftPanel_ElementContent';
import { LeftPanel_ElementStyle } from './LeftPanel_ElementStyle';
import { LeftPanel_ElementAnimation } from './LeftPanel_ElementAnimation';

interface LeftPanel_ElementEditorProps {
    element: SlideElement;
    onUpdate: (changes: Partial<SlideElement>) => void;
    onRemove: () => void;
}

export const LeftPanel_ElementEditor: React.FC<LeftPanel_ElementEditorProps> = ({ element, onUpdate, onRemove }) => {
    const [activeTab, setActiveTab] = useState<'content' | 'style' | 'animate'>('content');

    const TabButton = ({ id, label }: { id: typeof activeTab, label: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex-1 py-2 text-xs font-medium relative ${activeTab === id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
            {label}
            {activeTab === id && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 inset-x-0 h-0.5 bg-purple-500" />
            )}
        </button>
    );

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-zinc-900">
                <h3 className="text-xs font-black text-zinc-200 flex items-center gap-2 uppercase tracking-wide">
                    <span className="text-zinc-500">Edit</span>
                    <span className="text-white px-1.5 py-0.5 bg-purple-600/20 border border-purple-600/50 rounded-sm">
                        {element.type}
                    </span>
                </h3>
                <button 
                    onClick={onRemove} 
                    className="text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-red-500 flex items-center gap-1.5 group transition-colors"
                >
                    <svg className="w-3 h-3 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Kill Process
                </button>
            </div>

            <div className="flex border-2 border-zinc-900 mb-6 bg-zinc-950">
                <TabButton id="content" label="DATA" />
                <TabButton id="style" label="VISUAL" />
                <TabButton id="animate" label="MOTION" />
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
                <AnimatePresence mode="wait">
                    {activeTab === 'content' && (
                        <motion.div key="content" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.15 }}>
                            <LeftPanel_ElementContent element={element} onUpdate={onUpdate} />
                        </motion.div>
                    )}
                    {activeTab === 'style' && (
                        <motion.div key="style" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.15 }}>
                            <LeftPanel_ElementStyle element={element} onUpdate={onUpdate} />
                        </motion.div>
                    )}
                    {activeTab === 'animate' && (
                        <motion.div key="animate" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.15 }}>
                            <LeftPanel_ElementAnimation element={element} onUpdate={onUpdate} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            <div className="mt-4 pt-4 border-t-2 border-zinc-900 space-y-4">
                 <div className="flex items-center space-x-2">
                     <div className="h-px bg-zinc-800 flex-1"></div>
                     <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Transform Metrics</span>
                     <div className="h-px bg-zinc-800 flex-1"></div>
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <div className="group">
                        <label className="text-[8px] text-zinc-600 uppercase tracking-widest font-bold mb-1 block group-hover:text-purple-500 transition-colors">Pos X</label>
                        <input type="number" className="w-full bg-zinc-950 border-2 border-zinc-900 focus:border-purple-600 rounded-none p-1.5 text-xs font-mono text-zinc-300 focus:outline-none transition-colors" 
                            value={element.x} onChange={(e) => onUpdate({ x: parseInt(e.target.value) })} />
                    </div>
                     <div className="group">
                        <label className="text-[8px] text-zinc-600 uppercase tracking-widest font-bold mb-1 block group-hover:text-purple-500 transition-colors">Pos Y</label>
                        <input type="number" className="w-full bg-zinc-950 border-2 border-zinc-900 focus:border-purple-600 rounded-none p-1.5 text-xs font-mono text-zinc-300 focus:outline-none transition-colors" 
                            value={element.y} onChange={(e) => onUpdate({ y: parseInt(e.target.value) })} />
                    </div>
                     {!(element.type === 'icon' || element.type === 'text' || element.type === 'headline' || element.type === 'subheadline' || element.type === 'list') && (
                         <>
                            <div className="group">
                                <label className="text-[8px] text-zinc-600 uppercase tracking-widest font-bold mb-1 block group-hover:text-purple-500 transition-colors">Width</label>
                                <input type="number" className="w-full bg-zinc-950 border-2 border-zinc-900 focus:border-purple-600 rounded-none p-1.5 text-xs font-mono text-zinc-300 focus:outline-none transition-colors" 
                                    value={element.width || ''} onChange={(e) => onUpdate({ width: parseInt(e.target.value) })} />
                            </div>
                            <div className="group">
                                <label className="text-[8px] text-zinc-600 uppercase tracking-widest font-bold mb-1 block group-hover:text-purple-500 transition-colors">Height</label>
                                <input type="number" className="w-full bg-zinc-950 border-2 border-zinc-900 focus:border-purple-600 rounded-none p-1.5 text-xs font-mono text-zinc-300 focus:outline-none transition-colors" 
                                    value={element.height || ''} onChange={(e) => onUpdate({ height: parseInt(e.target.value) })} />
                            </div>
                         </>
                     )}
                     {(element.type === 'icon' || element.type === 'text' || element.type === 'headline' || element.type === 'subheadline' || element.type === 'list') && (
                        <div className="group">
                            <label className="text-[8px] text-zinc-600 uppercase tracking-widest font-bold mb-1 block group-hover:text-purple-500 transition-colors">Width</label>
                            <input type="number" className="w-full bg-zinc-950 border-2 border-zinc-900 focus:border-purple-600 rounded-none p-1.5 text-xs font-mono text-zinc-300 focus:outline-none transition-colors" 
                                value={element.width || ''} onChange={(e) => onUpdate({ width: parseInt(e.target.value) })} />
                        </div>
                     )}

                     <div className="group">
                        <label className="text-[8px] text-zinc-600 uppercase tracking-widest font-bold mb-1 block group-hover:text-purple-500 transition-colors">Rotation</label>
                        <input type="number" className="w-full bg-zinc-950 border-2 border-zinc-900 focus:border-purple-600 rounded-none p-1.5 text-xs font-mono text-zinc-300 focus:outline-none transition-colors" 
                            value={element.rotation || 0} onChange={(e) => onUpdate({ rotation: parseInt(e.target.value) })} />
                    </div>
                     <div className="group">
                        <label className="text-[8px] text-zinc-600 uppercase tracking-widest font-bold mb-1 block group-hover:text-purple-500 transition-colors">Z-Index</label>
                        <input type="number" className="w-full bg-zinc-950 border-2 border-zinc-900 focus:border-purple-600 rounded-none p-1.5 text-xs font-mono text-zinc-300 focus:outline-none transition-colors" 
                            value={element.zIndex || 1} onChange={(e) => onUpdate({ zIndex: parseInt(e.target.value) })} />
                    </div>
                 </div>
            </div>
        </div>
    );
};
