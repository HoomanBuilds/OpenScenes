import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { ExecutionPlan } from '../registry/schema';
import { getComponent } from '../registry/registry';

// The Compiler Component
// Takes data, outputs pixels.
export const VideoRenderer: React.FC<{ plan: ExecutionPlan }> = ({ plan }) => {
  const { fps } = useVideoConfig(); // Should match plan.video.fps if enforced, or we adapt.
  
  // We assume the player is set to plan.video.totalDurationFrames or similar.
  // We iterate through slides.
  
  let currentFrameOffset = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: plan.video.theme === 'dark' ? 'black' : 'white' }}>
      {plan.slides.map((slide, index) => {
        const Component = getComponent(slide.componentId);
        const duration = slide.timing.durationInFrames;
        const from = currentFrameOffset;
        currentFrameOffset += duration;

        return (
          <Sequence 
            key={slide.id} 
            from={from} 
            durationInFrames={duration}
            layout="none" // we control layout in component
          >
             {/* 
                 Security/Safety: The Component is strictly looked up from registry.
                 Props are strictly typed from schema.
             */}
             <Component slide={slide} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
