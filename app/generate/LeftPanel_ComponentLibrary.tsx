import React from 'react';
import { SlideElement } from './types';

interface LeftPanel_ComponentLibraryProps {
    onDragStart: (e: React.DragEvent, type: SlideElement['type'], preset?: string) => void;
}

export const LeftPanel_ComponentLibrary: React.FC<LeftPanel_ComponentLibraryProps> = ({ onDragStart }) => {
    const components: { type: SlideElement['type'], label: string, icon: React.ReactNode }[] = [
        { type: 'text', label: 'Text', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
        )},
        { type: 'image', label: 'Image', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        )},
        { type: 'shape', label: 'Shape', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" /></svg>
        )},
        { type: 'video', label: 'Video', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
        )},
        { type: 'link-preview', label: 'Link', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
        )},
        { type: 'chart', label: 'Chart', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        )}
    ];

    return (
        <div className="grid grid-cols-2 gap-2">
            {components.map((comp, idx) => (
                <div 
                    key={`${comp.type}-${comp.label}-${idx}`}
                    draggable
                    onDragStart={(e) => onDragStart(e, comp.type, comp.label)}
                    className="p-3 bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 rounded-lg flex items-center space-x-3 cursor-grab active:cursor-grabbing hover:bg-zinc-800/80 transition-colors"
                >
                    <div className="text-zinc-400">{comp.icon}</div>
                    <span className="text-sm text-zinc-300">{comp.label}</span>
                </div>
            ))}
        </div>
    );
};
