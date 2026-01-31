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

interface ElementRendererProps {
    element: SlideElement;
    fontSizeValue: any;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({ element, fontSizeValue }) => {
    switch (element.type) {
        case 'headline':
            return <motion.h1 className="leading-tight drop-shadow-md whitespace-pre-wrap w-full min-w-0 break-words" style={{ textAlign: element.textAlign, fontFamily: element.fontFamily || 'inherit', fontSize: fontSizeValue }}>{element.content}</motion.h1>;
        case 'subheadline':
            return <motion.p className="leading-snug drop-shadow-sm whitespace-pre-wrap w-full min-w-0 break-words" style={{ textAlign: element.textAlign, fontFamily: element.fontFamily || 'inherit', fontSize: fontSizeValue }}>{element.content}</motion.p>;
        case 'text':
            return (
                <motion.div className="leading-normal w-full max-w-none min-w-0 break-words" style={{ textAlign: element.textAlign, fontFamily: element.fontFamily || 'inherit', fontSize: fontSizeValue }}>
                    {element.textFormat === 'markdown' ? (
                        <ReactMarkdown 
                            components={useMemo(() => createMarkdownComponents('dark', element.fontFamily), [element.fontFamily])} 
                            remarkPlugins={[remarkBreaks]}
                        >
                            {element.content}
                        </ReactMarkdown>
                    ) : (
                        <div className="whitespace-pre-wrap">{element.content}</div>
                    )}
                </motion.div>
            );
        case 'image':
            return (
                <img 
                    src={(element.content && (element.content.startsWith('http') || element.content.startsWith('blob:'))) ? element.content : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'}
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
                            src={element.content}
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
                        {['rect', 'circle', 'square'].includes(element.content.toLowerCase()) ? '' : element.content}
                    </motion.span>
                </div>
            );
        case 'chart':
            const data = parseChartData(element.content);
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
                                    outerRadius="80%" 
                                    fill={element.color || "#8884d8"}
                                    label
                                >
                                    {data.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                {conf.showLegend !== false && <Legend iconSize={10} wrapperStyle={{ fontSize: '10px' }} />}
                                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                );
            }

            return (
                <div className="w-full h-full" style={{ fontFamily: element.fontFamily || 'Inter, sans-serif' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ChartComp data={data}>
                            {(conf.showGrid !== false) && <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#fff" />}
                            {(conf.showXAxis !== false) && <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />}
                            {(conf.showYAxis !== false) && <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />}
                            <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.1)' }} />
                            {(conf.showLegend !== false) && <Legend iconSize={10} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />}
                            {(() => {
                                const valueKeys = data.length > 0 ? Object.keys(data[0]).filter(k => k.startsWith('value')) : [];
                                return valueKeys.map((key, index) => {
                                    const color = index === 0 ? (element.color || COLORS[0]) : COLORS[index % COLORS.length];
                                    if (element.chartType === 'area') return <Area key={key} type="monotone" dataKey={key} stroke={color} fill={color} fillOpacity={0.3} />;
                                    if (element.chartType === 'line') return <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={3} dot={{r: 4}} />;
                                    return <Bar key={key} dataKey={key} fill={color} radius={[4, 4, 0, 0]} />;
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
                                {element.content || "Awesome Resource Name"}
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
                <div className="text-left w-full h-full">
                    {element.listType === 'decimal' ? (
                        <ol className="list-decimal list-inside" style={{ display: 'flex', flexDirection: 'column', gap: (element.listSpacing || 4), textAlign: (element.textAlign as any), fontFamily: 'inherit' }}>
                            {element.content.split('\n').map((item: string, i: number) => <li key={i} style={{ fontWeight: element.fontWeight, fontFamily: 'inherit' }}>{item}</li>)}
                        </ol>
                    ) : (
                        <ul className="list-disc list-inside" style={{ display: 'flex', flexDirection: 'column', gap: (element.listSpacing || 4), textAlign: (element.textAlign as any), fontFamily: 'inherit' }}>
                            {element.content.split('\n').map((item: string, i: number) => <li key={i} style={{ fontWeight: element.fontWeight, fontFamily: 'inherit' }}>{item}</li>)}
                        </ul>
                    )}
                </div>
            );
        default:
            return null;
    }
};
