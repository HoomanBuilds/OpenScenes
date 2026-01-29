import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { SlidePlan } from '../schema';
import { cn } from '../../lib/utils';

export const TitleCenterFade: React.FC<{ slide: SlidePlan }> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig(); // use context if needed, but slide has timing
  
  const { motion, content, style } = slide;
  const { enterDuration, exitDuration, holdDuration } = motion;
  
  // Timings
  // 0 -> enter -> hold -> exit
  // actually slide.timing.durationInFrames is total.
  // motion props are "hints" or explicit. 
  // Let's assume the component manages its own internal timeline 0..duration based on these hints.
  
  const opacity = interpolate(
    frame,
    [0, enterDuration, enterDuration + holdDuration, enterDuration + holdDuration + exitDuration],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const scale = interpolate(
    frame,
    [0, enterDuration + holdDuration + exitDuration],
    [0.9, 1.05], // slow zoom
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div 
      className={cn("flex flex-col items-center justify-center w-full h-full p-20 text-center")}
      style={{
        fontFamily: style?.fontFamily || 'Inter, sans-serif',
        color: style?.primaryColor || 'white',
        backgroundColor: style?.backgroundColor || 'transparent' // Allow bg override if passed
      }}
    >
      <h1 
        style={{ 
            opacity, 
            transform: `scale(${scale})`,
            fontSize: content.extras?.fontSize || undefined, // Allow override
            // If valid fontSize provided, it overrules class. If undefined, class applies (if loaded)
        }}
        className="text-8xl font-bold tracking-tight drop-shadow-lg"
      >
        {content.title}
      </h1>
      {content.subtitle && (
         <p 
           style={{ 
               opacity: interpolate(frame, [enterDuration/2, enterDuration], [0, 1], { extrapolateRight: 'clamp' }),
               fontSize: content.extras?.subtitleSize || undefined
           }}
           className="mt-6 text-4xl font-light opacity-80"
         >
           {content.subtitle}
         </p>
      )}
    </div>
  );
};
