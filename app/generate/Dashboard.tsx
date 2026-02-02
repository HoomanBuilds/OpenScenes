'use client';

import React, { useState, useEffect, useRef } from 'react';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import PresentationPreview from './PresentationPreview';
import { FontLoader } from './FontLoader';
import { validateTemplate } from './templateSchema';
import { RenderOptions } from './LeftPanel_Global';

import { Slide, SlideElement, Asset, ViewMode, GenerationStatus, SlideBackground, AnimationType, AnimationDirection, ElementAnimation, ContextFile } from './types';
import { useSearchParams } from 'next/navigation';
import { storage } from '@/lib/storage/adapter';
import { Project } from '@/lib/storage/types';

const Dashboard: React.FC = () => {
    const searchParams = useSearchParams();
    const projectId = searchParams.get('id');

    const [globalPrompt, setGlobalPrompt] = useState<string>('');
    const [visualStyle, setVisualStyle] = useState<string>('minimal_dark');

    const [slides, setSlides] = useState<Slide[]>([]);
    const [globalAssets, setGlobalAssets] = useState<Asset[]>([]);
    const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
    
    const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
    const abortControllerRef = useRef<AbortController | null>(null);

    const [viewMode, setViewMode] = useState<ViewMode>('sequence');
    const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle');
    const [renderStatus, setRenderStatus] = useState<'idle' | 'rendering' | 'done'>('idle');
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const [contextFiles, setContextFiles] = useState<ContextFile[]>([]);

    const [history, setHistory] = useState<Slide[][]>([]);
    
    const [showPreview, setShowPreview] = useState(false);
    
    const [renderProgress, setRenderProgress] = useState(0);
    const [renderPhase, setRenderPhase] = useState<string>('');
    const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null);

    const [renderFileName, setRenderFileName] = useState<string>('');

    const [projectName, setProjectName] = useState('Untitled Project');
    const [lastSaved, setLastSaved] = useState<number | null>(null);

    // Load Project Data
    useEffect(() => {
        if (!projectId) return;

        const loadProject = async () => {
            const project = await storage.getProject(projectId);
            if (project) {
                if (project.data.slides) setSlides(project.data.slides);
                if (project.data.globalPrompt) setGlobalPrompt(project.data.globalPrompt);
                if (project.name) setProjectName(project.name);
                if (project.data.themeId) setVisualStyle(project.data.themeId);
            }
        };
        loadProject();
    }, [projectId]);

    // Auto-Save Project
    useEffect(() => {
        if (!projectId || slides.length === 0) return;

        const saveTimeout = setTimeout(async () => {
             const project = await storage.getProject(projectId);
             if (project) {
                 // Generate thumbnail from first slide
                 let thumbnail = project.thumbnail;
                 const firstSlide = slides[0];
                 if (firstSlide && firstSlide.background) {
                     if (firstSlide.background.type === 'image') {
                         thumbnail = firstSlide.background.value;
                     } else if (firstSlide.elements) {
                         // Find first image element
                         const imgParams = firstSlide.elements.find(e => e.type === 'image');
                         if (imgParams) thumbnail = imgParams.content;
                     }
                 }

                 const updatedProject: Project = {
                     ...project,
                     name: projectName,
                     description: globalPrompt || project.description,
                     updatedAt: Date.now(),
                     data: {
                         ...project.data,
                         slides,
                         globalPrompt,
                         themeId: visualStyle
                     },
                     thumbnail
                 };
                 await storage.saveProject(updatedProject);
                 setLastSaved(Date.now());
                 console.log('Project auto-saved');
             }
        }, 1000); // Debounce 1s

        return () => clearTimeout(saveTimeout);
    }, [slides, globalPrompt, projectId, projectName]);

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

    const saveToHistory = () => {
        setHistory(prev => [...prev.slice(-19), JSON.parse(JSON.stringify(slides))]);
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const previous = history[history.length - 1];
        setHistory(prev => prev.slice(0, -1));
        setSlides(previous);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const activeTag = document.activeElement?.tagName.toLowerCase();
            if (activeTag === 'input' || activeTag === 'textarea' || (document.activeElement as HTMLElement)?.isContentEditable) {
                return;
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                handleUndo();
            }

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
            background: { type: 'color', value: '#18181b' },
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
            const newDuration = Math.max(30, s.duration + deltaFrames); 
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
            textFormat: type === 'text' ? 'markdown' : undefined,
            color: type === 'shape' ? (isHollow ? 'transparent' : '#3b82f6') : '#ffffff',
            textColor: type === 'shape' ? '#ffffff' : undefined,
            strokeWidth: isHollow ? 2 : 0,
            strokeColor: isHollow ? '#3b82f6' : 'transparent',
            fontSize: (type === 'headline' || type === 'subheadline' || type === 'text') ? 48 : (type === 'shape' ? 32 : 24),
            fontWeight: 'normal',
            textAlign: 'left',
            verticalAlign: (type === 'headline' || type === 'subheadline' || type === 'text') ? 'center' : undefined,
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
        setSelectedElementIds([]);
    };

    const [generationLog, setGenerationLog] = useState<string>('');

    const handleGenerate = async () => {
        if (generationStatus === 'generating') return;
        
        setGenerationStatus('generating');
        setRenderStatus('idle');
        setRenderedVideoUrl(null);
        setSelectedSlideId(null);
        setViewMode('sequence');
        setSlides([{ id: 'skeleton-1', type: 'skeleton', props: {}, duration: 90, elements: [] }]);
        setGenerationLog('Initializing AI pipeline...');

        try {
            const response = await fetch('/api/generate/slides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    prompt: globalPrompt,
                    context: contextFiles.map(f => ({ name: f.name, content: f.content }))
                })
            });

            if (!response.ok) throw new Error('Generation failed');

            const data = await response.json();
            
            if (data.slides && Array.isArray(data.slides)) {
                setSlides(data.slides);
                setGenerationStatus('done');
                setGenerationLog('');
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Generation error:', error);
            setGenerationStatus('idle');
            setGenerationLog('');
            setSlides([]);
        }
    };

    const handleRender = async (options: RenderOptions) => {
        if (slides.length === 0) return;
        
        setRenderStatus('rendering');
        setRenderProgress(0);
        setRenderPhase('Initializing...');
        setRenderedVideoUrl(null);

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const templateData = {
                name: globalPrompt || 'Untitled',
                slides: slides.map(s => ({
                    ...s,
                    elements: s.elements || []
                }))
            };

            const response = await fetch('/api/tmp/fromJson/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...templateData, options }),
                signal: controller.signal
            });

            if (!response.ok) throw new Error('Render failed');

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader');

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('event:')) {
                        const eventMatch = line.match(/event: (\w+)/);
                        const dataMatch = line.match(/data: ([\s\S]+)/);
                        
                        if (eventMatch && dataMatch) {
                            const event = eventMatch[1];
                            const data = JSON.parse(dataMatch[1]);

                            if (event === 'progress') {
                                setRenderProgress(data.percent);
                                setRenderPhase(data.phase || '');
                            } else if (event === 'complete') {
                                setRenderedVideoUrl(data.videoUrl);
                                setRenderFileName(data.fileName);
                                setRenderStatus('done');
                            } else if (event === 'error') {
                                throw new Error(data.message);
                            }
                        }
                    }
                }
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Render aborted');
            } else {
                console.error('Render error:', error);
            }
            setRenderStatus('idle');
            setRenderProgress(0);
            setRenderPhase('');
        } finally {
            abortControllerRef.current = null;
        }
    };

    const handleAbortRender = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setRenderStatus('idle');
            setRenderProgress(0);
            setRenderPhase('');
        }
    };

    const handleExport = () => {
        const totalDurationFrames = slides.reduce((acc, s) => acc + (s.duration || 90), 0);
        const fps = 30;
        
        const templateData = {
            name: globalPrompt || 'Untitled Export',
            version: '1.0',
            createdAt: new Date().toISOString(),
            canvas: {
                width: 1000,
                height: 563,
            },
            fps,
            totalDuration: {
                frames: totalDurationFrames,
                seconds: Math.round(totalDurationFrames / fps * 100) / 100,
            },
            slideCount: slides.length,
            slides: slides.map(s => ({
                ...s,
                elements: s.elements || []
            }))
        };

        const blob = new Blob([JSON.stringify(templateData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${templateData.name.replace(/[^a-z0-9]/gi, '_')}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const parsed = JSON.parse(content);
                
                const result = validateTemplate(parsed);
                if (!result.success) {
                    alert('Invalid template format: ' + result.error);
                    return;
                }

                saveToHistory();
                setSlides(result.data.slides.map(s => ({ ...s, props: {}, type: s.type || 'default', duration: s.duration || 90 })) as Slide[]);
                setGlobalPrompt(result.data.name || '');
                setViewMode('sequence');
                setSelectedSlideId(null);
            } catch (err) {
                alert('Failed to parse JSON file');
            }
        };
        reader.readAsText(file);
    };

    const handleDownload = () => {
        if (renderedVideoUrl) {
            const a = document.createElement('a');
            a.href = renderedVideoUrl;
            a.download = renderFileName || 'video.mp4';
            a.click();
        }
    };

    const handleResetRender = () => {
        setRenderStatus('idle');
        setRenderedVideoUrl(null);
        setRenderProgress(0);
        setRenderPhase('');
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#09090b] text-white font-sans relative selection:bg-purple-500/30">
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}></div>
            
            <FontLoader slides={slides} />

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
                renderStatus={renderStatus}
                renderProgress={renderProgress}
                renderPhase={renderPhase}
                onRender={handleRender}
                onAbort={handleAbortRender}
                visualStyle={visualStyle}
                setVisualStyle={setVisualStyle}
            />
            
            <RightPanel 
                slides={slides}
                selectedSlideId={selectedSlideId}
                selectedElementId={selectedElementIds[0] || null}
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
                onPreview={() => setShowPreview(true)}
                onImport={handleImport}
                onExport={handleExport}
                refreshKey={refreshKey}
                renderStatus={renderStatus}
                renderedVideoUrl={renderedVideoUrl}
                renderFileName={renderFileName}
                onDownload={handleDownload}
                onResetRender={handleResetRender}
                projectName={projectName}
                setProjectName={setProjectName}
            />
            
            {showPreview && slides.length > 0 && (
                <PresentationPreview 
                    slides={slides}
                    onClose={() => setShowPreview(false)}
                />
            )}
        </div>
    );
};

export default Dashboard;
