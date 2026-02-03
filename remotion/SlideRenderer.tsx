import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, Img, Easing, Video } from 'remotion';
import { 
    BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { getFontFamily } from './fonts';
import * as LucideIcons from 'lucide-react';
import { CustomComponentRenderer } from '../app/generate/renderers/CustomComponentRenderer';

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

const useAnimatedChartData = (data: any[], animationFrames: number = 30) => {
    const frame = useCurrentFrame();
    const progress = interpolate(frame, [0, animationFrames], [0, 1], {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
    });
    
    return data.map(item => {
        const animated: any = { name: item.name };
        Object.keys(item).forEach(key => {
            if (key.startsWith('value')) {
                animated[key] = item[key] * progress;
            }
        });
        return animated;
    });
};

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F'];

const MarkdownRenderer: React.FC<{ content: string; textColor?: string }> = ({ content, textColor = '#e4e4e7' }) => {
    const parseInline = (text: string): React.ReactNode[] => {
        const parts: React.ReactNode[] = [];
        let remaining = text;
        let key = 0;
        
        while (remaining.length > 0) {
            const boldMatch = remaining.match(/^(\*\*|__)(.+?)\1/);
            if (boldMatch) {
                parts.push(<strong key={key++} style={{ fontWeight: 700, color: '#ffffff' }}>{parseInline(boldMatch[2])}</strong>);
                remaining = remaining.slice(boldMatch[0].length);
                continue;
            }
            
            const italicMatch = remaining.match(/^(\*|_)(.+?)\1/);
            if (italicMatch) {
                parts.push(<em key={key++} style={{ fontStyle: 'italic' }}>{parseInline(italicMatch[2])}</em>);
                remaining = remaining.slice(italicMatch[0].length);
                continue;
            }
            
            const codeMatch = remaining.match(/^`([^`]+)`/);
            if (codeMatch) {
                parts.push(
                    <code key={key++} style={{
                        backgroundColor: 'rgba(39, 39, 42, 0.8)',
                        color: '#c084fc',
                        padding: '0.125rem 0.375rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.9em',
                        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                    }}>{codeMatch[1]}</code>
                );
                remaining = remaining.slice(codeMatch[0].length);
                continue;
            }
            
            // Regular character
            const nextSpecial = remaining.slice(1).search(/[\*_`]/);
            if (nextSpecial === -1) {
                parts.push(remaining);
                break;
            }
            parts.push(remaining.slice(0, nextSpecial + 1));
            remaining = remaining.slice(nextSpecial + 1);
        }
        
        return parts;
    };
    
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inList = false;
    let listItems: React.ReactNode[] = [];
    let listType: 'ul' | 'ol' = 'ul';
    
    const flushList = () => {
        if (listItems.length > 0) {
            const ListTag = listType;
            elements.push(
                <ListTag key={elements.length} style={{
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5em',
                    margin: '1em 0',
                    padding: 0,
                }}>
                    {listItems}
                </ListTag>
            );
            listItems = [];
        }
        inList = false;
    };
    
    lines.forEach((line, i) => {
        const h1Match = line.match(/^# (.+)$/);
        if (h1Match) {
            flushList();
            elements.push(<h1 key={i} style={{ fontSize: '2em', fontWeight: 700, margin: '1.5em 0 0.5em 0', color: '#ffffff' }}>{parseInline(h1Match[1])}</h1>);
            return;
        }
        
        const h2Match = line.match(/^## (.+)$/);
        if (h2Match) {
            flushList();
            elements.push(<h2 key={i} style={{ fontSize: '1.5em', fontWeight: 700, margin: '1.5em 0 0.5em 0', color: '#ffffff' }}>{parseInline(h2Match[1])}</h2>);
            return;
        }
        
        const h3Match = line.match(/^### (.+)$/);
        if (h3Match) {
            flushList();
            elements.push(<h3 key={i} style={{ fontSize: '1.25em', fontWeight: 700, margin: '1.25em 0 0.5em 0', color: '#ffffff' }}>{parseInline(h3Match[1])}</h3>);
            return;
        }
        
        if (line.startsWith('> ')) {
            flushList();
            elements.push(
                <blockquote key={i} style={{
                    borderLeft: '4px solid #a855f7',
                    paddingLeft: '1rem',
                    margin: '1.25em 0',
                    color: '#d4d4d8',
                    fontStyle: 'italic',
                }}>{parseInline(line.slice(2))}</blockquote>
            );
            return;
        }
        
        // Unordered list
        const ulMatch = line.match(/^[-*] (.+)$/);
        if (ulMatch) {
            if (!inList || listType !== 'ul') {
                flushList();
                listType = 'ul';
            }
            inList = true;
            listItems.push(
                <li key={listItems.length} style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <span style={{
                        marginRight: '0.5rem',
                        marginTop: '0.6em',
                        width: '0.375rem',
                        height: '0.375rem',
                        borderRadius: '50%',
                        backgroundColor: '#a855f7',
                        flexShrink: 0,
                    }} />
                    <span>{parseInline(ulMatch[1])}</span>
                </li>
            );
            return;
        }
        
        const olMatch = line.match(/^(\d+)\. (.+)$/);
        if (olMatch) {
            if (!inList || listType !== 'ol') {
                flushList();
                listType = 'ol';
            }
            inList = true;
            listItems.push(
                <li key={listItems.length} style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <span style={{ marginRight: '0.5rem', color: '#a855f7', fontWeight: 600 }}>{olMatch[1]}.</span>
                    <span>{parseInline(olMatch[2])}</span>
                </li>
            );
            return;
        }
        
        if (line.trim() === '') {
            flushList();
            elements.push(<div key={i} style={{ height: '0.5rem' }} />);
            return;
        }
        
        flushList();
        elements.push(<p key={i} style={{ margin: '1em 0', color: textColor }}>{parseInline(line)}</p>);
    });
    
    flushList();
    
    return <div>{elements}</div>;
};

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
        wordBreak: 'break-word',
        boxSizing: 'border-box',
    };
    
    return (
        <div style={style}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                justifyContent: element.verticalAlign === 'center' ? 'center' : element.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start',
                alignItems: element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start',
            }}>
                <ElementContent element={element} parentWidth={element.width || 400} parentHeight={element.height || 250} />
            </div>
        </div>
    );
};

