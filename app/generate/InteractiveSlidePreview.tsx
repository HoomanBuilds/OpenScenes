'use client';

import React from 'react';
import { Slide, SlideElement } from './types';
import { motion, Variants, useMotionValue } from 'framer-motion';
import { 
    BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import * as LucideIcons from 'lucide-react';
import { parseChartData } from './utils';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F'];


export interface InteractiveSlidePreviewProps {
    slide: Slide;
    onClose: () => void;
    onUpdateElement: (slideId: string, elementId: string, newX: number, newY: number, changes?: Partial<SlideElement>) => void;
    onSelectElement?: (elementId: string | null, multi?: boolean) => void;
    selectedElementIds?: string[];
    // Single select ID for backward compat or we can just use the array
    selectedElementId?: string | null; 
    onAddElement?: (slideId: string, type: SlideElement['type'], position: { x: number, y: number }, preset?: string, content?: string) => void;
}

// Animation Variants Generator
const getAnimationVariants = (anim: SlideElement['animation'], targetOpacity: number = 1): Variants => {
    if (!anim || anim.type === 'none') {
        return {
            initial: { opacity: targetOpacity },
            animate: { opacity: targetOpacity }
        };
    }

    const duration = anim.duration || 1;
    const delay = anim.delay || 0;

    const transition = { duration, delay, ease: "easeOut" as const };

    switch (anim.type) {
        case 'fade':
            return {
                initial: { opacity: 0 },
                animate: { opacity: targetOpacity, transition },
            };
        case 'scale':
            return {
                initial: { opacity: 0, scale: 0.5 },
                animate: { opacity: targetOpacity, scale: 1, transition },
            };
        case 'pop':
            return {
                initial: { opacity: 0, scale: 0.8, y: 20 },
                animate: { opacity: targetOpacity, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20, delay } },
            };
        case 'slide':
            const dist = 50;
            const initial = 
                anim.direction === 'left' ? { x: dist } :
                anim.direction === 'right' ? { x: -dist } :
                anim.direction === 'down' ? { y: -dist } :
                { y: dist }; // default up
            return {
                initial: { opacity: 0, ...initial },
                animate: { opacity: targetOpacity, x: 0, y: 0, transition },
            };
        default:
            return {
                initial: { opacity: targetOpacity },
                animate: { opacity: targetOpacity }
            };
    }
};

