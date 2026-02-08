'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import PresentationPreview from './PresentationPreview';
import { FontLoader } from './FontLoader';
import { validateTemplate } from './templateSchema';
import { RenderOptions } from './LeftPanel_Global';
import { getAllThemes } from '../lib/themes';

import { Slide, SlideElement, Asset, ViewMode, GenerationStatus, SlideBackground, AnimationType, AnimationDirection, ElementAnimation, RawFile, AIJobResult } from './types';
import { useSearchParams } from 'next/navigation';
import { useProjectPersistence } from './hooks/useProjectPersistence';
import { useEditorHistory } from './hooks/useEditorHistory';
import { useRenderJobs, RenderJob } from './hooks/useRenderJobs';
import { useAI } from './hooks/useAI';
import { useAIStatus } from './hooks/useAIStatus';

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
    const [rawFiles, setRawFiles] = useState<RawFile[]>([]);
    const [aiJobId, setAiJobId] = useState<string | null>(null);
    const [projectSummary, setProjectSummary] = useState<string>('');

    const [history, setHistory] = useState<Slide[][]>([]);

    const [showPreview, setShowPreview] = useState(false);

    const [renderProgress, setRenderProgress] = useState(0);
    const [renderPhase, setRenderPhase] = useState<string>('');
    const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null);

    const [renderFileName, setRenderFileName] = useState<string>('');

    const [projectName, setProjectName] = useState('Untitled Project');
    const [lastSaved, setLastSaved] = useState<number | null>(null);
    const [generationLog, setGenerationLog] = useState<string>('');

    useProjectPersistence({
        projectId,
        slides,
        globalPrompt,
        projectName,
        visualStyle,
        setSlides,
        setGlobalPrompt,
        setProjectName,
        setVisualStyle,
        setLastSaved,
    });

    useEffect(() => {
        if (process.env.NODE_ENV !== 'development') return;
        if (slides.length === 0) return;

        console.log('--- DASHBOARD STATE UPDATE ---');
        console.log('Global Prompt:', globalPrompt);
        console.log('Selection:', selectedElementIds);
        const selSlide = slides.find(s => s.id === selectedSlideId);
        if (selSlide) console.log('Current Slide BG:', selSlide.background);
        console.log('------------------------------');
    }, [slides, generationStatus, selectedElementIds, selectedSlideId, globalPrompt]);


    const { saveToHistory, undo } = useEditorHistory({
        slides,
        setSlides,
        history,
        setHistory,
        selectedSlideId,
        selectedElementIds,
        setSelectedElementIds,
    });


    const handleAddSlide = () => {
        saveToHistory();
        const newSlide: Slide = {
            id: `slide-${Date.now()}`,
            type: 'default',
            props: {},
            duration: 3000,
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

    const handleDurationChange = (slideId: string, deltaMs: number) => {
        saveToHistory();
        setSlides(prev => prev.map(s => {
            if (s.id !== slideId) return s;
            const newDuration = Math.max(500, s.duration + deltaMs);
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

    const handleAddRawFile = useCallback((file: RawFile) => {
        setRawFiles(prev => [...prev, file]);
    }, []);

    const handleRemoveRawFile = useCallback((id: string) => {
        setRawFiles(prev => prev.filter(f => f.id !== id));
    }, []);

    const getThemeName = useCallback((): string => {
        const theme = getAllThemes().find(t => t.prompt_injection === visualStyle);
        return theme?.id || 'minimal_dark';
    }, [visualStyle]);

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
                                    type === 'custom' ? {
                                        layout: {
                                            tag: "div",
                                            className: "w-full h-full flex items-center justify-center bg-zinc-900/50 border border-zinc-700 rounded-xl backdrop-blur-sm shadow-xl",
                                            children: [
                                                { id: "icon", tag: "div", className: "w-12 h-12 bg-purple-500 rounded-full mb-4 flex items-center justify-center shadow-lg hover:bg-purple-400 transition-colors" },
                                                { id: "title", tag: "h2", className: "text-xl font-bold text-white", text: "Smart UI" },
                                                { id: "desc", tag: "p", className: "text-zinc-400 text-xs mt-2", text: "Drag me. Edit me." }
                                            ]
                                        },
                                        animations: {
                                            icon: { initial: { scale: 0 }, animate: { scale: 1 }, transition: { type: "spring" } },
                                            title: { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.2 } },
                                            desc: { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.4 } }
                                        }
                                    } :
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

    const ai = useAI({
        onJobStarted: (jobId) => {
            setAiJobId(jobId);
            setGenerationLog('Processing...');
        },
        onError: (error) => {
            console.error('AI Error:', error);
            setGenerationStatus('idle');
            setGenerationLog('');
            setSlides([]);
        }
    });

    const handleAIComplete = useCallback((result: AIJobResult) => {
        if (result.slides && Array.isArray(result.slides)) {
            setSlides(result.slides.map(s => ({ ...s, props: s.props || {} })));
            if (result.metadata?.summary) {
                setProjectSummary(result.metadata.summary);
            }
        } else if (result.slide) {
            setSlides(prev => prev.map(s => s.id === result.slide!.id ? { ...result.slide!, props: result.slide!.props || {} } : s));
        } else if (result.elements && result.patches) {
            const slideId = (result as any).slideId;
            if (slideId) {
                setSlides(prev => prev.map(s => {
                    if (s.id !== slideId) return s;
                    const updatedElements = s.elements?.map(el => {
                        const updated = result.elements!.find(e => e.id === el.id);
                        return updated || el;
                    });
                    return { ...s, elements: updatedElements };
                }));
            }
        }
        setGenerationStatus('done');
        setGenerationLog('');
        setAiJobId(null);
    }, []);

    useAIStatus(aiJobId, {
        onComplete: handleAIComplete,
        onError: (error) => {
            console.error('AI Status Error:', error);
            setGenerationStatus('idle');
            setGenerationLog('');
            setAiJobId(null);
        }
    });

    const handleGenerate = useCallback(async () => {
        if (generationStatus === 'generating') return;
        if (!globalPrompt.trim()) return;

        setGenerationStatus('generating');
        setRenderStatus('idle');
        setRenderedVideoUrl(null);
        setSelectedSlideId(null);
        setViewMode('sequence');
        setSlides([{ id: 'skeleton-1', type: 'skeleton', props: {}, duration: 90, elements: [] }]);
        setGenerationLog('Initializing AI pipeline...');

        const themeName = getThemeName();

        if (slides.length === 0 || slides[0]?.type === 'skeleton') {
            await ai.generatePresentation(globalPrompt, themeName, rawFiles);
        } else {
            await ai.editPresentation(slides.filter(s => s.type !== 'skeleton'), globalPrompt, themeName, { summary: projectSummary });
        }
    }, [generationStatus, globalPrompt, slides, rawFiles, ai, getThemeName, projectSummary]);

    const handleSlideAIEdit = useCallback(async (slideId: string, instruction: string) => {
        const slide = slides.find(s => s.id === slideId);
        if (!slide || !instruction.trim()) return;

        setGenerationStatus('generating');
        setGenerationLog('Processing slide edit...');
        const themeName = getThemeName();
        await ai.editSlide(slideId, slide, instruction, themeName, projectSummary);
    }, [slides, ai, getThemeName, projectSummary]);

    const handleElementAIEdit = useCallback(async (slideId: string, elementIds: string[], instruction: string) => {
        const slide = slides.find(s => s.id === slideId);
        if (!slide || elementIds.length === 0 || !instruction.trim()) return;

        const elements = slide.elements?.filter(el => elementIds.includes(el.id)) || [];
        if (elements.length === 0) return;

        setGenerationStatus('generating');
        setGenerationLog('Processing element edit...');
        const themeName = getThemeName();
        await ai.editElements(slideId, elements, instruction, themeName);
    }, [slides, ai, getThemeName]);
    const { jobs: renderJobs, addJob: addRenderJob, clearJobs: clearRenderJobs, cancelJob: cancelRenderJob } = useRenderJobs(projectId || undefined);

    const handleRender = async (options: RenderOptions) => {
        if (slides.length === 0) return;

        try {
            const templateData = {
                name: projectName || globalPrompt || 'Untitled Project',
                slides: slides.map(s => ({
                    ...s,
                    elements: s.elements || []
                }))
            };

            let scale = 1;
            if (options.resolution === '720p') scale = 0.67;
            if (options.resolution === '4k') scale = 2;

            const params = new URLSearchParams({
                fps: (options.fps || 30).toString(),
                scale: (options.scale || scale).toString(),
                quality: options.quality || 'high',
                format: 'mp4'
            });

            if (projectId) {
                params.append('projectId', projectId);
            }

            const response = await fetch(`/api/render?${params.toString()}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(templateData), // Send templateData directly as root
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to start render');
            }

            const data = await response.json();
            
            // Add to jobs list
            addRenderJob({
                jobId: data.jobId,
                status: 'queued',
                name: templateData.name,
                createdAt: Date.now(),
            });

            // Notify user (optional, non-blocking toast could go here)
            console.log('Render started:', data.jobId);

        } catch (error: any) {
            console.error('Render trigger error:', error);
            alert('Failed to start render: ' + error.message);
        }
    };

    const handleSelectRenderJob = (job: RenderJob) => {
        if (job.status === 'completed' && job.videoUrl) {
            setRenderStatus('done');
            setRenderedVideoUrl(job.videoUrl);
            setRenderFileName(`${job.name.replace(/[^a-z0-9]/gi, '_')}.mp4`);
        }
    };

    const handleAbortRender = () => {
        // No-op for async renders (can't easily cancel once sent to queue yet)
    };

    const handleExport = () => {
        const totalDurationMs = slides.reduce((acc, s) => acc + (s.duration || 3000), 0);
        const fps = 30;
        const totalDurationFrames = Math.ceil((totalDurationMs / 1000) * fps);

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
                rawFiles={rawFiles}
                onAddRawFile={handleAddRawFile}
                onRemoveRawFile={handleRemoveRawFile}
                renderStatus={renderStatus}
                renderProgress={renderProgress}
                renderPhase={renderPhase}
                onRender={handleRender}
                onAbort={handleAbortRender}
                visualStyle={visualStyle}
                setVisualStyle={setVisualStyle}
                onSlideAIEdit={handleSlideAIEdit}
                onElementAIEdit={handleElementAIEdit}
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
                renderJobs={renderJobs}
                onSelectRenderJob={handleSelectRenderJob}
                onCancelRenderJob={(job) => cancelRenderJob(job.jobId)}
                onClearRenderJobs={clearRenderJobs}
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