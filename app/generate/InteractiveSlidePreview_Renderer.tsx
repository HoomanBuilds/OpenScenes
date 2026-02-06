'use client';

import React, { useMemo } from 'react';
import { SlideElement } from './types';
import { motion, MotionValue } from 'framer-motion';
import { 
    BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import * as LucideIcons from 'lucide-react';
import { parseChartData } from './utils';
import { COLORS } from './InteractiveSlidePreview_Utils';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { createMarkdownComponents } from './markdownConfig';
import { CustomComponentRenderer } from './renderers/CustomComponentRenderer';

interface ElementRendererProps {
    element: SlideElement;
    fontSizeValue: any;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({ element, fontSizeValue }) => {
    switch (element.type) {
        case 'headline':
            return <motion.h1 className="leading-[1.1] drop-shadow-md whitespace-pre-wrap w-full min-w-0 break-words text-balance" style={{ textAlign: element.textAlign, fontFamily: element.fontFamily || 'inherit', fontSize: fontSizeValue, color: element.textColor || element.color, lineHeight: element.lineHeight, fontWeight: element.fontWeight }}>{element.content as string}</motion.h1>;
        case 'subheadline':
            return <motion.p className="leading-snug drop-shadow-sm whitespace-pre-wrap w-full min-w-0 break-words text-balance opacity-90" style={{ textAlign: element.textAlign, fontFamily: element.fontFamily || 'inherit', fontSize: fontSizeValue, color: element.textColor || element.color, lineHeight: element.lineHeight, fontWeight: element.fontWeight }}>{element.content as string}</motion.p>;
        case 'text':
            return (
                <motion.div className="leading-relaxed w-full max-w-none min-w-0 break-words drop-shadow-sm text-pretty" style={{ textAlign: element.textAlign, fontFamily: element.fontFamily || 'inherit', fontSize: fontSizeValue, color: element.textColor || element.color, lineHeight: element.lineHeight, fontWeight: element.fontWeight }}>
                    {element.textFormat === 'markdown' ? (
                        <ReactMarkdown 
                            components={useMemo(() => createMarkdownComponents('dark', element.fontFamily, element.textColor || element.color), [element.fontFamily, element.textColor, element.color])} 
                            remarkPlugins={[remarkBreaks]}
                        >
                            {element.content as string}
                        </ReactMarkdown>
                    ) : (
                        <div className="whitespace-pre-wrap">{element.content as string}</div>
                    )}
                </motion.div>
            );
        case 'image':
            return (
                <img 
                    src={(element.content && (element.content.startsWith('http') || element.content.startsWith('blob:'))) ? element.content.toString() : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'}
                    alt="slide-asset"
                    draggable={false}
                    className="w-full h-full select-none pointer-events-none"
                    style={{ objectFit: element.objectFit || 'cover' }}
                />
            );
        case 'video':
            return (
                <div className="w-full h-full overflow-hidden" style={{ borderRadius: element.borderRadius ? `${element.borderRadius}px` : '12px' }}>
                    {element.content ? (
                        <video 
                            src={element.content as string}
                            autoPlay
                            muted
                            loop
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center space-y-2 border-2 border-dashed border-zinc-800">
                            <LucideIcons.Video className="w-8 h-8 text-zinc-700" />
                            <span className="text-zinc-700 text-xs font-medium">Video Placeholder</span>
                        </div>
                    )}
                </div>
            );
        case 'shape':
            return (
                <div className="w-full h-full flex items-center justify-center p-4 text-center break-words select-none pointer-events-none">
                    <motion.span style={{ fontSize: fontSizeValue }}>
                        {['rect', 'circle', 'square'].includes(element.content.toLowerCase()) ? '' : element.content as string}
                    </motion.span>
                </div>
            );
        case 'chart':
            const data = parseChartData(element.content as string);
            const conf = element.chartProps || {};
            const ChartComp = element.chartType === 'line' ? LineChart : 
                                element.chartType === 'area' ? AreaChart : 
                                element.chartType === 'pie' ? PieChart : BarChart;

            if (element.chartType === 'pie') {
                return (
                    <div className="w-full h-full" style={{ fontFamily: element.fontFamily || 'Inter, sans-serif' }}>
                        <ResponsiveContainer width="100%" height="100%">
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
                                    fill={element.color || "#3b82f6"}
                                    label
                                    stroke="none"
                                >
                                    {data.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={conf.colors?.[index % (conf.colors?.length || 1)] || COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                {conf.showLegend !== false && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', fontFamily: 'Inter', opacity: 0.8 }} verticalAlign="bottom" height={36} />}
                                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff', borderRadius: '8px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                );
            }

            return (
                <div className="w-full h-full" style={{ fontFamily: element.fontFamily || 'Inter, sans-serif' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ChartComp data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            {(conf.showGrid !== false) && <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#fff" vertical={false} />}
                            {(conf.showXAxis !== false) && <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} dy={10} />}
                            {(conf.showYAxis !== false) && <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} dx={-10} />}
                            <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff', borderRadius: '8px' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                            {(conf.showLegend !== false) && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', fontFamily: 'Inter', opacity: 0.8, paddingTop: '10px' }} />}
                            {(() => {
                                const valueKeys = data.length > 0 ? Object.keys(data[0]).filter(k => k.startsWith('value')) : [];
                                return valueKeys.map((key, index) => {
                                    const color = conf.colors?.[index % (conf.colors?.length || 1)] || (index === 0 ? (element.color || COLORS[0]) : COLORS[index % COLORS.length]);
                                    
                                    if (element.chartType === 'area') {
                                        return (
                                            <defs key={`defs-${key}`}>
                                                <linearGradient id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                                                </linearGradient>
                                                <Area key={key} type="monotone" dataKey={key} stroke={color} fill={`url(#gradient-${key})`} strokeWidth={3} isAnimationActive={true} animationDuration={1000} />
                                            </defs>
                                        );
                                    }
                                    if (element.chartType === 'line') return <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={3} dot={{ r: 4, strokeWidth: 0, fill: color }} activeDot={{ r: 6 }} isAnimationActive={true} animationDuration={1000} />;
                                    return <Bar key={key} dataKey={key} fill={color} radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={1000} />;
                                });
                            })()}
                        </ChartComp>
                    </ResponsiveContainer>
                </div>
            );
        case 'link-preview':
            return (
                <div className="w-full h-full bg-zinc-900/90 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
                    <div className="h-2/5 bg-zinc-800 relative flex items-center justify-center">
                        <LucideIcons.Globe className="w-8 h-8 text-zinc-600" />
                        <div className="absolute top-2 right-2 bg-zinc-900/80 px-2 py-0.5 rounded text-[10px] text-zinc-400 font-mono">
                            HTTP 200
                        </div>
                    </div>
                    <div className="flex-1 p-3 flex flex-col justify-between">
                        <div>
                            <div className="text-sm font-bold text-white truncate mb-1">
                                {element.content as string || "Awesome Resource Name"}
                            </div>
                            <div className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed opacity-80">
                                This is a simulated preview of the link provided. It includes metadata, a cover image, and description extracted from the URL.
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 pt-2 border-t border-zinc-800/50 mt-2">
                            <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <LucideIcons.ExternalLink className="w-2.5 h-2.5 text-blue-400" />
                            </div>
                            <span className="text-[9px] text-zinc-500 font-mono truncate lowercase">
                                {element.content?.replace(/https?:\/\//, '') || "example.com/resource"}
                            </span>
                        </div>
                    </div>
                </div>
            );
        case 'list':
            return (
                <div className="text-left w-full h-full" style={{ color: element.textColor || element.color }}>
                    {element.listType === 'decimal' ? (
                        <ol className="list-decimal list-inside" style={{ display: 'flex', flexDirection: 'column', gap: (element.listSpacing || 4), textAlign: (element.textAlign as any), fontFamily: 'inherit' }}>
                            {element.content.split('\n').map((item: string, i: number) => <li key={i} style={{ fontWeight: element.fontWeight, fontFamily: 'inherit', color: 'inherit' }}>{item}</li>)}
                        </ol>
                    ) : (
                        <ul className="list-disc list-inside" style={{ display: 'flex', flexDirection: 'column', gap: (element.listSpacing || 4), textAlign: (element.textAlign as any), fontFamily: 'inherit' }}>
                            {element.content.split('\n').map((item: string, i: number) => <li key={i} style={{ fontWeight: element.fontWeight, fontFamily: 'inherit', color: 'inherit' }}>{item}</li>)}
                        </ul>
                    )}
                </div>
            );
        case 'custom':
            return (
                <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                    <CustomComponentRenderer content={element.content} scale={1} />
                </div>
            );
        default:
            return null;
    }
};
