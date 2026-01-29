
export type AnimationType = 'none' | 'fade' | 'slide' | 'pop' | 'scale';
export type AnimationDirection = 'up' | 'down' | 'left' | 'right';

export type SlideBackground = {
    type: 'color' | 'image' | 'gradient';
    value: string;
    props?: {
        size?: 'cover' | 'contain' | 'auto';
        repeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
        position?: string;
    };
};

export type ElementAnimation = {
    type: AnimationType;
    duration: number; // seconds
    delay: number; // seconds
    direction?: AnimationDirection;
};

export type SlideElement = {
    id: string;
    type: 'headline' | 'subheadline' | 'text' | 'image' | 'video' | 'chart' | 'shape' | 'link-preview';
    content: string;
    textFormat?: 'normal' | 'markdown';
    x: number;
    y: number;
    width?: number; 
    height?: number;
    color?: string;
    textColor?: string;
    rotation?: number; 
    opacity?: number; 
    zIndex?: number;
    fontSize?: number; 
    fontWeight?: string; 
    textAlign?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'center' | 'bottom';
    fontFamily?: string; 
    lineHeight?: number; 
    borderRadius?: number; 
    strokeWidth?: number;
    strokeColor?: string;
    chartType?: 'bar' | 'line' | 'pie' | 'area';
    chartProps?: {
        showGrid?: boolean;
        showLegend?: boolean;
        showXAxis?: boolean;
        showYAxis?: boolean;
        colors?: string[];
        transparent?: boolean;
    };
    animation?: ElementAnimation;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
};

export type Slide = {
    id: string;
    type: string;
    props: Record<string, any>;
    duration: number; // in frames
    elements?: SlideElement[]; // Interactive elements
    background?: SlideBackground;
    transition?: {
        type: 'none' | 'fade' | 'slide' | 'wipe';
        duration?: number; // seconds
    };
};

export type Asset = {
    id: string;
    type: 'image' | 'audio';
    url: string;
    name: string;
};

export type ViewMode = 'sequence' | 'focus';
export type GenerationStatus = 'idle' | 'generating' | 'done';
