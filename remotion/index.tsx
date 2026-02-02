import { registerRoot } from 'remotion';
import { Composition } from 'remotion';
import { VideoRenderer } from './VideoRenderer';
import { SlideComposition, SlideCompositionProps } from './SlideRenderer';
import { ExecutionPlan } from '@/registry/schema';
import React from 'react';
import './style.css';
import './fonts';

const DEFAULT_PLAN: ExecutionPlan = {
    video: {
            totalDurationFrames: 150,
            theme: 'dark' as const,
            fps: 30,
            width: 1920,
            height: 1080
    },
    slides: []
};

const DEFAULT_TEMPLATE = {
    name: 'Empty',
    slides: []
};

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="Main"
                component={VideoRenderer}
                durationInFrames={150}
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{
                    plan: DEFAULT_PLAN
                }}
            />
            
            <Composition
                id="SlideVideo"
                component={SlideComposition as unknown as React.FC<Record<string, unknown>>}
                durationInFrames={150}
                fps={30}
                width={1000}
                height={563}
                defaultProps={{
                    templateData: DEFAULT_TEMPLATE
                }}
            />
        </>
    );
}

registerRoot(RemotionRoot);
