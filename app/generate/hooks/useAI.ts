import { useState, useCallback } from 'react';
import type { Slide, SlideElement, RawFile } from '../types';

interface UseAIOptions {
    onJobStarted?: (jobId: string) => void;
    onError?: (error: string) => void;
}

interface AIState {
    isLoading: boolean;
    jobId: string | null;
    error: string | null;
}

export function useAI(options: UseAIOptions = {}) {
    const { onJobStarted, onError } = options;
    
    const [state, setState] = useState<AIState>({
        isLoading: false,
        jobId: null,
        error: null
    });

    const handleError = useCallback((message: string) => {
        setState(prev => ({ ...prev, isLoading: false, error: message }));
        onError?.(message);
    }, [onError]);

    const generatePresentation = useCallback(async (
        userQuery: string,
        themeName: string,
        rawFiles?: RawFile[],
        requestedSlideCount?: number
    ): Promise<string | null> => {
        setState({ isLoading: true, jobId: null, error: null });

        try {
            const body: Record<string, any> = {
                userQuery,
                themeName,
                requestedSlideCount: requestedSlideCount || 6
            };

            if (rawFiles && rawFiles.length > 0) {
                body.uploadedFileContent = rawFiles.map(f => 
                    `=== FILE: ${f.fileName} (${f.fileType}) ===\n${f.content}`
                ).join('\n\n');
            }

            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Generation failed');
            }

            const data = await response.json();
            setState({ isLoading: false, jobId: data.jobId, error: null });
            onJobStarted?.(data.jobId);
            return data.jobId;
        } catch (err) {
            handleError(err instanceof Error ? err.message : 'Generation failed');
            return null;
        }
    }, [handleError, onJobStarted]);

    const editPresentation = useCallback(async (
        slides: Slide[],
        instruction: string,
        themeName: string,
        metadata?: { summary?: string }
    ): Promise<string | null> => {
        setState({ isLoading: true, jobId: null, error: null });

        try {
            const response = await fetch('/api/ai/edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slides,
                    instruction,
                    themeName,
                    metadata
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Edit failed');
            }

            const data = await response.json();
            setState({ isLoading: false, jobId: data.jobId, error: null });
            onJobStarted?.(data.jobId);
            return data.jobId;
        } catch (err) {
            handleError(err instanceof Error ? err.message : 'Edit failed');
            return null;
        }
    }, [handleError, onJobStarted]);

    const editSlide = useCallback(async (
        slideId: string,
        slide: Slide,
        instruction: string,
        themeName: string,
        projectSummary?: string,
        history?: { role: 'user' | 'assistant', content: string }[],
        selectedElementIds: string[] = []
    ): Promise<string | null> => {
        setState({ isLoading: true, jobId: null, error: null });

        try {
            const response = await fetch('/api/ai/edit/slide', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slideId,
                    slide,
                    instruction,
                    themeName,
                    projectSummary,
                    history,
                    selectedElementIds
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Slide edit failed');
            }

            const data = await response.json();
            setState({ isLoading: false, jobId: data.jobId, error: null });
            onJobStarted?.(data.jobId);
            return data.jobId;
        } catch (err) {
            handleError(err instanceof Error ? err.message : 'Slide edit failed');
            return null;
        }
    }, [handleError, onJobStarted]);
    const editElements = useCallback(async (
        slideId: string,
        elements: SlideElement[],
        instruction: string,
        themeName: string,
        projectSummary?: string
    ): Promise<string | null> => {
        setState({ isLoading: true, jobId: null, error: null });

        try {
            const response = await fetch('/api/ai/edit/element', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slideId,
                    elements,
                    instruction,
                    themeName,
                    projectSummary
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Element edit failed');
            }

            const data = await response.json();
            setState({ isLoading: false, jobId: data.jobId, error: null });
            onJobStarted?.(data.jobId);
            return data.jobId;
        } catch (err) {
            handleError(err instanceof Error ? err.message : 'Element edit failed');
            return null;
        }
    }, [handleError, onJobStarted]);

    const reset = useCallback(() => {
        setState({ isLoading: false, jobId: null, error: null });
    }, []);

    return {
        ...state,
        generatePresentation,
        editPresentation,
        editSlide,
        editElements,
        reset
    };
}