const AnimatedChart: React.FC<{ 
    element: SlideElement; 
    width: number; 
    height: number;
    colors: string[];
}> = ({ element, width, height, colors }) => {
    const rawData = parseChartData(element.content);
    const data = useAnimatedChartData(rawData);
    const conf = element.chartProps || {};
    
    if (element.chartType === 'pie') {
        const pieRadius = Math.min(width, height) * 0.35;
        const frame = useCurrentFrame();
        const scale = interpolate(frame, [0, 20], [0, 1], { 
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
        });
        
        return (
            <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'center center' }}>
                <PieChart width={width} height={height}>
                    <Pie
                        data={rawData}
                        dataKey="value1"
                        nameKey="name"
                        cx={width / 2}
                        cy={height / 2}
                        outerRadius={pieRadius}
                        fill="#8884d8"
                        label
                        isAnimationActive={false}
                    >
                        {rawData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                    {conf.showLegend !== false && <Legend iconSize={10} wrapperStyle={{ fontSize: '10px' }} />}
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }} />
                </PieChart>
            </div>
        );
    }
    
    // For Bar/Line/Area, we use the interpolated data
    const ChartComponent = element.chartType === 'line' ? LineChart :
                           element.chartType === 'area' ? AreaChart : BarChart;
                           
    return (
        <div style={{ width, height }}>
            <ChartComponent data={data} width={width} height={height}>
                {conf.showGrid !== false && <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#fff" />}
                {conf.showXAxis !== false && <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} /> }
                {conf.showYAxis !== false && <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />}
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }} />
                {conf.showLegend !== false && <Legend iconSize={10} wrapperStyle={{ fontSize: '10px' }} />}
                {(() => {
                    const valueKeys = data.length > 0 ? Object.keys(data[0]).filter(k => k.startsWith('value')) : [];
                    return valueKeys.map((key, index) => {
                        const color = colors[index % colors.length];
                        if (element.chartType === 'area') return <Area key={key} type="monotone" dataKey={key} stroke={color} fill={color} fillOpacity={0.3} isAnimationActive={false} />;
                        if (element.chartType === 'line') return <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={3} dot={{ r: 4 }} isAnimationActive={false} />;
                        return <Bar key={key} dataKey={key} fill={color} radius={[4, 4, 0, 0]} isAnimationActive={false} />;
                    });
                })()}
            </ChartComponent>
        </div>
    );
};

interface ElementContentProps {
    element: SlideElement;
    parentWidth: number;
    parentHeight: number;
}



