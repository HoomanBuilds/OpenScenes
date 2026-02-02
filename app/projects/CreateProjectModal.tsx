'use client';

import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeDropdown } from './ThemeDropdown';

interface CreateProjectModalProps {
    onClose: () => void;
    onCreate: (name: string, description: string, themeId: string) => void;
}

export function CreateProjectModal({ onClose, onCreate }: CreateProjectModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedThemeId, setSelectedThemeId] = useState('minimal_dark');
    
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-lg bg-[#09090b] border-2 border-zinc-800 p-8 shadow-2xl relative"
            >
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-purple-500"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-purple-500"></div>

                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-white">Initialize Project</h3>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mt-1">Define sequence parameters</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-900 transition-colors">
                        <LucideIcons.X className="w-5 h-5 text-zinc-500" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Project Designation</label>
                        <input 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Q4 Financial Review"
                            className="w-full bg-zinc-900 border-2 border-zinc-800 p-3 text-white focus:border-purple-600 focus:outline-none transition-colors font-mono text-sm"
                            autoFocus
                        />
                    </div>

                    <ThemeDropdown 
                        value={selectedThemeId} 
                        onChange={setSelectedThemeId} 
                    />

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Briefing (Optional)</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Objectives and scope..."
                            className="w-full bg-zinc-900 border-2 border-zinc-800 p-3 text-white focus:border-purple-600 focus:outline-none transition-colors font-mono text-sm min-h-[100px] resize-none"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button 
                            onClick={onClose}
                            className="flex-1 py-3 text-xs font-bold uppercase tracking-widest bg-zinc-900 hover:bg-zinc-800 text-zinc-400 transition-colors"
                        >
                            Abort
                        </button>
                        <button 
                            onClick={() => onCreate(name, description, selectedThemeId)}
                            disabled={!name.trim()}
                            className="flex-1 py-3 text-xs font-bold uppercase tracking-widest bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Initialize
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
