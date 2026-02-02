'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { getAllThemes, Theme } from '@/app/lib/themes';

interface ThemeDropdownProps {
    value: string;
    onChange: (themeId: string) => void;
}

export function ThemeDropdown({ value, onChange }: ThemeDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const themes = getAllThemes();
    const selectedTheme = themes.find(t => t.id === value) || themes[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">
                Visual Aesthetic
            </label>
            
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-zinc-900 border-2 border-zinc-800 p-3 flex items-center justify-between text-white hover:border-zinc-700 transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <div 
                        className="w-4 h-4 rounded-full border border-white/10"
                        style={{ background: selectedTheme.preview_gradient }}
                    />
                    <span className="font-mono text-sm uppercase">{selectedTheme.name}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''} group-hover:text-zinc-300`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-[#09090b] border-2 border-zinc-800 shadow-xl z-50 max-h-60 overflow-y-auto"
                    >
                        {themes.map((theme) => (
                            <div
                                key={theme.id}
                                onClick={() => {
                                    onChange(theme.id);
                                    setIsOpen(false);
                                }}
                                className="flex items-center justify-between p-3 hover:bg-zinc-900 cursor-pointer transition-colors group border-b border-zinc-800/50 last:border-0"
                            >
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="w-3 h-3 rounded-full border border-white/10 ring-2 ring-transparent group-hover:ring-white/10 transition-all"
                                        style={{ background: theme.preview_gradient }}
                                    />
                                    <span className={`font-mono text-xs uppercase ${value === theme.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                                        {theme.name}
                                    </span>
                                </div>
                                {value === theme.id && <Check className="w-3 h-3 text-purple-500" />}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