const SafeImage: React.FC<{ src: string; style?: React.CSSProperties; alt?: string; objectFit?: any; borderRadius?: any }> = ({ src, style, alt, objectFit, borderRadius }) => {
    const [hasError, setHasError] = React.useState(false);
    
    const finalStyle = {
        ...style,
        width: '100%',
        height: '100%',
        objectFit: objectFit || 'cover',
        borderRadius: borderRadius || 0,
    };

    if (hasError || !src) {
        return (
             <div style={{ 
                 ...finalStyle, 
                 backgroundColor: '#27272a', 
                 display: 'flex', 
                 flexDirection: 'column',
                 alignItems: 'center', 
                 justifyContent: 'center',
                 border: '1px solid #3f3f46'
             }}>
                <LucideIcons.ImageOff style={{ width: 24, height: 24, color: '#71717a', marginBottom: 8 }} />
                <span style={{ fontSize: 12, color: '#71717a' }}>Image Unavailable</span>
             </div>
        );
    }
    
    return (
        <img
            src={src}
            alt={alt || "slide-asset"}
            style={finalStyle}
            onError={(e) => {
                console.warn(`Failed to load image: ${src}`);
                setHasError(true);
            }}
        />
    );
};

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
                    fontFamily: getFontFamily(element.fontFamily || 'Inter'),
                    lineHeight: 1.25,
                    whiteSpace: 'pre-wrap',
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
                    fontFamily: getFontFamily(element.fontFamily || 'Inter'),
                    lineHeight: 1.375,
                    whiteSpace: 'pre-wrap',
                    width: '100%'
                }}>
                    {element.content}
                </p>
            );
            
        case 'text':
            if (element.textFormat === 'markdown') {
                return (
                    <div style={{ 
                        width: '100%', 
                        fontSize: element.fontSize || 16,
                        fontFamily: getFontFamily(element.fontFamily || 'Inter'),
                        lineHeight: 1.5,
                    }}>
                        <MarkdownRenderer content={element.content} textColor={element.textColor} />
                    </div>
                );
            }
            return (
                <div style={{ 
                    fontSize: element.fontSize || 16,
                    textAlign: element.textAlign || 'left',
                    fontFamily: getFontFamily(element.fontFamily || 'Inter'),
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    width: '100%'
                }}>
                    {element.content}
                </div>
            );
            
        case 'image':
            return (
                <SafeImage
                    src={element.content}
                    alt="slide-asset"
                    objectFit={element.objectFit}
                    borderRadius={element.borderRadius}
                    style={{}}
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
            return (
                <AnimatedChart 
                    element={element} 
                    width={chartWidth} 
                    height={chartHeight} 
                    colors={element.chartProps?.colors || CHART_COLORS}
                />
            );
            
        case 'video':
            return (
                <div style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: element.borderRadius || 12 }}>
                    {element.content ? (
                        <Video
                            src={element.content}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            muted
                        />
                    ) : (
                        <div style={{ 
                            width: '100%', 
                            height: '100%', 
                            backgroundColor: '#18181b', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            border: '2px dashed #27272a' 
                        }}>
                           <span style={{ color: '#3f3f46', fontSize: 12, fontWeight: 500 }}>Video Placeholder</span>
                        </div>
                    )}
                </div>
            );

        case 'link-preview':
            return (
                <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    backgroundColor: 'rgba(24, 24, 27, 0.9)', 
                    border: '1px solid #27272a', 
                    borderRadius: 12, 
                    overflow: 'hidden', 
                    display: 'flex', 
                    flexDirection: 'column',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
                }}>
                    <div style={{ height: '40%', backgroundColor: '#27272a', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LucideIcons.Globe style={{ width: 32, height: 32, color: '#52525b' }} />
                        <div style={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8, 
                            backgroundColor: 'rgba(24, 24, 27, 0.8)', 
                            padding: '2px 6px', 
                            borderRadius: 4, 
                            fontSize: 10, 
                            color: '#a1a1aa', 
                            fontFamily: 'monospace' 
                        }}>
                            HTTP 200
                        </div>
                    </div>
                    <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 'bold', color: 'white', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {element.content || "Awesome Resource Name"}
                            </div>
                            <div style={{ fontSize: 10, color: '#a1a1aa', lineHeight: 1.6, opacity: 0.8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                This is a simulated preview of the link provided. It includes metadata, a cover image, and description extracted from the URL.
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: 8, borderTop: '1px solid rgba(39, 39, 42, 0.5)', paddingTop: 8 }}>
                            <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                                <LucideIcons.ExternalLink style={{ width: 10, height: 10, color: '#60a5fa' }} />
                            </div>
                            <span style={{ fontSize: 9, color: '#71717a', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {element.content?.replace(/https?:\/\//, '') || "example.com/resource"}
                            </span>
                        </div>
                    </div>
                </div>
            );

        case 'icon':
            return (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {(() => {
                        const iconName = element.content
                            .split('-')
                            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                            .join('');
                        
                        const Icon = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
                        return <Icon size={Math.min(parentWidth || 48, parentHeight || 48)} color={element.color || 'currentColor'} strokeWidth={2} />;
                    })()}
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
                            fontSize: element.fontSize || 16,
                            fontFamily: getFontFamily(element.fontFamily || 'Inter')
                        }}>
                            {item}
                        </li>
                    ))}
                </ListTag>
            );

        case 'custom':
            return (
                <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <CustomComponentRenderer content={element.content} scale={1} />
                </div>
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

const TransitionWrapper: React.FC<{
    children: React.ReactNode;
    slide: Slide;
    isOutgoing: boolean;
    transitionProgress: number;
}> = ({ children, slide, isOutgoing, transitionProgress }) => {
    const transition = slide.transition;
    const type = transition?.type || 'none';
    
    if (type === 'none' || transitionProgress === 0) {
        return <>{children}</>;
    }
    
    let opacity = 1;
    let transform = 'none';
    
    const progress = isOutgoing ? transitionProgress : 1 - transitionProgress;
    
    switch (type) {
        case 'fade':
            opacity = isOutgoing ? 1 - transitionProgress : transitionProgress;
            break;
            
        case 'slide':
            const slideOffset = isOutgoing 
                ? -transitionProgress * 100 
                : (1 - transitionProgress) * 100;
            transform = `translateX(${slideOffset}%)`;
            break;
            
        case 'wipe':
            const clipPercent = isOutgoing 
                ? (1 - transitionProgress) * 100 
                : transitionProgress * 100;
            return (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    clipPath: isOutgoing 
                        ? `inset(0 ${transitionProgress * 100}% 0 0)`
                        : `inset(0 0 0 ${(1 - transitionProgress) * 100}%)`,
                }}>
                    {children}
                </div>
            );
    }
    
    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            opacity,
            transform,
        }}>
            {children}
        </div>
    );
};