// Extracted Draggable Component for isolated state management
const DraggableElement: React.FC<{
    element: SlideElement;
    slideId: string;
    isSelected: boolean;
    onUpdate: (slideId: string, elementId: string, x: number, y: number, changes?: Partial<SlideElement>) => void;
    onSelect: (id: string, multi: boolean) => void;
    onDrop?: (e: React.DragEvent, id: string) => void;
}> = ({ element, slideId, isSelected, onUpdate, onSelect, onDrop }) => {
    // 1. Separate Motion Values for Drag Transform (relative to position)
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // 2. Motion values for dimensions to enable smooth resizing
    const width = useMotionValue(element.width || 400);
    const height = useMotionValue(element.height || 300);
    const fontSize = useMotionValue(element.fontSize || 48);

    // Sync motion values when element props change
    React.useEffect(() => {
        width.set(element.width || 400);
        height.set(element.height || 300);
        fontSize.set(element.fontSize || 48);
    }, [element.width, element.height, element.fontSize]);

    const commonProps = {
        // 2. Bind strict Layout Position (Left/Top)
        style: { 
            left: element.x, 
            top: element.y,
            x, // Bind drag transform
            y, // Bind drag transform
            width: (element.type === 'headline' || element.type === 'subheadline' || element.type === 'list') ? 'auto' : width,
            height: (element.type === 'headline' || element.type === 'subheadline' || element.type === 'list' || element.type === 'icon') ? 'auto' : height,
            minWidth: (element.type === 'headline' || element.type === 'subheadline' || element.type === 'list') ? width : undefined,
            zIndex: element.zIndex,
            rotate: element.rotation,
            position: 'absolute' as const,
            color: element.type === 'shape' ? (element.textColor || '#ffffff') : (element.color || 'inherit'),
            fontSize: fontSize,
            fontWeight: element.fontWeight || 'normal',
            fontFamily: element.fontFamily || 'Inter, sans-serif',
            lineHeight: (element.type === 'headline' || element.type === 'subheadline' || element.type === 'text') ? 1 : (element.lineHeight || 1.5),
            textAlign: element.textAlign || 'left',
            backgroundColor: element.type === 'shape' ? (element.color || '#3b82f6') : undefined,
            borderRadius: element.type === 'shape' ? `${element.borderRadius || 0}px` : undefined,
            borderWidth: (element.type === 'shape' || element.type === 'image') ? (element.strokeWidth || 0) : undefined,
            borderColor: (element.type === 'shape' || element.type === 'image') ? (element.strokeColor || 'transparent') : undefined,
            borderStyle: (element.strokeWidth && element.strokeWidth > 0) ? 'solid' : 'none',
        },
        // 3. Animation Variants
        initial: "initial",
        animate: "animate",
        variants: getAnimationVariants(element.animation, element.opacity ?? 1),
        // 4. Drag Logic
        drag: true,
        dragMomentum: false, // Prevent sliding after release
        onDragEnd: () => {
            // Calculate Final Position relative to parent
            const finalX = element.x + x.get();
            const finalY = element.y + y.get();

            // 5. Update State
            onUpdate(slideId, element.id, finalX, finalY);

            // 6. Reset Transform
            x.set(0);
            y.set(0);
        },
        onDragOver: (e: React.DragEvent) => {
            if (element.type === 'image') {
                e.preventDefault();
                e.stopPropagation();
            }
        },
        onDrop: (e: React.DragEvent) => onDrop && onDrop(e, element.id),
        className: `cursor-grab active:cursor-grabbing group absolute ${isSelected ? 'ring-2 ring-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'hover:ring-1 hover:ring-white/30'}`,
    };


    return (
        <motion.div
            key={element.id}
            {...commonProps}
            data-element-id={element.id}
        >
            <div className={`
                relative transition-all duration-200 w-full h-full flex flex-col
                ${isSelected ? 'ring-2 ring-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'hover:ring-1 hover:ring-white/30'}
                ${element.type === 'chart' ? `rounded-xl p-4 border border-zinc-800 backdrop-blur-sm ${element.chartProps?.transparent ? 'bg-transparent border-transparent shadow-none' : 'bg-zinc-900/80'}` : ''}
                ${element.type === 'shape' ? 'shadow-lg' : ''} 
                ${(element.type === 'headline' || element.type === 'subheadline' || element.type === 'text' || element.type === 'list') ? '' : ''}
            `}
            style={{
                width: '100%', 
                height: '100%',
                borderRadius: element.type === 'image' ? (element.borderRadius ? `${element.borderRadius}px` : '12px') : undefined,
                overflow: element.type === 'image' ? 'hidden' : 'visible',
                alignItems: element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start',
                justifyContent: element.verticalAlign === 'center' ? 'center' : element.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start',
            }}
            >
                {/* Content Rendering */}
                {element.type === 'headline' && <h1 className="leading-tight drop-shadow-md whitespace-pre-wrap w-full" style={{ textAlign: element.textAlign }}>{element.content}</h1>}
                {element.type === 'subheadline' && <p className="leading-snug drop-shadow-sm whitespace-pre-wrap w-full" style={{ textAlign: element.textAlign }}>{element.content}</p>}
                {element.type === 'text' && (
                    <div className="leading-normal whitespace-pre-wrap w-full" style={{ textAlign: element.textAlign }}>
                        {element.textFormat === 'markdown' ? (
                            element.content.split('\n').map((line, i) => (
                                <div key={i} className="flex items-start mb-0.5">
                                    {line.startsWith('- ') ? (
                                        <>
                                            <span className="mr-2 mt-[0.6em] block h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                                            <span>{line.substring(2)}</span>
                                        </>
                                    ) : (
                                        <span>{line}</span>
                                    )}
                                </div>
                            ))
                        ) : (
                            element.content
                        )}
                    </div>
                )}
                
                {element.type === 'image' && (
                    <img 
                        src={(element.content && (element.content.startsWith('http') || element.content.startsWith('blob:'))) ? element.content : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'}
                        alt="slide-asset"
                        draggable={false}
                        className="w-full h-full select-none pointer-events-none"
                        style={{ 
                            objectFit: element.objectFit || 'cover',
                        }}
                    />
                )}
                {element.type === 'list' && (
                    <div className="w-full" style={{ textAlign: element.textAlign }}>
                        {element.listType === 'decimal' ? (
                            <ol className="list-decimal list-inside" style={{ display: 'flex', flexDirection: 'column', gap: element.listSpacing ? `${element.listSpacing}px` : '4px', textAlign: element.textAlign }}>
                                {element.content.split('\n').map((item, i) => <li key={i} style={{ fontWeight: element.fontWeight }}>{item}</li>)}
                            </ol>
                        ) : (
                            <ul className="list-disc list-inside" style={{ display: 'flex', flexDirection: 'column', gap: element.listSpacing ? `${element.listSpacing}px` : '4px', textAlign: element.textAlign }}>
                                {element.content.split('\n').map((item, i) => <li key={i} style={{ fontWeight: element.fontWeight }}>{item}</li>)}
                            </ul>
                        )}
                    </div>
                )}

                {element.type === 'link-preview' && (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-500">Link Preview</div>
                )}

                {element.type === 'icon' && (
                    <div className="w-full h-full flex items-center justify-center">
                        {(() => {
                            const iconName = element.content
                                .split('-')
                                .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                                .join('');
                            const Icon = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
                            return <Icon size={element.fontSize || 48} color={element.color || 'currentColor'} strokeWidth={2} />;
                        })()}
                    </div>
                )}

                {element.type === 'shape' && (
                    <div className="w-full h-full flex items-center justify-center p-4 text-center break-words select-none pointer-events-none">
                        <span style={{ fontSize: fontSize as any }}>
                            {['rect', 'circle', 'square'].includes(element.content.toLowerCase()) ? '' : element.content}
                        </span>
                    </div>
                )}
                
                {element.type === 'chart' && (
                    <div className="w-full h-full" style={{ fontFamily: element.fontFamily || 'Inter, sans-serif' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            {(() => {
                                const data = parseChartData(element.content);
                                const conf = element.chartProps || {};
                                const ChartComp = element.chartType === 'line' ? LineChart : 
                                                  element.chartType === 'area' ? AreaChart : 
                                                  element.chartType === 'pie' ? PieChart : BarChart;

                                if (element.chartType === 'pie') {
                                    return (
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
                                    )
                                }

                                return (
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
                                        
                                        if (element.chartType === 'area') {
                                            return <Area key={key} type="monotone" dataKey={key} stroke={color} fill={color} fillOpacity={0.3} />;
                                        }
                                        if (element.chartType === 'line') {
                                            return <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={3} dot={{r: 4}} />;
                                        }
                                        return <Bar key={key} dataKey={key} fill={color} radius={[4, 4, 0, 0]} />;
                                    });
                                })()}
                                    </ChartComp>
                                );
                            })()}
                        </ResponsiveContainer>
                    </div>
                )}

                </div>
            
            {/* Visual Resize Handles (Show if selected) - Outside overflow container */}
            {isSelected && (
                <div className="absolute inset-0 pointer-events-none ring-2 ring-purple-500/50">
                    {/* Top Left */}
                    <motion.div 
                        className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-purple-600 rounded-full shadow-lg pointer-events-auto cursor-nwse-resize z-[100]"
                        onPointerDown={(e) => e.stopPropagation()}
                        whileHover={{ scale: 1.3 }}
                        whileTap={{ scale: 0.9 }}
                        drag dragMomentum={false} dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }}
                        onDrag={(e, info) => {
                            const dx = info.offset.x;
                            const dy = info.offset.y;
                            const newW = Math.max(20, (element.width || 400) - dx);
                            const newH = Math.max(20, (element.height || 300) - dy);
                            x.set(dx); y.set(dy);
                            width.set(newW); height.set(newH);
                            if (element.type === 'shape') {
                                fontSize.set(Math.max(12, Math.round(newH * 0.3)));
                            } else if (element.type === 'list') {
                                fontSize.set(Math.max(8, Math.round((element.fontSize || 24) * (newH / (element.height || 100)))));
                            } else if (element.type === 'icon') {
                                fontSize.set(Math.max(8, Math.round((element.fontSize || 48) * (newW / (element.width || 400)))));
                            }
                        }}
                        onDragEnd={() => {
                            onUpdate(slideId, element.id, element.x + x.get(), element.y + y.get(), {
                                width: width.get(), height: height.get(), fontSize: fontSize.get()
                            });
                            x.set(0); y.set(0);
                        }}
                    />
                    {/* Top Right */}
                    <motion.div 
                        className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-purple-600 rounded-full shadow-lg pointer-events-auto cursor-nesw-resize z-[100]"
                        onPointerDown={(e) => e.stopPropagation()}
                        whileHover={{ scale: 1.3 }}
                        whileTap={{ scale: 0.9 }}
                        drag dragMomentum={false} dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }}
                        onDrag={(e, info) => {
                            const dy = info.offset.y;
                            const newW = Math.max(20, (element.width || 400) + info.offset.x);
                            const newH = Math.max(20, (element.height || 300) - dy);
                            y.set(dy); width.set(newW); height.set(newH);
                            if (element.type === 'shape') {
                                fontSize.set(Math.max(12, Math.round(newH * 0.3)));
                            } else if (element.type === 'list') {
                                fontSize.set(Math.max(8, Math.round((element.fontSize || 24) * (newH / (element.height || 100)))));
                            } else if (element.type === 'icon') {
                                fontSize.set(Math.max(8, Math.round((element.fontSize || 48) * (newW / (element.width || 400)))));
                            }
                        }}
                        onDragEnd={() => {
                            onUpdate(slideId, element.id, element.x, element.y + y.get(), {
                                width: width.get(), height: height.get(), fontSize: fontSize.get()
                            });
                            y.set(0);
                        }}
                    />
                    {/* Bottom Left */}
                    <motion.div 
                        className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-purple-600 rounded-full shadow-lg pointer-events-auto cursor-nesw-resize z-[100]"
                        onPointerDown={(e) => e.stopPropagation()}
                        whileHover={{ scale: 1.3 }}
                        whileTap={{ scale: 0.9 }}
                        drag dragMomentum={false} dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }}
                        onDrag={(e, info) => {
                            const dx = info.offset.x;
                            const newW = Math.max(20, (element.width || 400) - dx);
                            const newH = Math.max(20, (element.height || 300) + info.offset.y);
                            x.set(dx); width.set(newW); height.set(newH);
                            if (element.type === 'shape') {
                                fontSize.set(Math.max(12, Math.round(newH * 0.3)));
                            } else if (element.type === 'list') {
                                fontSize.set(Math.max(8, Math.round((element.fontSize || 24) * (newH / (element.height || 100)))));
                            } else if (element.type === 'icon') {
                                fontSize.set(Math.max(8, Math.round((element.fontSize || 48) * (newW / (element.width || 400)))));
                            }
                        }}
                        onDragEnd={() => {
                            onUpdate(slideId, element.id, element.x + x.get(), element.y, {
                                width: width.get(), height: height.get(), fontSize: fontSize.get()
                            });
                            x.set(0);
                        }}
                    />
                    {/* Bottom Right */}
                    <motion.div 
                        className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-purple-600 rounded-full shadow-lg pointer-events-auto cursor-nwse-resize z-[100]"
                        onPointerDown={(e) => e.stopPropagation()}
                        whileHover={{ scale: 1.3 }}
                        whileTap={{ scale: 0.9 }}
                        drag dragMomentum={false} dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }}
                        onDrag={(e, info) => {
                            const dx = info.offset.x;
                            const dy = info.offset.y;
                            const newW = Math.max(20, (element.width || 400) + dx);
                            const newH = Math.max(20, (element.height || 300) + dy);
                            width.set(newW); height.set(newH);
                            if (element.type === 'shape') {
                                fontSize.set(Math.max(12, Math.round(newH * 0.3)));
                            } else if (element.type === 'list') {
                                fontSize.set(Math.max(8, Math.round((element.fontSize || 24) * (newH / (element.height || 100)))));
                            } else if (element.type === 'icon') {
                                fontSize.set(Math.max(8, Math.round((element.fontSize || 48) * (newW / (element.width || 400)))));
                            }
                        }}
                        onDragEnd={() => {
                            onUpdate(slideId, element.id, element.x, element.y, {
                                width: width.get(), height: height.get(), fontSize: fontSize.get()
                            });
                        }}
                    />
                </div>
            )}
        </motion.div>
    );
};

