import React from 'react';
import { registerRoot, Composition } from 'remotion';
import * as GeneratedSlides from '../app/draft2/generated/index';
import './style.css'; // Ensure Tailwind is loaded

const Draft2Root: React.FC = () => {
    return (
        <>
            {Object.entries(GeneratedSlides).map(([name, Component]) => {
                return (
                    <Composition
                        key={name}
                        // Remotion IDs cannot contain underscores, so we convert them to dashes
                        id={name.replace(/_/g, '-')}
                        component={Component as React.FC}
                        durationInFrames={150}
                        fps={30}
                        width={1920}
                        height={1080}
                    />
                );
            })}
        </>
    );
}

registerRoot(Draft2Root);