export const SlideComposition: React.FC<SlideCompositionProps> = ({ templateData }) => {
    const { fps } = useVideoConfig();
    const frame = useCurrentFrame();
    
    const slideRanges: { slide: Slide; fromFrame: number; toFrame: number; transitionFrames: number }[] = [];
    let currentFrameOffset = 0;
    
    templateData.slides.forEach((slide, index) => {
        const durationFrames = slide.duration || 150;
        const nextSlide = templateData.slides[index + 1];
        const transitionDuration = nextSlide?.transition?.duration || 0.5;
        const transitionFrames = nextSlide?.transition?.type !== 'none' && nextSlide?.transition?.type 
            ? Math.floor(transitionDuration * fps) 
            : 0;
        
        slideRanges.push({
            slide,
            fromFrame: currentFrameOffset,
            toFrame: currentFrameOffset + durationFrames,
            transitionFrames,
        });
        
        currentFrameOffset += durationFrames - transitionFrames;
    });
    
    return (
        <AbsoluteFill style={{ backgroundColor: '#000' }}>
            {slideRanges.map((range, index) => {
                const { slide, fromFrame, toFrame, transitionFrames } = range;
                const nextRange = slideRanges[index + 1];
                
                const isInTransitionOut = nextRange && frame >= (toFrame - transitionFrames) && frame < toFrame;
                const transitionOutProgress = isInTransitionOut 
                    ? (frame - (toFrame - transitionFrames)) / transitionFrames 
                    : 0;
                
                const prevRange = slideRanges[index - 1];
                const isInTransitionIn = prevRange && frame >= fromFrame && frame < (fromFrame + range.transitionFrames);
                const transitionInProgress = isInTransitionIn && prevRange
                    ? (frame - fromFrame) / prevRange.transitionFrames
                    : 0;
                
                const isVisible = frame >= fromFrame && frame < toFrame + transitionFrames;
                
                if (!isVisible) return null;
                
                const zIndex = isInTransitionOut ? 1 : 2;
                
                const scale = useVideoConfig().width / 1000;
                return (
                    <AbsoluteFill key={slide.id} style={{ zIndex, backgroundColor: '#000' }}>
                        <div style={{ 
                            width: 1000, 
                            height: 563,
                            transform: `scale(${scale})`,
                            transformOrigin: 'top left',
                        }}>
                             <Sequence
                                from={fromFrame}
                                durationInFrames={toFrame - fromFrame + transitionFrames}
                                layout="none"
                            >
                                <TransitionWrapper
                                    slide={slide}
                                    isOutgoing={isInTransitionOut}
                                    transitionProgress={isInTransitionOut ? transitionOutProgress : transitionInProgress}
                                >
                                    <SingleSlideRenderer slide={slide} />
                                </TransitionWrapper>
                            </Sequence>
                        </div>
                    </AbsoluteFill>
                );
            })}
        </AbsoluteFill>
    );
};

export default SlideComposition;
