import React from 'react';
import { SlideElement } from './types';

interface LeftPanel_ElementStyleProps {
    element: SlideElement;
    onUpdate: (changes: Partial<SlideElement>) => void;
}

export const LeftPanel_ElementStyle: React.FC<LeftPanel_ElementStyleProps> = ({ element, onUpdate }) => {
    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <label className="text-xs font-semibold text-zinc-400">Appearance</label>
                <div className="grid grid-cols-2 gap-3">
                     {element.type !== 'image' && element.type !== 'chart' && (
                        <div>
                            <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1.5 block">Color</label>
                            <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 rounded p-1.5">
                                <input 
                                    type="color" 
                                    className="w-6 h-6 rounded bg-transparent border-none cursor-pointer"
                                    value={element.color || '#ffffff'}
                                    onChange={(e) => onUpdate({ color: e.target.value })}
                                />
                                <span className="text-xs text-zinc-400 font-mono">{element.color || '#ffffff'}</span>
                            </div>
                        </div>
                     )}
                     {element.type === 'image' && (
                         <div>
                            <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1.5 block">Object Fit</label>
                            <select 
                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-300 focus:border-purple-500/50 focus:outline-none"
                                value={element.objectFit || 'cover'}
                                onChange={(e) => onUpdate({ objectFit: e.target.value as any })}
                            >
                                <option value="cover">Cover</option>
                                <option value="contain">Contain</option>
                                <option value="fill">Fill</option>
                                <option value="none">Original</option>
                                <option value="scale-down">Scale Down</option>
                            </select>
                         </div>
                     )}
                    <div>
                         <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1.5 block">Opacity</label>
                         <div className="flex items-center space-x-2 h-[38px]">
                             <input 
                                type="range" min="0" max="1" step="0.1"
                                value={element.opacity ?? 1}
                                onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) })}
                                className="flex-1 accent-purple-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                             />
                             <span className="text-[10px] text-zinc-400 w-6 text-right">{Math.round((element.opacity ?? 1) * 100)}%</span>
                         </div>
                    </div>
                </div>
            </div>

            {['headline', 'subheadline', 'text', 'list', 'paragraph'].includes(element.type) && (
                 <div className="space-y-3 pt-3 border-t border-zinc-800/50">
                    <label className="text-xs font-semibold text-zinc-400">Typography</label>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                             <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1.5 block">Font Size</label>
                             <input 
                                type="number"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-300 focus:border-purple-500/50 focus:outline-none"
                                value={element.fontSize || 16}
                                onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
                             />
                        </div>
                        <div>
                             <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1.5 block">Weight</label>
                             <select 
                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-300 focus:border-purple-500/50 focus:outline-none"
                                value={element.fontWeight || 'normal'}
                                onChange={(e) => onUpdate({ fontWeight: e.target.value })}
                             >
                                 <option value="400">Normal</option>
                                 <option value="500">Medium</option>
                                 <option value="700">Bold</option>
                                 <option value="900">Black</option>
                             </select>
                        </div>
                        <div className="col-span-2">
                             <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1.5 block">Font Family</label>
                             <select 
                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-300 focus:border-purple-500/50 focus:outline-none"
                                value={element.fontFamily || 'Inter'}
                                onChange={(e) => onUpdate({ fontFamily: e.target.value })}
                             >
                                 <option value="Inter">Inter</option>
                                 <option value="Roboto">Roboto</option>
                                 <option value="Merriweather">Merriweather</option>
                                 <option value="Oswald">Oswald</option>
                                 <option value="Playfair Display">Playfair</option>
                             </select>
                        </div>
                         <div className="col-span-2">
                             <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1.5 block">Alignment</label>
                             <div className="flex bg-zinc-900 rounded border border-zinc-800 p-1">
                                 {['left', 'center', 'right'].map((align) => (
                                     <button
                                        key={align}
                                        onClick={() => onUpdate({ textAlign: align as any })}
                                        className={`flex-1 py-1 rounded text-xs capitalize ${element.textAlign === align ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                     >
                                         {align}
                                     </button>
                                 ))}
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {(element.type === 'shape' || element.type === 'image' || element.type === 'link-preview') && (
                <div className="space-y-3 pt-3 border-t border-zinc-800/50">
                    <label className="text-xs font-semibold text-zinc-400">Border & Style</label>
                    <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1.5 block">Border Width</label>
                            <div className="flex items-center space-x-2">
                                <input 
                                    type="range" min="0" max="20" step="1"
                                    value={element.strokeWidth || 0}
                                    onChange={(e) => onUpdate({ strokeWidth: parseInt(e.target.value) })}
                                    className="flex-1 accent-purple-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="text-[10px] text-zinc-400 w-6 text-right">{element.strokeWidth || 0}px</span>
                            </div>
                        </div>
                         <div>
                            <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1.5 block">Border Color</label>
                            <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 rounded p-1.5 h-[26px]">
                                <input 
                                    type="color" 
                                    className="w-4 h-4 rounded bg-transparent border-none cursor-pointer"
                                    value={element.strokeColor || '#ffffff'}
                                    onChange={(e) => onUpdate({ strokeColor: e.target.value })}
                                />
                                <span className="text-xs text-zinc-400 font-mono">{element.strokeColor || '#fff'}</span>
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1.5 block">Radius</label>
                            <div className="flex items-center space-x-2">
                                <input 
                                type="range" min="0" max="100" step="1"
                                value={element.borderRadius || 0}
                                onChange={(e) => onUpdate({ borderRadius: parseInt(e.target.value) })}
                                className="flex-1 accent-purple-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="text-[10px] text-zinc-400 w-6 text-right">{element.borderRadius || 0}</span>
                            </div>
                        </div>
                         {element.type !== 'image' && (
                             <div className="col-span-2">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input 
                                        type="checkbox"
                                        checked={element.color === 'transparent'}
                                        onChange={(e) => onUpdate({ color: e.target.checked ? 'transparent' : '#3b82f6' })} // Default blue if unchecked
                                        className="rounded border-zinc-700 bg-zinc-900"
                                    />
                                    <span className="text-xs text-zinc-400">Hollow (Transparent Fill)</span>
                                </label>
                            </div>
                         )}
                    </div>
                </div>
            )}
            {element.type === 'chart' && (
                <div className="space-y-4 pt-4 border-t border-zinc-800/50">
                    <label className="text-xs font-semibold text-zinc-400">Chart Options</label>
                    <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 shadow-inner">
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-zinc-100">Transparent Background</span>
                            <span className="text-[10px] text-zinc-500">Remove chart container styling</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={element.chartProps?.transparent === true}
                                onChange={(e) => onUpdate({ 
                                    chartProps: { ...element.chartProps, transparent: e.target.checked }
                                })}
                            />
                            <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
};
