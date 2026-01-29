'use client';

import React from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { 
    BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import * as LucideIcons from 'lucide-react';
import { SlideElement } from './types';
import { getAnimationVariants, COLORS } from './InteractiveSlidePreview_Utils';
import { parseChartData } from './utils';

// --- Sub-Component: Content Renderer ---
const ElementContent: React.FC<{ element: SlideElement }> = ({ element }) => {
    switch (element.type) {
        case 'headline':
            return <h1 className="leading-tight drop-shadow-md whitespace-pre-wrap w-full" style={{ textAlign: element.textAlign }}>{element.content}</h1>;
        case 'subheadline':
            return <p className="leading-snug drop-shadow-sm whitespace-pre-wrap w-full" style={{ textAlign: element.textAlign }}>{element.content}</p>;
        case 'text':
            return <div className="leading-normal whitespace-pre-wrap w-full" style={{ textAlign: element.textAlign }}>{element.content}</div>;
        case 'image':
            return (
                <div className="w-full h-full overflow-hidden" style={{ borderRadius: element.borderRadius ? `${element.borderRadius}px` : '12px' }}>
                    <img 
                        src={(element.content && (element.content.startsWith('http') || element.content.startsWith('blob:'))) ? element.content : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'}
                        alt="slide-asset"
                        draggable={false}
                        className="w-full h-full select-none pointer-events-none"
                        style={{ objectFit: element.objectFit || 'cover' }}
                    />
                </div>
            );
        case 'list':
            const items = element.content.split('\n').filter(Boolean);
            const ListTag = element.listType === 'decimal' ? 'ol' : 'ul';
            return (
                <div className="w-full" style={{ textAlign: element.textAlign }}>
                    <ListTag 
                        className={element.listType === 'decimal' ? 'list-decimal list-inside' : 'list-disc list-inside'} 
                        style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: element.listSpacing ? `${element.listSpacing}px` : '4px', 
                            textAlign: element.textAlign 
                        }}
                    >
                        {items.map((item, i) => <li key={i} style={{ fontWeight: element.fontWeight }}>{item}</li>)}
                    </ListTag>
                </div>
            );
        case 'icon':
            const iconName = element.content
                .split('-')
                .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                .join('');
            const Icon = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <Icon size="100%" color={element.color || 'currentColor'} strokeWidth={2} />
                </div>
            );
        case 'chart':
            const data = parseChartData(element.content);
            const conf = element.chartProps || {};
            const ChartComp = element.chartType === 'line' ? LineChart : 
                                element.chartType === 'area' ? AreaChart : 
                                element.chartType === 'pie' ? PieChart : BarChart;

            return (
                <div className="w-full h-full" style={{ fontFamily: element.fontFamily || 'Inter, sans-serif' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        {element.chartType === 'pie' ? (
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
                        ) : (
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
                        )}
                    </ResponsiveContainer>
                </div>
            );
        default:
            return null;
    }
};

// --- Main Component ---
export const DraggableElement: React.FC<{
    element: SlideElement;
    slideId: string;
    isSelected: boolean;
    onUpdate: (slideId: string, elementId: string, x: number, y: number, changes?: Partial<SlideElement>) => void;
    onSelect: (id: string, multi: boolean) => void;
    onDrop?: (e: React.DragEvent, id: string) => void;
}> = ({ element, slideId, isSelected, onUpdate, onSelect, onDrop }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const width = useMotionValue(element.width || 400);
    const height = useMotionValue(element.height || 300);
    const fontSize = useMotionValue(element.fontSize || 24);

    React.useEffect(() => {
        width.set(element.width || 400);
        height.set(element.height || 300);
        fontSize.set(element.fontSize || 24);
    }, [element.width, element.height, element.fontSize]);

    const handleResize = (dx: number, dy: number, type: 'tl' | 'tr' | 'bl' | 'br') => {
        let newW = element.width || 400;
        let newH = element.height || 300;
        let offX = 0;
        let offY = 0;

        if (type.includes('l')) {
            newW = Math.max(20, (element.width || 400) - dx);
            offX = dx;
        } else {
            newW = Math.max(20, (element.width || 400) + dx);
        }

        if (type.includes('t')) {
            newH = Math.max(20, (element.height || 300) - dy);
            offY = dy;
        } else {
            newH = Math.max(20, (element.height || 300) + dy);
        }

        width.set(newW);
        height.set(newH);
        x.set(offX);
        y.set(offY);

        // Scaling logic
        if (['headline', 'subheadline', 'text'].includes(element.type)) {
            // Text boxes usually scale 1:1 with height for clarity in the editor
            fontSize.set(newH);
        } else if (element.type === 'list') {
            // PROPORTIONAL scaling for lists to avoid jumping
            const ratio = newH / (element.height || 100);
            fontSize.set(Math.max(8, Math.round((element.fontSize || 24) * ratio)));
        } else if (element.type === 'icon') {
            // Icons scale by width/height whichever is dominant or proportional
            const ratio = Math.min(newW / (element.width || 100), newH / (element.height || 100));
            fontSize.set(Math.max(8, Math.round((element.fontSize || 48) * ratio)));
        }
    };

    const handleResizeEnd = (offX: number, offY: number) => {
        onUpdate(slideId, element.id, element.x + offX, element.y + offY, {
            width: width.get(),
            height: height.get(),
            fontSize: fontSize.get(),
        });
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            style={{
                left: element.x,
                top: element.y,
                x, y,
                width: (element.type === 'headline' || element.type === 'subheadline' || element.type === 'list') ? 'auto' : width,
                height: (element.type === 'headline' || element.type === 'subheadline' || element.type === 'list' || element.type === 'icon') ? 'auto' : height,
                minWidth: (element.type === 'headline' || element.type === 'subheadline' || element.type === 'list') ? width : undefined,
                zIndex: element.zIndex,
                rotate: element.rotation,
                position: 'absolute',
                color: element.color || 'inherit',
                fontSize: fontSize,
                fontWeight: element.fontWeight || 'normal',
                fontFamily: element.fontFamily || 'Inter, sans-serif',
                textAlign: element.textAlign || 'left',
                backgroundColor: element.type === 'shape' ? (element.color || '#3b82f6') : undefined,
                borderRadius: element.type === 'shape' ? `${element.borderRadius || 0}px` : undefined,
                borderWidth: (element.type === 'shape' || element.type === 'image') ? (element.strokeWidth || 0) : undefined,
                borderColor: (element.type === 'shape' || element.type === 'image') ? (element.strokeColor || 'transparent') : undefined,
                borderStyle: (element.strokeWidth && element.strokeWidth > 0) ? 'solid' : 'none',
                opacity: element.opacity ?? 1,
            }}
            drag
            dragMomentum={false}
            onDragEnd={() => {
                onUpdate(slideId, element.id, element.x + x.get(), element.y + y.get());
                x.set(0); y.set(0);
            }}
            onTap={(e: any) => {
                e.stopPropagation?.();
                onSelect(element.id, e.shiftKey);
            }}
            variants={getAnimationVariants(element.animation, element.opacity ?? 1)}
            initial="initial"
            animate="animate"
            onDragOver={(e: React.DragEvent) => { if (element.type === 'image') { e.preventDefault(); e.stopPropagation(); } }}
            onDrop={(e: React.DragEvent) => onDrop && onDrop(e, element.id)}
            className={`cursor-grab active:cursor-grabbing group ${isSelected ? 'ring-2 ring-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'hover:ring-1 hover:ring-white/30'}`}
        >
            <div className={`
                relative w-full h-full flex flex-col items-start
                ${element.type === 'chart' ? `rounded-xl p-4 border border-zinc-800 backdrop-blur-sm ${element.chartProps?.transparent ? 'bg-transparent border-transparent shadow-none' : 'bg-zinc-900/80'}` : ''}
                ${(element.type === 'headline' || element.type === 'subheadline' || element.type === 'text' || element.type === 'list') ? 'justify-center' : ''}
            `}
            style={{
                alignItems: element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start',
            }}
            >
                <ElementContent element={element} />
            </div>

            {/* Resize Handles - Rendered outside the overflow-hidden container if any */}
            {isSelected && (
                <>
                    {[
                        { pos: '-top-1.5 -left-1.5', cursor: 'nwse-resize', type: 'tl' },
                        { pos: '-top-1.5 -right-1.5', cursor: 'nesw-resize', type: 'tr' },
                        { pos: '-bottom-1.5 -left-1.5', cursor: 'nesw-resize', type: 'bl' },
                        { pos: '-bottom-1.5 -right-1.5', cursor: 'nwse-resize', type: 'br' },
                    ].map((h) => (
                        <motion.div
                            key={h.type}
                            className={`absolute ${h.pos} w-3 h-3 bg-white border-2 border-purple-600 rounded-full shadow-lg pointer-events-auto z-[100]`}
                            style={{ cursor: h.cursor }}
                            drag dragMomentum={false} dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }}
                            onPointerDown={(e) => e.stopPropagation()}
                            onDrag={(e, info) => handleResize(info.offset.x, info.offset.y, h.type as any)}
                            onDragEnd={() => handleResizeEnd(x.get(), y.get())}
                            whileHover={{ scale: 1.3 }}
                            whileTap={{ scale: 0.9 }}
                        />
                    ))}
                </>
            )}
        </motion.div>
    );
};
