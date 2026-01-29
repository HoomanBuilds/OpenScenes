import React from 'react';
import { SlideElement, AnimationType, AnimationDirection } from './types';

interface LeftPanel_ElementAnimationProps {
    element: SlideElement;
    onUpdate: (changes: Partial<SlideElement>) => void;
}

const ANIMATION_TYPES: AnimationType[] = ['none', 'fade', 'slide', 'pop', 'scale'];
const ANIMATION_DIRS: AnimationDirection[] = ['up', 'down', 'left', 'right'];

export const LeftPanel_ElementAnimation: React.FC<LeftPanel_ElementAnimationProps> = ({ element, onUpdate }) => {
    const handleAnimChange = (key: string, val: any) => {
        onUpdate({
            animation: {
                ...element.animation,
                type: element.animation?.type || 'none',
                duration: element.animation?.duration || 1,
                delay: element.animation?.delay || 0,
                [key]: val
            }
        });
    };

    return (
        <div className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-1.5 block">Effect Type</label>
                    <select 
                        className="w-full bg-zinc-950 border-2 border-zinc-900 rounded-none p-2 text-xs font-mono text-zinc-300 focus:border-purple-600 focus:outline-none uppercase appearance-none"
                        value={element.animation?.type || 'none'}
                        onChange={(e) => handleAnimChange('type', e.target.value)}
                    >
                        {ANIMATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                {(element.animation?.type !== 'none' && element.animation?.type) && (
                    <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-1.5 block">Start Delay ({element.animation?.delay || 0}s)</label>
                         <input 
                            type="number" min="0" max="5" step="0.1"
                            className="w-full bg-zinc-950 border-2 border-zinc-900 rounded-none p-2 text-xs font-mono text-zinc-300 focus:border-purple-600 focus:outline-none"
                            value={element.animation?.delay || 0}
                            onChange={(e) => handleAnimChange('delay', parseFloat(e.target.value))}
                        />
                    </div>
                )}
            </div>

            {(element.animation?.type !== 'none' && element.animation?.type) && (
                 <div className="pt-4 border-t-2 border-zinc-900/50 space-y-4">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-black flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-sm"></div>
                        Motion Parameters
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        {['slide', 'scale'].includes(element.animation?.type || '') && (
                            <div>
                                <label className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold mb-1 block">Vector</label>
                                <select 
                                    className="w-full bg-zinc-950 border-2 border-zinc-900 rounded-none p-2 text-xs font-mono text-zinc-300 focus:border-purple-600 focus:outline-none uppercase appearance-none"
                                    value={element.animation?.direction || 'up'}
                                    onChange={(e) => handleAnimChange('direction', e.target.value)}
                                >
                                    {ANIMATION_DIRS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        )}
                        <div className={['slide', 'scale'].includes(element.animation?.type || '') ? '' : 'col-span-2'}>
                            <div className="flex justify-between mb-1">
                                <label className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold">Duration</label>
                                <span className="text-[9px] font-mono text-zinc-400 bg-zinc-950 px-1 border border-zinc-900">{element.animation?.duration || 1}s</span>
                            </div>
                            <input 
                                type="range" min="0.1" max="5" step="0.1"
                                value={element.animation?.duration || 1}
                                onChange={(e) => handleAnimChange('duration', parseFloat(e.target.value))}
                                className="w-full accent-purple-600 h-1 bg-zinc-800 rounded-none appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
