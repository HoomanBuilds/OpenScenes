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
        <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1.5 block">Type</label>
                    <select 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-300 focus:border-purple-500/50 focus:outline-none"
                        value={element.animation?.type || 'none'}
                        onChange={(e) => handleAnimChange('type', e.target.value)}
                    >
                        {ANIMATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                {(element.animation?.type !== 'none' && element.animation?.type) && (
                    <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1.5 block">Delay ({element.animation?.delay || 0}s)</label>
                         <input 
                            type="number" min="0" max="5" step="0.1"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-300 focus:border-purple-500/50 focus:outline-none"
                            value={element.animation?.delay || 0}
                            onChange={(e) => handleAnimChange('delay', parseFloat(e.target.value))}
                        />
                    </div>
                )}
            </div>

            {(element.animation?.type !== 'none' && element.animation?.type) && (
                 <div className="grid grid-cols-2 gap-4 pt-2">
                    {['slide', 'scale'].includes(element.animation?.type || '') && (
                        <div>
                            <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1.5 block">Direction</label>
                            <select 
                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-300 focus:border-purple-500/50 focus:outline-none"
                                value={element.animation?.direction || 'up'}
                                onChange={(e) => handleAnimChange('direction', e.target.value)}
                            >
                                {ANIMATION_DIRS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    )}
                    <div className={['slide', 'scale'].includes(element.animation?.type || '') ? '' : 'col-span-2'}>
                        <div className="flex justify-between mb-1">
                            <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Duration</label>
                            <span className="text-[10px] text-zinc-400">{element.animation?.duration || 1}s</span>
                        </div>
                        <input 
                            type="range" min="0.1" max="5" step="0.1"
                            value={element.animation?.duration || 1}
                            onChange={(e) => handleAnimChange('duration', parseFloat(e.target.value))}
                            className="w-full accent-purple-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
