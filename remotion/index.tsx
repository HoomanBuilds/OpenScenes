import './style.css';
import { registerRoot } from 'remotion';
import { Composition } from 'remotion';
import { SlideComposition } from './SlideRenderer';
import React from 'react';
import './fonts';

const DEFAULT_TEMPLATE = {
    name: 'Empty',
    slides: []
};

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="SlideVideo"
                component={SlideComposition as unknown as React.FC<Record<string, unknown>>}
                durationInFrames={150}
                fps={30}
                width={1000}
                height={563}
                defaultProps={{
                    templateData: DEFAULT_TEMPLATE,
                }}
                calculateMetadata={async ({ props, defaultProps }) => {
                   const data = (props.templateData || defaultProps.templateData) as any;
                   if (!data || !data.slides) return { durationInFrames: 150 };
                   
                   const durationMs = data.slides.reduce((acc: number, slide: any) => acc + (slide.duration || 5000), 0);
                   const fps = 30;
                   const durationInFrames = Math.max(1, Math.ceil((durationMs / 1000) * fps));
                   
                   return {
                       durationInFrames,
                       props: data !== props.templateData ? { ...props, templateData: data } : props
                   };
                }}
            />
        </>
    );
}

registerRoot(RemotionRoot);