const InteractiveSlidePreview: React.FC<InteractiveSlidePreviewProps> = ({ 
    slide, 
    onClose,
    onUpdateElement,
    onSelectElement,
    selectedElementIds = [],
    selectedElementId, 
    onAddElement
}) => {
    const elements = slide.elements || [];

    // Helper to check selection
    const isSelected = (id: string) => selectedElementIds.includes(id) || selectedElementId === id;

    // --- Drop Handlers ---
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDropOnCanvas = (e: React.DragEvent) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;

        try {
            const payload = JSON.parse(data);
            
            // Get Drop Coordinates relative to Canvas
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (payload.type === 'component') {
                if (onAddElement) {
                    onAddElement(slide.id, payload.componentType, { x, y }, payload.preset);
                }
            } else if (payload.type === 'asset' && payload.payload?.type === 'image') {
                if (onAddElement) {
                    onAddElement(slide.id, 'image', { x, y }, undefined, payload.payload.url);
                }
            }
        } catch (err) {
            console.error('Drop Error', err);
        }
    };

    const handleDropOnElement = (e: React.DragEvent, elementId: string) => {
        e.preventDefault();
        e.stopPropagation(); 
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;

        try {
            const payload = JSON.parse(data);
            if (payload.type === 'asset' && payload.payload?.url) {
                const targetEl = elements.find(el => el.id === elementId);
                if (targetEl && targetEl.type === 'image') {
                     onUpdateElement(slide.id, elementId, targetEl.x, targetEl.y, { content: payload.payload.url });
                }
            }
        } catch (err) {
            console.error('Drop Element Error', err);
        }
    };


    const handlePointerDownCanvas = (e: React.PointerEvent) => {
        if (e.button !== 0) return;
        
        // Find if we clicked an element (or a child of an element)
        const target = e.target as HTMLElement;
        const elContainer = target.closest('[data-element-id]');
        
        if (elContainer) {
            const id = elContainer.getAttribute('data-element-id');
            if (id) {
                // Don't stop propagation yet, because Framer Motion might need it to start the drag
                // But do trigger selection
                onSelectElement && onSelectElement(id, e.shiftKey);
                return;
            }
        }
        
        // If we didn't click an element, deselect
        onSelectElement && onSelectElement(null);
    };

    return (
        <div className="h-full w-full flex items-center justify-center p-8 bg-zinc-950/80 backdrop-blur-sm" onPointerDown={handlePointerDownCanvas}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                onDragOver={handleDragOver}
                onDrop={handleDropOnCanvas}
                className="relative w-full max-w-5xl aspect-video bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 group/canvas"
                style={{
                    background: slide.background?.type === 'gradient' ? slide.background.value :
                                slide.background?.type === 'color' ? slide.background.value :
                                '#18181b' // Fallback
                }}
            >
                {/* Background Image Rendering */}
                {slide.background?.type === 'image' && (
                    <div className="absolute inset-0 z-0" style={{
                        backgroundImage: `url(${slide.background.value})`,
                        backgroundSize: slide.background.props?.size || 'cover',
                        backgroundPosition: slide.background.props?.position || 'center',
                        backgroundRepeat: slide.background.props?.repeat || 'no-repeat',
                    }}>
                        {/* We use div background instead of img for better control over repeat/size */}
                        <div className="absolute inset-0 bg-black/20" /> {/* Dimmer */}
                    </div>
                )}

                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full bg-black/50 hover:bg-black text-white backdrop-blur-md transition-all z-50 hover:scale-110 active:scale-95"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>

                {/* Interactive Canvas Area */}
                <div className="absolute inset-0 overflow-hidden z-20">
                    {/* Grid (Conditional Visibility based on BG? Keep standard for now) */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay" 
                         style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} 
                    />

                    {elements.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                            <p className="text-white/50 font-mono mb-2">Canvas is empty</p>
                        </div>
                    ) : (
                        elements.map((el) => (
                            <DraggableElement
                                key={el.id}
                                element={el}
                                slideId={slide.id}
                                isSelected={isSelected(el.id)}
                                onUpdate={onUpdateElement}
                                onSelect={(id, multi) => onSelectElement && onSelectElement(id, multi)}
                                onDrop={handleDropOnElement}
                            />
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default InteractiveSlidePreview;




