import React from 'react';

export interface CustomNode {
    id?: string;
    tag: string;
    className?: string; 
    style?: React.CSSProperties;
    text?: string;
    children?: CustomNode[];
    props?: Record<string, any>;
    
    states?: InteractionStates;
    a11y?: A11yConfig;
    events?: Record<string, any>; 
    effects?: EffectsConfig;
    typing?: { speed?: number; delay?: number };
    
    initial?: any;
    animate?: any;
    transition?: any;
}

export interface InteractionStates {
    hover?: Partial<StyleProps>;
    tap?: Partial<StyleProps>;
    focus?: Partial<StyleProps>;
    disabled?: Partial<StyleProps>;
}

export interface EffectsConfig {
    parallax?: { strength?: number }; 
    spotlight?: { 
        color?: string; 
        size?: number;
        opacity?: number; 
    };
}

export interface StyleProps {
    className?: string;
    style?: React.CSSProperties;
    opacity?: number;
    scale?: number;
    x?: number | string;
    y?: number | string;
    rotate?: number;
    backgroundColor?: string;
    color?: string;
}

export interface A11yConfig {
    role?: string;
    label?: string; // aria-label
    description?: string; // aria-description
    hidden?: boolean; // aria-hidden
    tabIndex?: number;
}

export interface DesignTokens {
    colors?: Record<string, string>;
    spacing?: Record<string, string | number>;
    radius?: Record<string, string | number>;
    shadows?: Record<string, string>;
    fonts?: Record<string, string>;
}

export interface AnimationConfig {
    initial?: any;
    animate?: any;
    transition?: any;
}

export interface TimelineStep {
    id: string;
    animate: any; 
    transition?: any;
    delay?: number; 
    wait?: boolean; 
    parallel?: boolean; 
    guide?: {
        target: string;
        zoom?: number;
        duration?: number;
        cursor?: boolean;
        camera?: boolean;
        opacity?: number;
    };
    label?: string;
    goto?: string;
    comment?: string;
}

export interface SmartCustomComponentData {
    layout: CustomNode;
    animations?: Record<string, AnimationConfig>;
    timeline?: TimelineStep[];
    tokens?: DesignTokens; // Global tokens
    loop?: boolean;
}

export interface CustomComponentRendererProps {
    content: string | Record<string, any>; 
    scale: number;
}
