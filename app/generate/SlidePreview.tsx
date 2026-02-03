'use client';

import React from 'react';
import { Slide } from './types';
import { 
    BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { parseChartData } from './utils';
import * as LucideIcons from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { markdownComponents } from './markdownConfig';
import { resolveElementValues } from './valueKeywords';
import { CustomComponentRenderer } from './renderers/CustomComponentRenderer';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F'];

interface SlidePreviewProps {
    slide: Slide | undefined;
    scale?: number;
    className?: string;
}

const SlidePreview: React.FC<SlidePreviewProps> = ({ slide, scale = 1, className = '' }) => {
    if (!slide) return <div className="w-full h-full bg-zinc-900" />;

    const BASE_WIDTH = 1000;
    const BASE_HEIGHT = 562.5;

    return (
        <div className={`relative overflow-hidden bg-zinc-900 ${className} flex items-center justify-center`}
            style={{
                width: '100%',
                height: '100%',
            }}
        >
            <div 
                style={{
                    width: BASE_WIDTH,
                    height: BASE_HEIGHT,
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    position: 'relative',
                    flexShrink: 0
                }}
            >
             {slide.background?.type === 'image' && (
                <div className="absolute inset-0 z-0" style={{
                    backgroundImage: `url(${slide.background.value})`,
                    backgroundSize: slide.background.props?.size || 'cover',
                    backgroundPosition: slide.background.props?.position || 'center',
                    backgroundRepeat: slide.background.props?.repeat || 'no-repeat',
                }}>
                    <div className="absolute inset-0 bg-black/20" />
                </div>
            )}
             
             <div className="absolute inset-0 -z-10" style={{
                background: slide.background?.type === 'gradient' ? slide.background.value :
                            slide.background?.type === 'color' ? slide.background.value :
                            '#18181b'
             }} />

            <div className="absolute inset-0 z-10 overflow-hidden">
                {slide.elements?.map(rawEl => {
                    const el = resolveElementValues(rawEl);
                    return (
                    <div
                        key={el.id as string}
                        className={`absolute ${el.type === 'image' ? 'rounded-lg overflow-hidden' : ''} ${el.type === 'chart' ? (el.chartProps?.transparent ? 'p-2' : 'bg-zinc-900/80 rounded-lg p-2 border border-zinc-800') : ''}`}
                        style={{
                            left: el.x, 
                            top: el.y,
                            width: el.width ? el.width : 'auto',
                            height: el.height ? el.height : 'auto',
                            zIndex: el.zIndex,
                            transform: `rotate(${el.rotation || 0}deg)`,
                            
                            color: el.textColor || el.color || 'inherit',
                            fontSize: el.fontSize || 16,
                            fontWeight: el.fontWeight || 'normal',
                            fontFamily: el.fontFamily ? `${el.fontFamily}, sans-serif` : 'Inter, sans-serif',
                            lineHeight: el.lineHeight || 1.5,
                            textAlign: el.textAlign || 'left',
                            backgroundColor: el.type === 'shape' ? (el.color || '#3b82f6') : undefined,
                            borderRadius: (el.type === 'shape' || el.type === 'image') ? `${el.borderRadius || 0}px` : undefined,
                            borderWidth: (el.type === 'shape' || el.type === 'image') ? (el.strokeWidth || 0) : undefined,
                            borderColor: (el.type === 'shape' || el.type === 'image') ? (el.strokeColor || 'transparent') : undefined,
                            borderStyle: (el.strokeWidth && el.strokeWidth > 0) ? 'solid' : 'none',
                            whiteSpace: 'pre-wrap'
                        }}
                    >
                         {el.type === 'headline' && <h1 className="leading-tight drop-shadow-md">{el.content as string}</h1>}
                         {el.type === 'subheadline' && <p className="leading-snug drop-shadow-sm">{el.content as string}</p>}
                         {el.type === 'text' && (
                             <div className="leading-normal prose prose-invert prose-sm max-w-none">
                                 {el.textFormat === 'markdown' ? (
                                     <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkBreaks]}>
                                         {el.content as string}
                                     </ReactMarkdown>
                                 ) : (el.content as string)}
                             </div>
                         )}
                         
                         {el.type === 'list' && (
                             <div className="text-left w-full h-full">
                                {el.listType === 'decimal' ? (
                                    <ol className="list-decimal list-inside" style={{ display: 'flex', flexDirection: 'column', gap: (el.listSpacing || 4), textAlign: el.textAlign }}>
                                        {(el.content as string).split('\n').map((item, i) => <li key={i} style={{ fontWeight: el.fontWeight }}>{item}</li>)}
                                    </ol>
                                ) : (
                                    <ul className="list-disc list-inside" style={{ display: 'flex', flexDirection: 'column', gap: (el.listSpacing || 4), textAlign: el.textAlign }}>
                                        {(el.content as string).split('\n').map((item, i) => <li key={i} style={{ fontWeight: el.fontWeight }}>{item}</li>)}
                                    </ul>
                                )}
                            </div>
                         )}

                         {el.type === 'image' && (
                            <img 
                                src={(el.content && ((el.content as string).startsWith('http') || (el.content as string).startsWith('blob:'))) ? (el.content as string) : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'} 
                                className="w-full h-full" 
                                style={{ objectFit: el.objectFit || 'cover' }}
                                alt="Slide Asset"
                            />
                        )}
                        
                        {el.type === 'icon' && (
                             <div className="w-full h-full flex items-center justify-center">
                                 {(() => {
                                     const iconName = (el.content as string)
                                         .split('-')
                                         .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                                         .join('');
                                     
                                     const Icon = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
                                     return <Icon size={(el.fontSize || 48) * scale} color={el.color || 'currentColor'} strokeWidth={2} />;
                                 })()}
                             </div>
                         )}

                        {el.type === 'shape' && (
                            <div className="w-full h-full"></div>
                        )}

                        {el.type === 'chart' && (
                            <div className="w-full h-full" style={{ 
                                minWidth: 100, 
                                minHeight: 60, 
                                opacity: el.opacity ?? 1,
                                backgroundColor: el.chartProps?.transparent ? 'transparent' : undefined,
                                borderColor: el.chartProps?.transparent ? 'transparent' : undefined,
                                boxShadow: el.chartProps?.transparent ? 'none' : undefined
                             }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    {(() => {
                                         const data = parseChartData(el.content as string);
                                         const conf = el.chartProps || {};
                                         
                                         if (el.chartType === 'pie') {
                                            return (
                                                <PieChart>
                                                    <Pie 
                                                        data={data} 
                                                        dataKey="value1" 
                                                        nameKey="name" 
                                                        cx="50%" cy="50%" 
                                                        outerRadius="80%" 
                                                        fill={el.color || "#8884d8"}
                                                        isAnimationActive={false}
                                                    >
                                                        {data.map((entry: any, index: number) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    {conf.showLegend !== false && <Legend iconSize={10} wrapperStyle={{ fontSize: '10px' }} />}
                                                </PieChart>
                                            )
                                         }

                                         const ChartComp = el.chartType === 'line' ? LineChart : 
                                                           el.chartType === 'area' ? AreaChart : BarChart;

                                         return (
                                            <ChartComp data={data}>
                                                {(conf.showGrid !== false) && <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#fff" />}
                                                {(conf.showXAxis !== false) && <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />}
                                                {(conf.showYAxis !== false) && <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />}
                                                {(conf.showLegend !== false) && <Legend iconSize={10} wrapperStyle={{ fontSize: '10px' }} />}
                                                
                                                 {(() => {
                                                    const valueKeys = data.length > 0 ? Object.keys(data[0]).filter(k => k.startsWith('value')) : [];
                                                    return valueKeys.map((key, index) => {
                                                        const color = index === 0 ? (el.color || COLORS[0]) : COLORS[index % COLORS.length];
                                                        if (el.chartType === 'area') return <Area key={key} type="monotone" dataKey={key} stroke={color} fill={color} fillOpacity={0.3} isAnimationActive={false} />;
                                                        if (el.chartType === 'line') return <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />;
                                                        return <Bar key={key} dataKey={key} fill={color} isAnimationActive={false} />;
                                                    });
                                                })()}
                                            </ChartComp>
                                         );
                                    })()}
                                </ResponsiveContainer>
                            </div>
                        )}

                        {el.type === 'custom' && (
                             <CustomComponentRenderer content={el.content} scale={scale} />
                        )}
                    </div>
                    );
                })}
            </div>
            </div>
        </div>
    );
};

export default SlidePreview;
