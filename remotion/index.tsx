import { registerRoot } from 'remotion';
import { Composition } from 'remotion';
import { VideoRenderer } from './VideoRenderer';
import { ExecutionPlan } from '@/registry/schema';
import React from 'react';
import './style.css';

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

export const RemotionRoot: React.FC = () => {
    return (
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
    );
}

registerRoot(RemotionRoot);
