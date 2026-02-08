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
                    flexShrink: 0,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
             {slide.background?.type === 'image' && (
                <div className="absolute inset-0 z-0" style={{
                    backgroundImage: `url(${slide.background.value})`,
                    backgroundSize: slide.background.props?.size || 'cover',
                    backgroundPosition: slide.background.props?.position || 'center',
                    backgroundRepeat: slide.background.props?.repeat || 'no-repeat',
                }}>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                </div>
            )}
             
             <div className="absolute inset-0 -z-10" style={{
                background: slide.background?.type === 'gradient' ? slide.background.value :
                            slide.background?.type === 'color' ? slide.background.value :
                            '#09090b'
             }} />

            <div className="absolute inset-0 z-10 overflow-hidden font-sans antialiased">
                {slide.elements?.map(rawEl => {
                    const el = resolveElementValues(rawEl);
                    return (
                    <div
                        key={el.id as string}
                        className={`absolute ${el.type === 'image' ? 'rounded-2xl overflow-hidden shadow-lg' : ''} ${el.type === 'chart' ? (el.chartProps?.transparent ? 'p-0' : 'bg-zinc-900/80 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl') : ''}`}
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
                            lineHeight: (el.lineHeight && el.lineHeight > 5) ? `${el.lineHeight}px` : (el.lineHeight || 1.4),
                            textAlign: el.textAlign || 'left',
                            backgroundColor: el.type === 'shape' ? (el.color || '#3b82f6') : undefined,
                            borderRadius: (el.type === 'shape' || el.type === 'image') ? `${el.borderRadius || 0}px` : undefined,
                            borderWidth: (el.type === 'shape' || el.type === 'image') ? (el.strokeWidth || 0) : undefined,
                            borderColor: (el.type === 'shape' || el.type === 'image') ? (el.strokeColor || 'transparent') : undefined,
                            borderStyle: (el.strokeWidth && el.strokeWidth > 0) ? 'solid' : 'none',
                            whiteSpace: el.type === 'custom' ? 'normal' : 'pre-wrap',
                            opacity: el.opacity ?? 1,
                            letterSpacing: el.letterSpacing || 'normal'
                        }}
                    >
                         {el.type === 'headline' && <h1 className="leading-[1.1] drop-shadow-md text-balance">{el.content as string}</h1>}
                         {el.type === 'subheadline' && <p className="leading-snug drop-shadow-sm text-balance opacity-90">{el.content as string}</p>}
                         {el.type === 'text' && (
                             <div className="leading-relaxed drop-shadow-sm text-pretty w-full h-full">
                                 {el.textFormat === 'markdown' ? (
                                     <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkBreaks]}>
                                         {el.content as string}
                                     </ReactMarkdown>
                                 ) : (el.content as string)}
                             </div>
                         )}
                         
                         {el.type === 'list' && (
                             <div className="text-left w-full h-full drop-shadow-sm">
                                {el.listType === 'decimal' ? (
                                    <ol className="list-decimal list-inside" style={{ display: 'flex', flexDirection: 'column', gap: (el.listSpacing || 12), textAlign: el.textAlign }}>
                                        {(el.content as string).split('\n').map((item, i) => <li key={i} style={{ fontWeight: el.fontWeight, paddingLeft: '0.5em' }} className="marker:text-blue-500/80">{item}</li>)}
                                    </ol>
                                ) : (
                                    <ul className="list-disc list-inside" style={{ display: 'flex', flexDirection: 'column', gap: (el.listSpacing || 12), textAlign: el.textAlign }}>
                                        {(el.content as string).split('\n').map((item, i) => <li key={i} style={{ fontWeight: el.fontWeight, paddingLeft: '0.5em' }} className="marker:text-blue-500/80">{item}</li>)}
                                    </ul>
                                )}
                            </div>
                         )}

                         {el.type === 'image' && (
                            <img 
                                src={(el.content && ((el.content as string).startsWith('http') || (el.content as string).startsWith('blob:'))) ? (el.content as string) : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'} 
                                className="w-full h-full block" 
                                style={{ objectFit: el.objectFit || 'cover' }}
                                alt="Slide Asset"
                            />
                        )}
                    
                        {el.type === 'shape' && (
                            <div className="w-full h-full transition-all"></div>
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
                                                        innerRadius={60}
                                                        outerRadius={80} 
                                                        paddingAngle={5}
                                                        cornerRadius={5}
                                                        fill={el.color || "#3b82f6"}
                                                        isAnimationActive={false}
                                                        stroke="none"
                                                    >
                                                        {data.map((entry: any, index: number) => (
                                                            <Cell key={`cell-${index}`} fill={conf.colors?.[index % (conf.colors?.length || 1)] || COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    {conf.showLegend !== false && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', fontFamily: 'Inter', opacity: 0.8 }} verticalAlign="bottom" height={36} />}
                                                </PieChart>
                                            )
                                         }

                                         const ChartComp = el.chartType === 'line' ? LineChart : 
                                                           el.chartType === 'area' ? AreaChart : BarChart;

                                         return (
                                            <ChartComp data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                {(conf.showGrid !== false) && <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#fff" vertical={false} />}
                                                {(conf.showXAxis !== false) && <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} dy={10} />}
                                                {(conf.showYAxis !== false) && <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} dx={-10} />}
                                                {(conf.showLegend !== false) && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', fontFamily: 'Inter', opacity: 0.8, paddingTop: '10px' }} />}
                                                
                                                 {(() => {
                                                    const valueKeys = data.length > 0 ? Object.keys(data[0]).filter(k => k.startsWith('value')) : [];
                                                    return valueKeys.map((key, index) => {
                                                        const color = conf.colors?.[index % (conf.colors?.length || 1)] || (index === 0 ? (el.color || COLORS[0]) : COLORS[index % COLORS.length]);
                                                        
                                                        if (el.chartType === 'area') {
                                                            return (
                                                                <defs key={`defs-${key}`}>
                                                                    <linearGradient id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                                                                        <stop offset="95%" stopColor={color} stopOpacity={0}/>
                                                                    </linearGradient>
                                                                    <Area key={key} type="monotone" dataKey={key} stroke={color} fill={`url(#gradient-${key})`} strokeWidth={3} isAnimationActive={false} />
                                                                </defs>
                                                            );
                                                        }
                                                        if (el.chartType === 'line') return <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={3} dot={{ r: 4, strokeWidth: 0, fill: color }} activeDot={{ r: 6 }} isAnimationActive={false} />;
                                                        return <Bar key={key} dataKey={key} fill={color} radius={[4, 4, 0, 0]} isAnimationActive={false} />;
                                                    });
                                                })()}
                                            </ChartComp>
                                         );
                                    })()}
                                </ResponsiveContainer>
                            </div>
                        )}

                        {el.type === 'icon' && (() => {
                             const iconName = (el.content as string).split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
                             // @ts-ignore
                             const IconComp = LucideIcons[iconName] || LucideIcons[el.content as string] || LucideIcons.HelpCircle;
                             return (
                                 <div className="w-full h-full flex items-center justify-center">
                                     <IconComp 
                                        size={Math.min(el.width || 32, el.height || 32)} 
                                        color={el.textColor || el.color || 'currentColor'}
                                        strokeWidth={el.strokeWidth || 2}
                                     />
                                 </div>
                             );
                        })()}

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
