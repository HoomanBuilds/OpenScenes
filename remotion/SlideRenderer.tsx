import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { 
    BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

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
    type: 'headline' | 'subheadline' | 'text' | 'image' | 'video' | 'chart' | 'shape' | 'link-preview' | 'list' | 'icon';
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

const parseChartData = (content: string): any[] => {
    if (!content) return [];
    const lines = content.split('\n').filter(line => line.trim());
    return lines.map(line => {
        const parts = line.split(/\s+/);
        const name = parts[0] || '';
        const values: Record<string, number> = {};
        for (let i = 1; i < parts.length; i++) {
            const num = parseFloat(parts[i]);
            if (!isNaN(num)) {
                values[`value${i}`] = num;
            }
        }
        return { name, ...values };
    });
};

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F'];

interface AnimatedElementProps {
    element: SlideElement;
}

const AnimatedElement: React.FC<AnimatedElementProps> = ({ element }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    
    const anim = element.animation;
    const animType = anim?.type || 'fade';
    const duration = (anim?.duration || 0.6) * fps;
    const delay = (anim?.delay || 0) * fps;
    const animStart = delay;
    const animEnd = delay + duration;
    
    const progress = interpolate(
        frame,
        [animStart, animEnd],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    
    let opacity = element.opacity ?? 1;
    let translateX = 0;
    let translateY = 0;
    let scale = 1;
    
    switch (animType) {
        case 'fade':
            opacity = progress * (element.opacity ?? 1);
            break;
        case 'slide':
            const dir = anim?.direction || 'left';
            const offset = 100;
            opacity = progress * (element.opacity ?? 1);
            if (dir === 'left') translateX = interpolate(progress, [0, 1], [-offset, 0]);
            if (dir === 'right') translateX = interpolate(progress, [0, 1], [offset, 0]);
            if (dir === 'up') translateY = interpolate(progress, [0, 1], [-offset, 0]);
            if (dir === 'down') translateY = interpolate(progress, [0, 1], [offset, 0]);
            break;
        case 'scale':
            opacity = progress * (element.opacity ?? 1);
            scale = interpolate(progress, [0, 1], [0.5, 1]);
            break;
        case 'pop':
            opacity = progress * (element.opacity ?? 1);
            // Spring-like effect with overshoot
            scale = interpolate(progress, [0, 0.6, 1], [0.3, 1.1, 1], { 
                extrapolateLeft: 'clamp', 
                extrapolateRight: 'clamp' 
            });
            break;
        case 'none':
        default:
            break;
    }
    
    const style: React.CSSProperties = {
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: element.width || 'auto',
        height: element.height || 'auto',
        zIndex: element.zIndex || 1,
        opacity,
        transform: `translate(${translateX}px, ${translateY}px) scale(${scale}) rotate(${element.rotation || 0}deg)`,
        color: element.textColor || element.color || 'inherit',
        fontSize: element.fontSize || 16,
        fontWeight: element.fontWeight || 'normal',
        fontFamily: element.fontFamily || 'Inter, sans-serif',
        lineHeight: element.lineHeight || 1.5,
        textAlign: element.textAlign || 'left',
        backgroundColor: element.type === 'shape' ? (element.color || '#3b82f6') : undefined,
        borderRadius: (element.type === 'shape' || element.type === 'image') ? (element.borderRadius || 0) : undefined,
        borderWidth: element.strokeWidth || 0,
        borderColor: element.strokeColor || 'transparent',
        borderStyle: (element.strokeWidth || 0) > 0 ? 'solid' : 'none',
        whiteSpace: 'pre-wrap',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: element.verticalAlign === 'center' ? 'center' : element.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start',
        alignItems: element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start',
    };
    
    return (
        <div style={style}>
            <ElementContent element={element} parentWidth={element.width || 400} parentHeight={element.height || 250} />
        </div>
    );
};

interface ElementContentProps {
    element: SlideElement;
    parentWidth: number;
    parentHeight: number;
}

const ElementContent: React.FC<ElementContentProps> = ({ element, parentWidth, parentHeight }) => {
    const chartWidth = parentWidth || 400;
    const chartHeight = parentHeight || 250;
    
    switch (element.type) {
        case 'headline':
            return (
                <h1 style={{ 
                    margin: 0, 
                    fontSize: element.fontSize || 60, 
                    fontWeight: element.fontWeight || 'bold',
                    textAlign: element.textAlign || 'left',
                    width: '100%'
                }}>
                    {element.content}
                </h1>
            );
            
        case 'subheadline':
            return (
                <p style={{ 
                    margin: 0, 
                    fontSize: element.fontSize || 32,
                    textAlign: element.textAlign || 'left',
                    width: '100%'
                }}>
                    {element.content}
                </p>
            );
            
        case 'text':
            if (element.textFormat === 'markdown') {
                // Simple markdown rendering for bullets
                const lines = element.content.split('\n');
                return (
                    <div style={{ width: '100%', fontSize: element.fontSize || 16 }}>
                        {lines.map((line, i) => {
                            if (line.trim().startsWith('- ')) {
                                return (
                                    <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                                        <span style={{ color: element.textColor || '#fff' }}>•</span>
                                        <span>{line.replace(/^-\s*/, '')}</span>
                                    </div>
                                );
                            }
                            return <div key={i} style={{ marginBottom: 4 }}>{line}</div>;
                        })}
                    </div>
                );
            }
            return (
                <div style={{ 
                    fontSize: element.fontSize || 16,
                    textAlign: element.textAlign || 'left',
                    width: '100%'
                }}>
                    {element.content}
                </div>
            );
            
        case 'image':
            return (
                <img
                    src={element.content || 'https://via.placeholder.com/400x300'}
                    alt="slide-asset"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: element.objectFit || 'cover',
                        borderRadius: element.borderRadius || 0,
                    }}
                />
            );
            
        case 'shape':
            const isDecorative = ['rect', 'circle', 'square'].includes((element.content || '').toLowerCase());
            if (isDecorative) {
                if (element.content?.toLowerCase() === 'circle') {
                    return (
                        <div style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            backgroundColor: element.color || '#3b82f6',
                        }} />
                    );
                }
                return null;
            }
            return (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    textAlign: 'center',
                    padding: 16,
                }}>
                    {element.content}
                </div>
            );
            
        case 'chart':
            const data = parseChartData(element.content);
            const conf = element.chartProps || {};
            const chartColors = conf.colors || CHART_COLORS;
            
            // Use explicit dimensions instead of ResponsiveContainer (doesn't work in Remotion headless)
            if (element.chartType === 'pie') {
                const pieRadius = Math.min(chartWidth, chartHeight) * 0.35;
                return (
                    <div style={{ width: chartWidth, height: chartHeight }}>
                        <PieChart width={chartWidth} height={chartHeight}>
                            <Pie
                                data={data}
                                dataKey="value1"
                                nameKey="name"
                                cx={chartWidth / 2}
                                cy={chartHeight / 2}
                                outerRadius={pieRadius}
                                fill="#8884d8"
                                label
                                isAnimationActive={false}
                            >
                                {data.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                ))}
                            </Pie>
                            {conf.showLegend !== false && <Legend iconSize={10} wrapperStyle={{ fontSize: '10px' }} />}
                            <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }} />
                        </PieChart>
                    </div>
                );
            }
            
            const ChartComponent = element.chartType === 'line' ? LineChart :
                                   element.chartType === 'area' ? AreaChart : BarChart;
            
            return (
                <div style={{ width: chartWidth, height: chartHeight }}>
                    <ChartComponent data={data} width={chartWidth} height={chartHeight}>
                        {conf.showGrid !== false && <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#fff" />}
                        {conf.showXAxis !== false && <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />}
                        {conf.showYAxis !== false && <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />}
                        <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }} />
                        {conf.showLegend !== false && <Legend iconSize={10} wrapperStyle={{ fontSize: '10px' }} />}
                        {(() => {
                            const valueKeys = data.length > 0 ? Object.keys(data[0]).filter(k => k.startsWith('value')) : [];
                            return valueKeys.map((key, index) => {
                                const color = chartColors[index % chartColors.length];
                                if (element.chartType === 'area') return <Area key={key} type="monotone" dataKey={key} stroke={color} fill={color} fillOpacity={0.3} isAnimationActive={false} />;
                                if (element.chartType === 'line') return <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={3} dot={{ r: 4 }} isAnimationActive={false} />;
                                return <Bar key={key} dataKey={key} fill={color} radius={[4, 4, 0, 0]} isAnimationActive={false} />;
                            });
                        })()}
                    </ChartComponent>
                </div>
            );
            
        case 'list':
            const items = element.content.split('\n');
            const ListTag = element.listType === 'decimal' ? 'ol' : 'ul';
            return (
                <ListTag style={{ 
                    margin: 0, 
                    paddingLeft: 24,
                    listStyleType: element.listType === 'decimal' ? 'decimal' : 'disc'
                }}>
                    {items.map((item, i) => (
                        <li key={i} style={{ 
                            marginBottom: element.listSpacing || 4,
                            fontSize: element.fontSize || 16
                        }}>
                            {item}
                        </li>
                    ))}
                </ListTag>
            );
            
        default:
            return null;
    }
};

