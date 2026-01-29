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
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                    <span className="capitalize">{element.type}</span> 
                    <span className="text-zinc-600 text-[10px] bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        Editor
                    </span>
                </h3>
                <button onClick={onRemove} className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Delete
                </button>
            </div>

            <div className="flex border-b border-zinc-800 mb-4">
                <TabButton id="content" label="Content" />
                <TabButton id="style" label="Style" />
                <TabButton id="animate" label="Animation" />
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
            
            <div className="mt-4 pt-4 border-t border-zinc-800/50 space-y-3">
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1 block">X Position</label>
                        <input type="number" className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-300" 
                            value={element.x} onChange={(e) => onUpdate({ x: parseInt(e.target.value) })} />
                    </div>
                     <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1 block">Y Position</label>
                        <input type="number" className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-300" 
                            value={element.y} onChange={(e) => onUpdate({ y: parseInt(e.target.value) })} />
                    </div>
                     {!(element.type === 'icon' || element.type === 'text' || element.type === 'headline' || element.type === 'subheadline' || element.type === 'list') && (
                         <>
                            <div>
                                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1 block">Width</label>
                                <input type="number" className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-300" 
                                    value={element.width || ''} onChange={(e) => onUpdate({ width: parseInt(e.target.value) })} />
                            </div>
                            <div>
                                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1 block">Height</label>
                                <input type="number" className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-300" 
                                    value={element.height || ''} onChange={(e) => onUpdate({ height: parseInt(e.target.value) })} />
                            </div>
                         </>
                     )}
                     {(element.type === 'icon' || element.type === 'text' || element.type === 'headline' || element.type === 'subheadline' || element.type === 'list') && (
                        <div>
                            <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1 block">Width</label>
                            <input type="number" className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-300" 
                                value={element.width || ''} onChange={(e) => onUpdate({ width: parseInt(e.target.value) })} />
                        </div>
                     )}

                     <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1 block">Rotation</label>
                        <input type="number" className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-300" 
                            value={element.rotation || 0} onChange={(e) => onUpdate({ rotation: parseInt(e.target.value) })} />
                    </div>
                     <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1 block">Layer (Z)</label>
                        <input type="number" className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-300" 
                            value={element.zIndex || 1} onChange={(e) => onUpdate({ zIndex: parseInt(e.target.value) })} />
                    </div>
                 </div>
            </div>
        </div>
    );
};
