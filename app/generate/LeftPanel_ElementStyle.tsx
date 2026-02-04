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
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-black flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-sm"></div>
                    Visual Attributes
                </label>
                <div className="grid grid-cols-2 gap-3">
                     {element.type !== 'image' && element.type !== 'chart' && (
                        <div>
                            <label className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold mb-1 block">Fill Hex</label>
                            <div className="flex items-center space-x-2 bg-zinc-950 border-2 border-zinc-900 focus-within:border-purple-600 transition-colors p-1">
                                <input 
                                    type="color" 
                                    className="w-6 h-6 bg-transparent border-none cursor-pointer"
                                    value={element.color || '#ffffff'}
                                    onChange={(e) => onUpdate({ color: e.target.value })}
                                />
                                <input 
                                    type="text" 
                                    className="w-full bg-transparent text-[10px] font-mono text-zinc-300 focus:outline-none uppercase" 
                                    value={element.color || '#ffffff'}
                                    onChange={(e) => onUpdate({ color: e.target.value })}
                                />
                            </div>
                        </div>
                     )}
                     {element.type === 'image' && (
                         <div>
                            <label className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold mb-1 block">Sort Fit</label>
                            <select 
                                className="w-full bg-zinc-950 border-2 border-zinc-900 rounded-none p-1.5 text-xs font-mono text-zinc-300 focus:border-purple-600 focus:outline-none transition-colors appearance-none"
                                value={element.objectFit || 'cover'}
                                onChange={(e) => onUpdate({ objectFit: e.target.value as any })}
                            >
                                <option value="cover">COVER</option>
                                <option value="contain">CONTAIN</option>
                                <option value="fill">FILL</option>
                                <option value="none">ORIGINAL</option>
                                <option value="scale-down">SCALE DOWN</option>
                            </select>
                         </div>
                     )}
                    <div>
                         <label className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold mb-1 block">Alpha Channel</label>
                         <div className="flex items-center space-x-2 h-[34px] border-2 border-zinc-900 bg-zinc-950 px-2">
                             <input 
                                type="range" min="0" max="1" step="0.1"
                                value={element.opacity ?? 1}
                                onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) })}
                                className="flex-1 accent-purple-600 h-1 bg-zinc-800 rounded-none appearance-none cursor-pointer"
                             />
                             <span className="text-[9px] font-mono text-zinc-400 w-8 text-right bg-zinc-900 px-1 py-0.5">{Math.round((element.opacity ?? 1) * 100)}%</span>
                         </div>
                    </div>
                </div>
            </div>

            {['headline', 'subheadline', 'text', 'list', 'paragraph', 'shape'].includes(element.type) && (
                 <div className="space-y-4 pt-4 border-t-2 border-zinc-900/50">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-black flex items-center gap-2">
                        <div className="w-2 h-2 bg-zinc-600 rounded-sm"></div>
                        Typesetting
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {element.type === 'shape' && (
                            <div>
                                <label className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold mb-1 block">Ink Color</label>
                                <div className="flex items-center space-x-2 bg-zinc-950 border-2 border-zinc-900 p-1">
                                    <input 
                                        type="color" 
                                        className="w-5 h-5 bg-transparent border-none cursor-pointer"
                                        value={element.textColor || '#ffffff'}
                                        onChange={(e) => onUpdate({ textColor: e.target.value })}
                                    />
                                    <span className="text-[9px] text-zinc-400 font-mono uppercase">{element.textColor || '#fff'}</span>
                                </div>
                            </div>
                        )}
                        <div>
                             <label className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold mb-1 block">Size (px)</label>
                             <input 
                                type="number"
                                className="w-full bg-zinc-950 border-2 border-zinc-900 rounded-none p-1.5 text-xs font-mono text-zinc-300 focus:border-purple-600 focus:outline-none"
                                value={element.fontSize || 16}
                                onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
                             />
                        </div>
                        <div>
                             <label className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold mb-1 block">Weight</label>
                             <select 
                                className="w-full bg-zinc-950 border-2 border-zinc-900 rounded-none p-1.5 text-xs font-mono text-zinc-300 focus:border-purple-600 focus:outline-none"
                                value={element.fontWeight || 'normal'}
                                onChange={(e) => onUpdate({ fontWeight: e.target.value })}
                             >
                                 <option value="400">NORMAL</option>
                                 <option value="500">MEDIUM</option>
                                 <option value="700">BOLD</option>
                                 <option value="900">HEAVY</option>
                             </select>
                        </div>
                        <div>
                            <label className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold mb-1 block">Line Spacing</label>
                            <div className="flex items-center space-x-2 border-2 border-zinc-900 bg-zinc-950 px-2 h-[34px]">
                                <input 
                                    type="range" min="0.8" max="2.5" step="0.1"
                                    value={element.lineHeight || 1.5}
                                    onChange={(e) => onUpdate({ lineHeight: parseFloat(e.target.value) })}
                                    className="flex-1 accent-purple-600 h-1 bg-zinc-800 rounded-none appearance-none cursor-pointer"
                                />
                                <span className="text-[9px] font-mono text-zinc-400 w-6 text-right">{element.lineHeight || 1.5}</span>
                            </div>
                        </div>
                        <div className="col-span-2">
                             <label className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold mb-1 block">Family</label>
                             <select 
                                className="w-full bg-zinc-950 border-2 border-zinc-900 rounded-none p-1.5 text-xs font-mono text-zinc-300 focus:border-purple-600 focus:outline-none"
                                value={element.fontFamily || 'Inter'}
                                onChange={(e) => onUpdate({ fontFamily: e.target.value })}
                             >
                                 <option value="Inter">Inter UI</option>
                                 <option value="Roboto">Roboto</option>
                                 <option value="Roboto Mono">Roboto Mono</option>
                                 <option value="Merriweather">Merriweather Serif</option>
                                 <option value="Oswald">Oswald Condensed</option>
                                 <option value="Playfair Display">Playfair Display</option>
                                 <option value="Bebas Neue">Bebas Neue</option>
                                 <option value="Lora">Lora Serif</option>
                                 <option value="Montserrat">Montserrat</option>
                                 <option value="Lato">Lato</option>
                                 <option value="Open Sans">Open Sans</option>
                                 <option value="Poppins">Poppins</option>
                                 <option value="VT323">VT323</option>
                             </select>
                        </div>
                         <div className="col-span-2 space-y-2">
                             <label className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold block">Alignment</label>
                             <div className="flex bg-zinc-950 border-2 border-zinc-900">
                                 {['left', 'center', 'right'].map((align) => (
                                     <button
                                        key={align}
                                        onClick={() => onUpdate({ textAlign: align as any })}
                                        className={`flex-1 py-1 text-[8px] font-black uppercase tracking-widest transition-colors ${element.textAlign === align ? 'bg-zinc-100 text-black' : 'text-zinc-600 hover:text-white hover:bg-zinc-900'}`}
                                     >
                                         {align}
                                     </button>
                                 ))}
                             </div>
                             <div className="flex bg-zinc-950 border-2 border-zinc-900 mt-1">
                                 {['top', 'center', 'bottom'].map((vAlign) => (
                                     <button
                                        key={vAlign}
                                        onClick={() => onUpdate({ verticalAlign: vAlign as any })}
                                        className={`flex-1 py-1 text-[8px] font-black uppercase tracking-widest transition-colors ${element.verticalAlign === vAlign ? 'bg-zinc-100 text-black' : 'text-zinc-600 hover:text-white hover:bg-zinc-900'}`}
                                     >
                                         {vAlign}
                                     </button>
                                 ))}
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {(element.type === 'shape' || element.type === 'image' || element.type === 'link-preview') && (
                <div className="space-y-4 pt-4 border-t-2 border-zinc-900/50">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-black flex items-center gap-2">
                        <div className="w-2 h-2 bg-zinc-600 rounded-sm"></div>
                        Border Logic
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold mb-1 block">Width (px)</label>
                            <div className="flex items-center space-x-2 border-2 border-zinc-900 bg-zinc-950 px-2 h-[34px]">
                                <input 
                                    type="range" min="0" max="20" step="1"
                                    value={element.strokeWidth || 0}
                                    onChange={(e) => onUpdate({ strokeWidth: parseInt(e.target.value) })}
                                    className="flex-1 accent-purple-600 h-1 bg-zinc-800 rounded-none appearance-none cursor-pointer"
                                />
                                <span className="text-[9px] font-mono text-zinc-400 w-6 text-right">{element.strokeWidth || 0}</span>
                            </div>
                        </div>
                         <div>
                            <label className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold mb-1 block">Paint</label>
                            <div className="flex items-center space-x-2 bg-zinc-950 border-2 border-zinc-900 p-1 h-[34px]">
                                <input 
                                    type="color" 
                                    className="w-4 h-4 rounded-none bg-transparent border-none cursor-pointer"
                                    value={element.strokeColor || '#ffffff'}
                                    onChange={(e) => onUpdate({ strokeColor: e.target.value })}
                                />
                                <span className="text-[9px] text-zinc-400 font-mono uppercase">{element.strokeColor || '#fff'}</span>
                            </div>
                        </div>
                         {element.type !== 'image' && (
                             <div className="col-span-2">
                                <label className="flex items-center space-x-2 cursor-pointer group p-2 border border-dashed border-zinc-800 hover:border-purple-600 transition-colors bg-zinc-950/50">
                                    <input 
                                        type="checkbox"
                                        checked={element.color === 'transparent'}
                                        className="rounded border-zinc-700 bg-zinc-900 accent-purple-600"
                                    />
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300">Enable Hollow Mode</span>
                                </label>
                            </div>
                         )}
                        <div className="col-span-2">
                            <label className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold mb-1 block">Corner Radius</label>
                            <div className="flex items-center space-x-2 border-2 border-zinc-900 bg-zinc-950 px-2 h-[34px]">
                                <input 
                                type="range" min="0" max="100" step="1"
                                value={element.borderRadius || 0}
                                onChange={(e) => onUpdate({ borderRadius: parseInt(e.target.value) })}
                                className="flex-1 accent-purple-600 h-1 bg-zinc-800 rounded-none appearance-none cursor-pointer"
                                />
                                <span className="text-[9px] font-mono text-zinc-400 w-8 text-right">{element.borderRadius || 0}{element.type === 'shape' ? '%' : 'px'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {element.type === 'chart' && (
                <div className="space-y-4 pt-4 border-t-2 border-zinc-900/50">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-black flex items-center gap-2">
                        <div className="w-2 h-2 bg-zinc-600 rounded-sm"></div>
                        Chart Config
                    </label>
                    <div className="flex items-center justify-between p-3 bg-zinc-950 border-2 border-zinc-900">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-zinc-300">Transparent Base</span>
                            <span className="text-[8px] text-zinc-600 tracking-wide">REMOVE CONTAINER FILL</span>
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
                            <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none peer-checked:bg-purple-600 rounded-none border border-zinc-700"></div>
                            <div className="absolute left-[2px] top-[2px] bg-white w-4 h-4 transition-transform peer-checked:translate-x-full rounded-none"></div>
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
};
