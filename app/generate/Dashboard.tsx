'use client';

import React, { useState, useEffect } from 'react';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import { Template_TitleCard } from './templates/Template_TitleCard';
import { Template_ImageRight } from './templates/Template_ImageRight';
import { Slide1 } from './templates/example/crypto/Slide1';
import { Slide2 } from './templates/example/crypto/Slide2';
import { Slide3 } from './templates/example/crypto/Slide3';
import { Slide4 } from './templates/example/crypto/Slide4';
import { SaaS_Slide1 } from './templates/example/saas/Slide1';
import { SaaS_Slide2 } from './templates/example/saas/Slide2';
import { SaaS_Slide3 } from './templates/example/saas/Slide3';
import { HyperDrive_Slide1 } from './templates/example/hyper-drive/Slide1';
import { HyperDrive_Slide2 } from './templates/example/hyper-drive/Slide2';
import { HyperDrive_Slide3 } from './templates/example/hyper-drive/Slide3';
import { HyperDrive_Slide4 } from './templates/example/hyper-drive/Slide4';
import { HyperDrive_Slide5 } from './templates/example/hyper-drive/Slide5';

// Import Template
import HyperDriveLaunch from './templates/HyperDriveLaunch.json';

// Types
import { Slide, SlideElement, Asset, ViewMode, GenerationStatus, SlideBackground, AnimationType, AnimationDirection, ElementAnimation, ContextFile } from './types';

