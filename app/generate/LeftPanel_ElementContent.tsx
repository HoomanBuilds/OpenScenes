import React from 'react';
import { SlideElement } from './types';
import * as LucideIcons from 'lucide-react';
import { LeftPanel_CustomJsonEditor } from './LeftPanel_CustomJsonEditor';

interface LeftPanel_ElementContentProps {
    element: SlideElement;
    onUpdate: (changes: Partial<SlideElement>) => void;
}

export const LeftPanel_ElementContent: React.FC<LeftPanel_ElementContentProps> = ({ element, onUpdate }) => {
    
    if (['headline', 'subheadline', 'text'].includes(element.type)) {
        return (
            <div className="space-y-4">
                {element.type === 'text' && (
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-zinc-400">Format</label>
                        <div className="flex bg-zinc-900 rounded p-1 border border-zinc-800">
                            {[
                                { id: 'normal', label: 'Plain' },
                                { id: 'markdown', label: 'Markdown' }
                            ].map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => onUpdate({ textFormat: f.id as any })}
                                    className={`px-3 py-1 rounded text-[10px] uppercase font-bold transition-all ${ (element.textFormat || 'normal') === f.id ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <div>
                    <label className="text-xs font-semibold text-zinc-400 mb-2 block">Text Content</label>
                    <textarea 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 focus:border-purple-500/50 focus:outline-none resize-y min-h-[120px]"
                        value={element.content as string}
                        onChange={(e) => onUpdate({ content: e.target.value })}
                        placeholder={element.textFormat === 'markdown' ? 'Use "- item" for bullets...' : 'Type your text here...'}
                    />
                </div>
            </div>
        );
    }
    
    if (element.type === 'image' || element.type === 'video') {
        return (
            <div className="space-y-4">
                 <div>
                    <label className="text-xs font-semibold text-zinc-400 mb-2 block">{element.type === 'video' ? 'Video' : 'Image'} Source URL</label>
                    <input 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-zinc-300 focus:border-purple-500/50 focus:outline-none"
                        value={element.content as string}
                        onChange={(e) => onUpdate({ content: e.target.value })}
                        placeholder={element.type === 'video' ? 'https://example.com/video.mp4' : 'https://example.com/image.jpg'}
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
                        value={element.content as string}
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

    if (element.type === 'link-preview') {
         return (
            <div className="space-y-4">
                 <div>
                    <label className="text-xs font-semibold text-zinc-400 mb-2 block">Resource URL</label>
                    <input 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-zinc-300 focus:border-purple-500/50 focus:outline-none"
                        value={element.content as string}
                        onChange={(e) => onUpdate({ content: e.target.value })}
                        placeholder="https://github.com/remotion-dev/remotion"
                    />
                </div>
                <div>
                   <label className="text-xs font-semibold text-zinc-400 mb-2 block">Preview Note (Optional)</label>
                   <p className="text-[10px] text-zinc-500 italic">This will update the card title in the preview.</p>
               </div>
            </div>
        );
    }
    
    if (element.type === 'shape') {
        return (
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-semibold text-zinc-400 mb-2 block">Inner Text (Optional)</label>
                    <input 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-zinc-300 focus:border-purple-500/50 focus:outline-none"
                        value={element.content as string}
                        onChange={(e) => onUpdate({ content: e.target.value })}
                        placeholder="Type text to show inside shape..."
                    />
                    <p className="text-[10px] text-zinc-600 mt-1 italic text-center">Perfect for badges or labels</p>
                </div>
            </div>
        );
    }
    
    if (element.type === 'custom') {
        const getContentString = (): string => {
             if (typeof element.content === 'object') {
                 return JSON.stringify(element.content, null, 2);
             }
             return element.content as string;
        };

        const handleChange = (val: string) => {
            onUpdate({ content: val });
        }

        return (
            <div className="h-[500px] flex flex-col">
                <div className="flex justify-between items-center mb-2">
                     <label className="text-xs font-semibold text-zinc-400 block">Component Architecture</label>
                </div>
                <div className="flex-1 overflow-hidden">
                    <LeftPanel_CustomJsonEditor 
                        value={getContentString()} 
                        onChange={handleChange} 
                    />
                </div>
            </div>
        );
    }

    return (
         <div className="space-y-4">
             <div>
                <label className="text-xs font-semibold text-zinc-400 mb-2 block">Content</label>
                <input 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-zinc-300 focus:border-purple-500/50 focus:outline-none"
                    value={element.content as string}
                    onChange={(e) => onUpdate({ content: e.target.value })}
                />
            </div>
        </div>
    );
};
