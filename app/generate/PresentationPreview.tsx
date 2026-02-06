'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Slide, SlideElement } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { resolveElementValues } from './valueKeywords';
import { ElementRenderer } from './InteractiveSlidePreview_Renderer';

interface PresentationPreviewProps {
    slides: Slide[];
    onClose: () => void;
}

type TransitionType = 'fade' | 'slide' | 'zoom' | 'flip' | 'none';

const transitionVariants: Record<TransitionType, { initial: any; animate: any; exit: any }> = {
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
    },
    slide: {
        initial: { x: '100%', opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: '-100%', opacity: 0 }
    },
    zoom: {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 1.1, opacity: 0 }
    },
    flip: {
        initial: { rotateY: 90, opacity: 0 },
        animate: { rotateY: 0, opacity: 1 },
        exit: { rotateY: -90, opacity: 0 }
    },
    none: {
        initial: {},
        animate: {},
        exit: {}
    }
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F'];

const AnimatedElement: React.FC<{ element: SlideElement; slideKey: string }> = ({ element, slideKey }) => {
    const el = resolveElementValues(element) as SlideElement;
    const anim = el.animation;
    
    const getAnimationVariants = () => {
        const type = anim?.type || 'fade';
        const duration = Number(anim?.duration) || 0.6;
        const delay = Number(anim?.delay) || 0;
        
        const ease = 'linear';
        
        switch (type) {
            case 'fade':
                return {
                    initial: { opacity: 0 },
                    animate: { opacity: el.opacity ?? 1, transition: { duration, delay, ease } }
                };
            case 'slide':
                const dir = anim?.direction || 'left';
                const offset = 100;
                const x = dir === 'left' ? -offset : dir === 'right' ? offset : 0;
                const y = dir === 'up' ? -offset : dir === 'down' ? offset : 0;
                return {
                    initial: { opacity: 0, x, y },
                    animate: { opacity: el.opacity ?? 1, x: 0, y: 0, transition: { duration, delay, ease } }
                };
            case 'scale':
                return {
                    initial: { opacity: 0, scale: 0.5 },
                    animate: { opacity: el.opacity ?? 1, scale: 1, transition: { duration, delay, ease } }
                };
            case 'pop':
                return {
                    initial: { opacity: 0, scale: 0.3 },
                    animate: { 
                        opacity: el.opacity ?? 1, 
                        scale: [0.3, 1.1, 1], 
                        transition: { 
                            duration, 
                            delay, 
                            times: [0, 0.6, 1],
                            ease: 'linear'
                        } 
                    }
                };
            default:
                return {
                    initial: { opacity: 0 },
                    animate: { opacity: el.opacity ?? 1, transition: { duration: 0.3, delay, ease } }
                };
        }
    };
    
    const variants = getAnimationVariants();
    
    const renderContent = () => {
        return <ElementRenderer element={el} fontSizeValue={el.fontSize || 16} />;
    };
    
    return (
        <motion.div
            key={`${slideKey}-${el.id}`}
            initial={variants.initial}
            animate={variants.animate as any}
            className={`absolute ${el.type === 'image' ? 'rounded-lg overflow-hidden' : ''} ${el.type === 'chart' ? (el.chartProps?.transparent ? 'p-2' : 'bg-zinc-900/80 rounded-lg p-2 border border-zinc-800') : ''}`}
            style={{
                left: el.x,
                top: el.y,
                width: el.width ? el.width : 'auto',
                height: el.height ? el.height : 'auto',
                zIndex: el.zIndex || 1,
                transform: `rotate(${el.rotation || 0}deg)`,
                
                color: el.textColor || el.color || 'inherit',
                fontSize: el.fontSize || 16,
                fontWeight: el.fontWeight || 'normal',
                fontFamily: el.fontFamily ? `${el.fontFamily}, sans-serif` : 'Inter, sans-serif',
                lineHeight: el.lineHeight || 1.5,
                textAlign: (el.textAlign as any) || 'left',
                backgroundColor: el.type === 'shape' ? (el.color || '#3b82f6') : undefined,
                borderRadius: (el.type === 'shape' || el.type === 'image') ? `${el.borderRadius || 0}px` : undefined,
                borderWidth: (el.type === 'shape' || el.type === 'image') ? (el.strokeWidth || 0) : undefined,
                borderColor: (el.type === 'shape' || el.type === 'image') ? (el.strokeColor || 'transparent') : undefined,
                borderStyle: ((el.strokeWidth || 0) > 0) ? 'solid' : 'none',
                whiteSpace: el.type === 'custom' ? 'normal' : 'pre-wrap',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: el.verticalAlign === 'center' ? 'center' : el.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start',
                alignItems: (el.textAlign as any) === 'center' ? 'center' : (el.textAlign as any) === 'right' ? 'flex-end' : 'flex-start',
            }}
        >
            <div style={{ width: '100%', height: '100%' }}>
                {renderContent()}
            </div>
        </motion.div>
    );
};

