
type AnimationType = 'none' | 'fade' | 'slide' | 'pop' | 'scale';
type AnimationDirection = 'up' | 'down' | 'left' | 'right';

type SlideBackground = {
    type: 'color' | 'image' | 'gradient';
    value: string;
    props?: {
        size?: 'cover' | 'contain' | 'auto';
        position?: string;
    };
};

type ElementAnimation = {
    type: AnimationType;
    duration: number;
    delay: number;
    direction?: AnimationDirection;
};

type SlideElement = {
    id: string;
    type: 'headline' | 'subheadline' | 'text' | 'image' | 'video' | 'chart' | 'shape' | 'link-preview' | 'list' | 'icon' | 'custom';
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
    listType?: 'disc' | 'decimal';
    listSpacing?: number;
    animation?: ElementAnimation;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
};

type Slide = {
    id: string;
    type: string;
    duration: number;
    elements?: SlideElement[];
    background?: SlideBackground;
    transition?: {
        type: 'none' | 'fade' | 'slide' | 'wipe';
        duration?: number;
    };
};

type TemplateData = {
    name: string;
    slides: Slide[];
};



interface AnimatedElementProps {
    element: SlideElement;
    relativeFrame: number;
}

interface ElementContentProps {
    element: SlideElement;
    parentWidth: number;
    parentHeight: number;
    relativeFrame: number;
}


interface SlideRendererProps {
    slide: Slide;
    relativeFrame: number;
}


interface SlideCompositionProps {
    templateData: TemplateData;
}

export type {
    AnimationType,
    AnimationDirection,
    SlideBackground,
    ElementAnimation,
    SlideElement,
    Slide,
    TemplateData,
    AnimatedElementProps,
    ElementContentProps,
    SlideRendererProps,
    SlideCompositionProps
};