interface SlideRendererProps {
    slide: Slide;
}

const SingleSlideRenderer: React.FC<SlideRendererProps> = ({ slide }) => {
    const bg = slide.background;
    const bgValue = bg?.type === 'color'
        ? (bg.value === 'dark' ? '#18181b' : bg.value)
        : bg?.value || '#18181b';
    
    const backgroundStyle: React.CSSProperties = {
        background: bg?.type === 'gradient' ? bgValue : undefined,
        backgroundColor: bg?.type !== 'gradient' ? bgValue : undefined,
    };
    
    return (
        <AbsoluteFill style={backgroundStyle}>
            {/* Background Image */}
            {bg?.type === 'image' && (
                <img
                    src={bg.value}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.5,
                    }}
                />
            )}
            
            {/* Elements */}
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {slide.elements?.map((element) => (
                    <AnimatedElement
                        key={element.id}
                        element={element}
                    />
                ))}
            </div>
        </AbsoluteFill>
    );
};

export interface SlideCompositionProps {
    templateData: TemplateData;
}

export const SlideComposition: React.FC<SlideCompositionProps> = ({ templateData }) => {
    const { fps } = useVideoConfig();
    
    let currentFrameOffset = 0;
    
    return (
        <AbsoluteFill style={{ backgroundColor: '#000' }}>
            {templateData.slides.map((slide) => {
                const durationFrames = slide.duration || 150;
                const fromFrame = currentFrameOffset;
                currentFrameOffset += durationFrames;
                
                return (
                    <Sequence
                        key={slide.id}
                        from={fromFrame}
                        durationInFrames={durationFrames}
                        layout="none"
                    >
                        <SingleSlideRenderer slide={slide} />
                    </Sequence>
                );
            })}
        </AbsoluteFill>
    );
};

export default SlideComposition;