const PresentationPreview: React.FC<PresentationPreviewProps> = ({ slides, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [slideKey, setSlideKey] = useState(0);
    
    const currentSlide = slides[currentIndex];
    const durationRef = useRef((currentSlide?.duration || 5000));
    
    useEffect(() => {
        durationRef.current = (currentSlide?.duration || 5000);
    }, [currentSlide]);

    const goToNext = useCallback(() => {
        if (currentIndex < slides.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setProgress(0);
            setSlideKey(prev => prev + 1);
        } else {
            setIsPlaying(false);
        }
    }, [currentIndex, slides.length]);

    const goToPrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setProgress(0);
            setSlideKey(prev => prev + 1);
        }
    }, [currentIndex]);

    const restart = useCallback(() => {
        setCurrentIndex(0);
        setProgress(0);
        setIsPlaying(true);
        setSlideKey(prev => prev + 1);
    }, []);

    useEffect(() => {
        if (!isPlaying || !currentSlide) return;

        const interval = 50;
        let accumulated = 0;
        
        const timer = setInterval(() => {
            accumulated += interval;
            const currentDuration = durationRef.current;
            const newProgress = (accumulated / currentDuration) * 100;
            
            if (newProgress >= 100) {
                setProgress(100);
                setTimeout(() => goToNext(), 50);
                clearInterval(timer);
            } else {
                setProgress(newProgress);
            }
        }, interval);

        return () => clearInterval(timer);
    }, [isPlaying, currentIndex, slideKey, goToNext, currentSlide]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === ' ') {
                e.preventDefault();
                setIsPlaying(p => !p);
            }
            if (e.key === 'ArrowRight') { goToNext(); }
            if (e.key === 'ArrowLeft') { goToPrev(); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, goToNext, goToPrev]);

    const [containerScale, setContainerScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                const scaleX = clientWidth / 1000;
                const scaleY = clientHeight / 563;
                setContainerScale(Math.min(scaleX, scaleY) * 0.9); // 0.9 for padding
            }
        };

        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    if (!currentSlide || slides.length === 0) return null;

    const bgValue = currentSlide.background?.type === 'color' 
        ? (currentSlide.background.value === 'dark' ? '#18181b' : currentSlide.background.value)
        : currentSlide.background?.value || '#18181b';

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col font-sans text-white/90"
        >
            {/* Ambient Background */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
                style={{ 
                    backgroundImage: `radial-gradient(circle at 50% 50%, #3f3f46 0%, #000 100%)`,
                }} 
            />

            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 z-20 relative">
                <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/10">
                        <span className="text-[11px] font-bold tracking-wider text-white/70">
                            {currentIndex + 1} <span className="text-white/30 mx-1">/</span> {slides.length}
                        </span>
                    </div>
                </div>
                
                <button 
                    onClick={onClose}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all active:scale-95 group"
                >
                    <X size={18} className="text-white/70 group-hover:text-white transition-colors" />
                </button>
            </div>

            {/* Main Stage */}
            <div className="flex-1 flex items-center justify-center p-8 overflow-hidden relative" ref={containerRef}>
                <div 
                    style={{ 
                        width: 1000, 
                        height: 563,
                        transform: `scale(${containerScale})`,
                        transformOrigin: 'center center'
                    }}
                    className="relative shadow-2xl shadow-black/50 bg-black rounded-xl overflow-hidden ring-1 ring-white/10"
                >

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`slide-${currentIndex}-${slideKey}`}
                            variants={transitionVariants[
                                (currentSlide?.transition?.type === 'wipe' ? 'slide' : 
                                 currentSlide?.transition?.type || 'fade') as TransitionType
                            ]}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: currentSlide?.transition?.duration || 0.5, ease: 'easeInOut' }}
                            className="absolute inset-0 overflow-hidden"
                            style={{
                                background: currentSlide.background?.type === 'gradient' ? bgValue : undefined,
                                backgroundColor: currentSlide.background?.type !== 'gradient' ? bgValue : undefined,
                            }}
                        >
                            {currentSlide.background?.type === 'image' && (
                                <img 
                                    src={currentSlide.background.value} 
                                    className="absolute inset-0 w-full h-full object-cover opacity-50" 
                                    alt="bg"
                                />
                            )}
                            
                            <div className="relative w-full h-full font-sans antialiased">
                                {currentSlide.elements?.map((element) => (
                                    <AnimatedElement 
                                        key={element.id} 
                                        element={element} 
                                        slideKey={`${currentIndex}-${slideKey}`}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="p-8 z-20 pb-10">
                <div className="max-w-xl mx-auto w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl">
                    
                    {/* Progress Indicators */}
                    <div className="flex gap-1.5 mb-4 px-1">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => { setCurrentIndex(idx); setProgress(0); setSlideKey(prev => prev + 1); }}
                                className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden transition-all hover:h-1.5 hover:bg-white/20"
                            >
                                <div 
                                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300 ease-linear"
                                    style={{ 
                                        width: idx < currentIndex ? '100%' : 
                                               idx === currentIndex ? `${progress}%` : '0%' 
                                    }}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Playback Controls */}
                    <div className="flex items-center justify-between px-2">
                         <div className="flex items-center gap-1">
                            <span className="text-xs text-white/40 font-mono tabular-nums">
                                {((currentSlide?.duration || 5000) / 1000).toFixed(1)}s
                            </span>
                        </div>

                         <div className="flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
                            <button 
                                onClick={goToPrev}
                                disabled={currentIndex === 0}
                                className="p-2 text-white/50 hover:text-white disabled:opacity-20 transition-all active:scale-95"
                            >
                                <SkipBack size={20} fill="currentColor" />
                            </button>

                            <button 
                                onClick={() => setIsPlaying(p => !p)}
                                className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10"
                            >
                                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                            </button>

                            <button 
                                onClick={goToNext}
                                disabled={currentIndex === slides.length - 1}
                                className="p-2 text-white/50 hover:text-white disabled:opacity-20 transition-all active:scale-95"
                            >
                                <SkipForward size={20} fill="currentColor" />
                            </button>
                        </div>

                        <button 
                            onClick={restart}
                            className="p-2 text-white/50 hover:text-white transition-all active:rotate-[-45deg]"
                            title="Restart Presentation"
                        >
                            <RotateCcw size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PresentationPreview;
