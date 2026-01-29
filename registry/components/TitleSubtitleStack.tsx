import React from 'react';
import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { SlidePlan } from '../schema';
import { cn } from '../../lib/utils';

export const TitleSubtitleStack: React.FC<{ slide: SlidePlan }> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { content, style, motion } = slide;
  
  const up = interpolate(
    frame,
    [0, motion.enterDuration],
    [100, 0],
    { extrapolateRight: 'clamp', easing: (t) => t * (2 - t) } // simple ease out
  );

  const opacity = interpolate(
    frame,
    [0, motion.enterDuration],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div className="flex flex-col justify-end w-full h-full p-24 pb-48 text-left"
         style={{
             backgroundColor: style?.backgroundColor || 'transparent',
             fontFamily: style?.fontFamily || 'Inter, sans-serif'
         }}
    >
       <div className="overflow-hidden">
         <h1 
           className="text-9xl font-black uppercase leading-none tracking-tighter"
           style={{ 
             transform: `translateY(${up}px)`, 
             opacity,
             color: style?.primaryColor || '#fff',
             fontSize: content.extras?.fontSize || undefined
           }}
         >
           {content.title}
         </h1>
       </div>
       <div className="h-4 w-32 mt-8 mb-8 bg-blue-500 rounded-full" 
            style={{ 
                width: interpolate(frame, [10, 30], [0, 200], { extrapolateRight: 'clamp' }),
                backgroundColor: style?.secondaryColor || '#3b82f6' 
            }} 
       />
       <p 
         className="text-5xl font-medium max-w-4xl leading-snug"
         style={{ 
             opacity: interpolate(frame, [15, 40], [0, 1], { extrapolateRight: 'clamp' }),
             color: style?.secondaryColor || '#cbd5e1',
             fontSize: content.extras?.subtitleSize || undefined
         }}
       >
         {content.subtitle}
       </p>
    </div>
  );
};
