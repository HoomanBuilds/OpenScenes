import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { ExecutionPlan } from '../registry/schema';
import { getComponent } from '../registry/registry';

export const VideoRenderer: React.FC<{ plan: ExecutionPlan }> = ({ plan }) => {
  const { fps } = useVideoConfig();
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
            layout="none"
          >
             <div style={{ 
                 width: 1000, 
                 height: 563,
                 position: 'absolute',
                 top: 0,
                 left: 0,
                 transform: `scale(${useVideoConfig().width / 1000})`, 
                 transformOrigin: 'top left',
                 overflow: 'hidden'
             }}>
                <Component slide={slide} />
             </div>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};