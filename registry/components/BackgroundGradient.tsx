import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { SlidePlan } from '../schema';

export const BackgroundGradient: React.FC<{ slide: SlidePlan }> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { style } = slide;
  
  const shift = interpolate(frame, [0, 300], [0, 100]);

  return (
    <div 
        className="absolute inset-0 w-full h-full z-[-1]"
        style={{
            background: `linear-gradient(45deg, ${style?.backgroundColor || '#111'}, ${style?.secondaryColor || '#222'})`,
            backgroundSize: '200% 200%',
            backgroundPosition: `${shift}% 50%`
        }}
    >
        {/* Generative mesh or noise could go here */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
    </div>
  );
};
