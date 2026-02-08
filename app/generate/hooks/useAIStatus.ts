import { useState, useEffect, useCallback, useRef } from 'react';
import type { AIJobStatus, AIJobResult } from '../types';

interface UseAIStatusOptions {
    pollInterval?: number;
    onComplete?: (result: AIJobResult) => void;
    onProgress?: (result: AIJobResult) => void;
    onError?: (error: string) => void;
}

interface AIStatusState {
    status: AIJobStatus | null;
    result: AIJobResult | null;
    error: string | null;
    isPolling: boolean;
}

export function useAIStatus(jobId: string | null, options: UseAIStatusOptions = {}) {
    const { pollInterval = 1500 } = options;
    
    const [state, setState] = useState<AIStatusState>({
        status: null,
        result: null,
        error: null,
        isPolling: false
    });

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const mountedRef = useRef(true);
    const onCompleteRef = useRef(options.onComplete);
    const onErrorRef = useRef(options.onError);

    onCompleteRef.current = options.onComplete;
    onErrorRef.current = options.onError;

    const stopPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (mountedRef.current) {
            setState(prev => ({ ...prev, isPolling: false }));
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!jobId) {
            stopPolling();
            setState({ status: null, result: null, error: null, isPolling: false });
            return;
        }

        const fetchStatus = async () => {
            try {
                const response = await fetch(`/api/ai/status/${jobId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch status');
                }
                
                const data = await response.json();
                
                if (!mountedRef.current) return;

                const previousResult = state.result;
                const newResult = data.result || null;

                setState(prev => ({
                    ...prev,
                    status: data.status,
                    result: newResult,
                    error: data.error || null
                }));

                // Trigger onProgress if we have new slides in a processing state
                if (data.status === 'processing' && newResult?.slides && options.onProgress) {
                    const prevCount = previousResult?.slides?.length || 0;
                    if (newResult.slides.length > prevCount) {
                        options.onProgress(newResult);
                    }
                }

                if (data.status === 'completed') {
                    stopPolling();
                    onCompleteRef.current?.(data.result);
                } else if (data.status === 'failed') {
                    stopPolling();
                    onErrorRef.current?.(data.error || 'Job failed');
                }
            } catch (err) {
                if (!mountedRef.current) return;
                const errorMsg = err instanceof Error ? err.message : 'Status fetch failed';
                setState(prev => ({ ...prev, error: errorMsg }));
            }
        };

        setState(prev => ({ ...prev, isPolling: true, status: 'queued' }));
        fetchStatus();

        intervalRef.current = setInterval(fetchStatus, pollInterval);

        return () => stopPolling();
    }, [jobId, pollInterval, stopPolling]);

    return {
        ...state,
        stopPolling
    };
}
