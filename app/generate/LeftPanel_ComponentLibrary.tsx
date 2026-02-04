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
        )},
        { type: 'custom', label: 'Smart UI', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
        )}
    ];

    return (
        <div className="grid grid-cols-2 gap-3 mt-4">
            {components.map((comp, idx) => (
                <div 
                    key={`${comp.type}-${comp.label}-${idx}`}
                    draggable
                    onDragStart={(e) => onDragStart(e, comp.type, comp.label)}
                    className="group relative h-14 bg-zinc-950 border-2 border-zinc-900 hover:border-zinc-500 hover:bg-zinc-900 transition-all cursor-grab active:cursor-grabbing flex items-center px-4 space-x-3 overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-2 h-2 bg-zinc-800 group-hover:bg-purple-500 transition-colors"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-r border-t border-zinc-800"></div>

                    <div className="text-zinc-600 group-hover:text-white transition-colors">
                        {comp.icon}
                    </div>
                    
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors">Module</span>
                        <span className="text-xs font-bold text-zinc-300 group-hover:text-white uppercase tracking-tight">{comp.label}</span>
                    </div>

                    <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <svg className="w-3 h-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                    </div>
                </div>
            ))}
        </div>
    );
};
