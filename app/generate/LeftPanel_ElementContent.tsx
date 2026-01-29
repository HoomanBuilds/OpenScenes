import React from 'react';
import { SlideElement } from './types';

interface LeftPanel_ElementContentProps {
    element: SlideElement;
    onUpdate: (changes: Partial<SlideElement>) => void;
}

export const LeftPanel_ElementContent: React.FC<LeftPanel_ElementContentProps> = ({ element, onUpdate }) => {
    
    // Helper inputs based on type
    if (element.type === 'headline' || element.type === 'subheadline' || element.type === 'text') {
        return (
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-semibold text-zinc-400 mb-2 block">Text Content</label>
                    <textarea 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 focus:border-purple-500/50 focus:outline-none resize-y min-h-[120px]"
                        value={element.content}
                        onChange={(e) => onUpdate({ content: e.target.value })}
                    />
                </div>
            </div>
        );
    }
    
    if (element.type === 'list') {
        return (
             <div className="space-y-4">
                 <div>
                    <label className="text-xs font-semibold text-zinc-400 mb-2 block">List Items (One per line)</label>
                    <textarea 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 focus:border-purple-500/50 focus:outline-none resize-y min-h-[150px]"
                        value={element.content}
                        onChange={(e) => onUpdate({ content: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                     <div>
                         <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1.5 block">Type</label>
                         <select
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-300"
                            value={element.listType || 'disc'}
                            onChange={(e) => onUpdate({ listType: e.target.value as any })}
                         >
                             <option value="disc">Bullet</option>
                             <option value="decimal">Number</option>
                         </select>
                     </div>
                     <div>
                         <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1.5 block">Spacing</label>
                         <input
                            type="number"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-300"
                            value={element.listSpacing || 10}
                            onChange={(e) => onUpdate({ listSpacing: parseInt(e.target.value) })}
                         />
                     </div>
                </div>
            </div>
        );
    }

    if (element.type === 'image') {
        return (
            <div className="space-y-4">
                 <div>
                    <label className="text-xs font-semibold text-zinc-400 mb-2 block">Image Source URL</label>
                    <input 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-zinc-300 focus:border-purple-500/50 focus:outline-none"
                        value={element.content}
                        onChange={(e) => onUpdate({ content: e.target.value })}
                    />
                </div>
            </div>
        );
    }

    if (element.type === 'chart') {
        return (
            <div className="space-y-4">
                <div>
                   <label className="text-xs font-semibold text-zinc-400 mb-2 block">Chart Type</label>
                   <div className="flex bg-zinc-900 rounded border border-zinc-800 p-1 mb-4">
                       {['bar', 'line', 'pie', 'area'].map((t) => (
                           <button
                               key={t}
                               onClick={() => onUpdate({ chartType: t as any })}
                               className={`flex-1 py-1 rounded text-xs capitalize ${element.chartType === t ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                           >
                               {t}
                           </button>
                       ))}
                   </div>
               </div>
               <div>
                    <label className="text-xs font-semibold text-zinc-400 mb-2 block">Data (Name Value1 Value2...)</label>
                    <textarea 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-300 focus:border-purple-500/50 focus:outline-none resize-y min-h-[150px]"
                        value={element.content}
                        onChange={(e) => onUpdate({ content: e.target.value })}
                        placeholder="Jan 400 240&#10;Feb 300 139&#10;Mar 200 980"
                    />
                </div>
                 <div className="pt-2 border-t border-zinc-800/50">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-2 block">Options</label>
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" checked={element.chartProps?.showLegend !== false} onChange={(e) => onUpdate({ chartProps: { ...element.chartProps, showLegend: e.target.checked } })} />
                            <span className="text-xs text-zinc-400">Show Legend</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" checked={element.chartProps?.showGrid !== false} onChange={(e) => onUpdate({ chartProps: { ...element.chartProps, showGrid: e.target.checked } })} />
                            <span className="text-xs text-zinc-400">Show Grid</span>
                        </label>
                    </div>
                </div>
            </div>
        );
    }

    if (element.type === 'icon') {
          return (
            <div className="space-y-4">
                 <div>
                    <label className="text-xs font-semibold text-zinc-400 mb-2 block">Lucide Icon Name</label>
                    <input 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-zinc-300 focus:border-purple-500/50 focus:outline-none"
                        value={element.content}
                        onChange={(e) => onUpdate({ content: e.target.value })}
                        placeholder="e.g. Star, Heart, Zap, Clock"
                    />
                    <p className="text-[10px] text-zinc-600 mt-1 italic">Type any Lucide icon name (PascalCase or kebab-case)</p>
                </div>

                <div>
                    <label className="text-xs font-semibold text-zinc-400 mb-2 block">Icon Size ({element.fontSize || 48}px)</label>
                    <div className="flex items-center space-x-3">
                        <input 
                            type="range" min="12" max="200" step="4"
                            className="flex-1 accent-purple-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                            value={element.fontSize || 48}
                            onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
                        />
                        <span className="text-xs text-zinc-400 w-8">{element.fontSize || 48}</span>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-zinc-800/50">
                    <label className="col-span-4 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Common Icons</label>
                    {['Star', 'Heart', 'Zap', 'CheckCircle', 'Info', 'AlertTriangle', 'User', 'Settings', 'Clock', 'ArrowRight', 'Home', 'Search'].map(i => (
                        <button 
                            key={i}
                            onClick={() => onUpdate({ content: i })}
                            className={`p-2 rounded border border-zinc-800 hover:border-purple-500/50 text-[10px] truncate ${element.content.toLowerCase() === i.toLowerCase() ? 'bg-purple-500/10 border-purple-500 text-white' : 'text-zinc-500'}`}
                        >
                            {i}
                        </button>
                    ))}
                </div>
            </div>
        );
    }
    
    if (element.type === 'link-preview') {
         return (
            <div className="space-y-4">
                 <div>
                    <label className="text-xs font-semibold text-zinc-400 mb-2 block">Link URL</label>
                    <input 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-zinc-300 focus:border-purple-500/50 focus:outline-none"
                        value={element.content}
                        onChange={(e) => onUpdate({ content: e.target.value })}
                    />
                </div>
            </div>
        );
    }
    
    // Default fallback
    return (
         <div className="space-y-4">
             <div>
                <label className="text-xs font-semibold text-zinc-400 mb-2 block">Content</label>
                <input 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-zinc-300 focus:border-purple-500/50 focus:outline-none"
                    value={element.content}
                    onChange={(e) => onUpdate({ content: e.target.value })}
                />
            </div>
        </div>
    );
};
