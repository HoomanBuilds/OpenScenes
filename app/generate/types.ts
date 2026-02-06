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
    duration: number;
    delay: number;
    direction?: AnimationDirection;
};

export type SlideElement = {
    id: string;
    type: 'headline' | 'subheadline' | 'text' | 'image' | 'video' | 'chart' | 'shape' | 'link-preview' | 'list' | 'icon' | 'custom';
    content: string | Record<string, any>;
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
    listType?: 'disc' | 'decimal';
    listSpacing?: number;
    animation?: ElementAnimation;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
    timeline?: any[];
};

export type Slide = {
    id: string;
    type: string;
    props: Record<string, any>;
    duration: number;
    elements?: SlideElement[];
    background?: SlideBackground;
    transition?: {
        type: 'none' | 'fade' | 'slide' | 'wipe';
        duration?: number;
    };
};

export type Asset = {
    id: string;
    type: 'image' | 'audio' | 'video';
    url: string;
    name: string;
};

export type ContextFile = {
    id: string;
    name: string;
    type: string;
    content: string;
};

export type RawFile = {
    id: string;
    fileName: string;
    fileType: string;
    content: string;
    charCount: number;
    isTruncated: boolean;
};

export type AIJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export type AIJobResult = {
    slides?: Slide[];
    slide?: Slide;
    elements?: SlideElement[];
    patches?: any[];
    explanation?: string;
    metadata?: {
        summary?: string;
        generatedAt?: string;
        themeName?: string;
    };
};

export type ViewMode = 'sequence' | 'focus';
export type GenerationStatus = 'idle' | 'generating' | 'done';
