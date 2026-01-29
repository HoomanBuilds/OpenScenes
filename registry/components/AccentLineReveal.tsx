import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { SlidePlan } from '../schema';

export const AccentLineReveal: React.FC<{ slide: SlidePlan }> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { content, style, motion } = slide;

  const width = interpolate(frame, [0, motion.enterDuration], [0, 100], { extrapolateRight: 'clamp' });
  
  return (
    <div className="flex flex-col items-start justify-center w-full h-full pl-32 relative">
        <div 
            className="h-[80%] w-2 absolute left-20 bg-white"
            style={{ 
                height: `${interpolate(frame, [0, 20], [0, 80], { extrapolateRight: 'clamp' })}%`,
                top: '10%',
                backgroundColor: style?.secondaryColor || 'white'
             }}
        />
        <h1 
            className="text-8xl font-bold mb-4"
            style={{ 
                opacity: interpolate(frame, [10, 30], [0, 1]),
                transform: `translateX(${interpolate(frame, [10, 30], [-50, 0])}px)`,
                color: style?.primaryColor || 'white'
            }}
        >
            {content.title}
        </h1>
        <h2 
             className="text-5xl font-light"
             style={{ 
                opacity: interpolate(frame, [20, 40], [0, 1]),
                color: style?.secondaryColor || '#ccc'
             }}
        >
            {content.subtitle}
        </h2>
    </div>
  );
};