const Dashboard: React.FC = () => {
    // State
    const [globalPrompt, setGlobalPrompt] = useState<string>('');
    const [slides, setSlides] = useState<Slide[]>([]);
    const [globalAssets, setGlobalAssets] = useState<Asset[]>([]);
    const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
    
    // Multi-Select State
    const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);

    const [viewMode, setViewMode] = useState<ViewMode>('sequence');
    const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle');
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const [contextFiles, setContextFiles] = useState<ContextFile[]>([]);
    
    // Undo/History State
    const [history, setHistory] = useState<Slide[][]>([]);

    // Console Log State for User Verification
    useEffect(() => {
        if (slides.length > 0) {
            console.log('--- DASHBOARD STATE UPDATE ---');
            console.log('Global Prompt:', globalPrompt);
            console.log('Selection:', selectedElementIds);
            const selSlide = slides.find(s => s.id === selectedSlideId);
            if (selSlide) console.log('Current Slide BG:', selSlide.background);
            console.log('------------------------------');
        }
    }, [slides, generationStatus, selectedElementIds, selectedSlideId, globalPrompt]);

    // History Helper
    const saveToHistory = () => {
        setHistory(prev => [...prev.slice(-19), JSON.parse(JSON.stringify(slides))]); // Max 20 steps
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const previous = history[history.length - 1];
        setHistory(prev => prev.slice(0, -1));
        setSlides(previous);
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Guard: don't trigger if user is typing in an input or textarea
            const activeTag = document.activeElement?.tagName.toLowerCase();
            if (activeTag === 'input' || activeTag === 'textarea' || (document.activeElement as HTMLElement)?.isContentEditable) {
                return;
            }

            // Undo: Ctrl+Z
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                handleUndo();
            }

            // Delete: Delete or Backspace (if something is selected)
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementIds.length > 0 && selectedSlideId) {
                e.preventDefault();
                saveToHistory();
                setSlides(prev => prev.map(s => {
                    if (s.id !== selectedSlideId) return s;
                    return {
                        ...s,
                        elements: s.elements?.filter(el => !selectedElementIds.includes(el.id))
                    };
                }));
                setSelectedElementIds([]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [slides, history, selectedElementIds, selectedSlideId]);
    const handleAddSlide = () => {
        saveToHistory();
        const newSlide: Slide = {
            id: `slide-${Date.now()}`,
            type: 'default',
            props: {},
            duration: 90,
            background: { type: 'color', value: '#18181b' }, // Default Zinc-900
            elements: []
        };
        setSlides([...slides, newSlide]);
    };

    const handleSelectSlide = (id: string | null) => {
        setSelectedSlideId(id);
        if (id) {
            setViewMode('focus');
        } else {
            setViewMode('sequence');
            setSelectedElementIds([]);
        }
    };

    // Toggle Selection with Shift Key
    const handleSelectElement = (elementId: string | null, multi: boolean = false) => {
        if (!elementId) {
            setSelectedElementIds([]);
            return;
        }

        if (multi) {
            setSelectedElementIds(prev => 
                prev.includes(elementId) ? prev.filter(id => id !== elementId) : [...prev, elementId]
            );
        } else {
            setSelectedElementIds([elementId]);
        }
    };

    const handleReorder = (newSlides: Slide[]) => {
        saveToHistory();
        setSlides(newSlides);
    };

    const handleDurationChange = (slideId: string, deltaFrames: number) => {
        saveToHistory();
        setSlides(prev => prev.map(s => {
            if (s.id !== slideId) return s;
            const newDuration = Math.max(30, s.duration + deltaFrames); // Min 1 sec
            return { ...s, duration: newDuration };
        }));
    };

    const handleRemoveSlide = (slideId: string) => {
        saveToHistory();
        setSlides(prev => prev.filter(s => s.id !== slideId));
        if (selectedSlideId === slideId) {
            handleSelectSlide(null);
        }
    };

    const handleRegenerateSlide = (slideId: string) => {
        // Trigger generic refresh to replay animations
        setRefreshKey(prev => prev + 1);
    };

    const handleUploadAsset = (file: File, type: 'image' | 'audio' | 'video') => {
        if (file.size > 2 * 1024 * 1024) {
            alert('File size exceeds 2MB limit.');
            return;
        }

        const url = URL.createObjectURL(file);
        const newAsset: Asset = {
            id: `asset-${Date.now()}`,
            type,
            url,
            name: file.name
        };
        setGlobalAssets(prev => [...prev, newAsset]);
    };

    const handleAddContextFile = (file: ContextFile) => {
        setContextFiles(prev => [...prev, file]);
    };

    const handleRemoveContextFile = (id: string) => {
        setContextFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleUpdateElement = (slideId: string, elementId: string, changes: Partial<SlideElement>) => {
        saveToHistory();
        setSlides(prevSlides => prevSlides.map(slide => {
            if (slide.id !== slideId) return slide;
            return {
                ...slide,
                elements: slide.elements?.map(el => {
                    if (el.id === elementId || (selectedElementIds.includes(el.id) && selectedElementIds.includes(elementId))) {
                        return { ...el, ...changes };
                    }
                    return el;
                })
            };
        }));
    };

    const handleUpdateSlide = (slideId: string, changes: Partial<Slide>) => {
        saveToHistory();
        setSlides(prev => prev.map(s => s.id === slideId ? { ...s, ...changes } : s));
    };

    const handleUpdateSlideBackground = (slideId: string, bg: SlideBackground) => {
        saveToHistory();
        setSlides(prev => prev.map(s => s.id === slideId ? { ...s, background: bg } : s));
    };

    const handleAddElement = (slideId: string, type: SlideElement['type'], position: { x: number, y: number }, preset?: string, content?: string) => {
        saveToHistory();
        const isHollow = preset === 'Hollow';
        
        const newElement: SlideElement = {
            id: `el-${Date.now()}`,
            type,
            content: content || (
                     (type === 'headline' || type === 'subheadline' || type === 'text') ? 
                     (type === 'headline' ? 'New Headline' : type === 'subheadline' ? 'New Subtitle' : 'New Text') :
                     type === 'image' ? 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' : 
                     type === 'video' ? 'https://www.w3schools.com/html/mov_bbb.mp4' :
                     type === 'shape' ? '' :
                     type === 'chart' ? 'Jan 400 240\nFeb 300 139\nMar 200 980\nApr 278 390\nMay 189 480' : 
                     'New Content'
            ),
            x: position.x,
            y: position.y,
            width: (type === 'image' || type === 'video' || type === 'chart') ? 300 : type === 'shape' ? 200 : 400,
            height: (type === 'image' || type === 'video' || type === 'chart' || type === 'shape') ? 200 : (type === 'headline' || type === 'subheadline' || type === 'text') ? (type === 'headline' ? 60 : 40) : undefined,
            textFormat: type === 'text' ? 'normal' : undefined,
            color: type === 'shape' ? (isHollow ? 'transparent' : '#3b82f6') : '#ffffff',
            textColor: type === 'shape' ? '#ffffff' : undefined,
            strokeWidth: isHollow ? 2 : 0,
            strokeColor: isHollow ? '#3b82f6' : 'transparent',
            fontSize: (type === 'headline' || type === 'subheadline' || type === 'text') ? 48 : (type === 'shape' ? 32 : 24),
            fontWeight: 'normal',
            textAlign: 'left',
            verticalAlign: (type === 'headline' || type === 'subheadline' || type === 'text') ? 'center' : undefined,
            // Default props for new types
            borderRadius: (type === 'shape' || type === 'image' || type === 'video') ? 20 : undefined,
            chartType: type === 'chart' ? 'bar' : undefined,
            chartProps: type === 'chart' ? { showGrid: true, showLegend: true } : undefined,
            lineHeight: 1.5,
            
            opacity: 1,
            zIndex: 10,
            rotation: 0,
            animation: { type: 'fade', duration: 1, delay: 0 }
        };

        setSlides(prev => prev.map(s => {
            if (s.id !== slideId) return s;
            return {
                ...s,
                elements: [...(s.elements || []), newElement]
            };
        }));
    };

    const handleRemoveElement = (slideId: string, elementId: string) => {
        saveToHistory();
        setSlides(prev => prev.map(s => {
            if (s.id !== slideId) return s;
            return {
                ...s,
                elements: s.elements?.filter(e => e.id !== elementId)
            };
        }));
        setSelectedElementIds([]); // Clear selection
    };

    const [generationLog, setGenerationLog] = useState<string>('');

    const handleGenerate = () => {
        if (generationStatus === 'generating') return;
        
        setGenerationStatus('generating');
        setSelectedSlideId(null);
        setViewMode('sequence');
        setSlides([]);
        setGenerationLog('Initializing Hyper-Drive system...');

        const templateSlides = HyperDriveLaunch.slides as unknown as Slide[];

        setTimeout(() => {
            setGenerationLog('Loading template configuration...');
            
            setTimeout(() => {
                 setGenerationLog('Generating slides from schema...');
                 setSlides(templateSlides);
                 setGenerationStatus('done');
                 setGenerationLog('');
            }, 800);

        }, 800);
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-zinc-950 text-white font-sans">
            <LeftPanel 
                globalPrompt={globalPrompt}
                setGlobalPrompt={setGlobalPrompt}
                selectedSlideId={selectedSlideId}
                selectedElementIds={selectedElementIds}
                selectedSlide={slides.find(s => s.id === selectedSlideId)}
                slides={slides}
                globalAssets={globalAssets}
                generationStatus={generationStatus}
                onGenerate={handleGenerate}
                onBackToGlobal={() => handleSelectSlide(null)}
                onUploadAsset={handleUploadAsset}
                onUpdateElement={handleUpdateElement}
                onUpdateSlideBackground={handleUpdateSlideBackground}
                onRemove={() => selectedSlideId && handleRemoveSlide(selectedSlideId)}
                onRegenerateSlide={handleRegenerateSlide}
                onRemoveElement={handleRemoveElement}
                contextFiles={contextFiles}
                onAddContextFile={handleAddContextFile}
                onRemoveContextFile={handleRemoveContextFile}
            />
            
            <RightPanel 
                slides={slides}
                selectedSlideId={selectedSlideId}
                selectedElementId={selectedElementIds[0] || null} // Primary Selection for props
                selectedElementIds={selectedElementIds}
                generationStatus={generationStatus}
                log={generationLog}
                viewMode={viewMode}
                onReorder={handleReorder}
                onSelect={handleSelectSlide}
                onSelectElement={handleSelectElement}
                onAdd={handleAddSlide}
                onCloseFocus={() => handleSelectSlide(null)}
                onUpdateElement={(sId, eId, x, y, changes) => handleUpdateElement(sId, eId, { ...changes, x, y })}
                onDurationChange={handleDurationChange}
                onUpdateSlide={handleUpdateSlide}
                onAddElement={handleAddElement}
                refreshKey={refreshKey}
            />
        </div>
    );
};

export default Dashboard;
