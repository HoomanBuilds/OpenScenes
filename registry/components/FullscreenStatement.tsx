import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { SlidePlan } from '../schema';

export const FullscreenStatement: React.FC<{ slide: SlidePlan }> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { content, style } = slide;
  
  const scale = interpolate(frame, [0, 100], [1, 1.2]);
  
  // "Statement" style: Big, centered, word breakdown if possible, but let's do simple big text block
  return (
    <div className="flex items-center justify-center w-full h-full bg-black p-10">
      <h1 
        className="text-[140px] leading-[0.9] font-bold text-center text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500"
        style={{ 
          transform: `scale(${scale})`,
          backgroundImage: `linear-gradient(135deg, ${style?.primaryColor || 'white'} 0%, ${style?.secondaryColor || 'gray'} 100%)`
        }}
      >
        {content.title}
      </h1>
      {content.highlightText && (
          <div className="absolute bottom-20 text-4xl text-white tracking-widest uppercase opacity-50">
              {content.highlightText}
          </div>
      )}
    </div>
  );
};
