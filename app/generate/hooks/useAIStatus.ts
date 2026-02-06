import { useState, useEffect, useCallback, useRef } from 'react';
import type { AIJobStatus, AIJobResult } from '../types';

interface UseAIStatusOptions {
    pollInterval?: number;
    onComplete?: (result: AIJobResult) => void;
    onError?: (error: string) => void;
}

interface AIStatusState {
    status: AIJobStatus | null;
    result: AIJobResult | null;
    error: string | null;
    isPolling: boolean;
}

export function useAIStatus(jobId: string | null, options: UseAIStatusOptions = {}) {
    const { pollInterval = 1500, onComplete, onError } = options;
    
    const [state, setState] = useState<AIStatusState>({
        status: null,
        result: null,
        error: null,
        isPolling: false
    });

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const mountedRef = useRef(true);

    const stopPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (mountedRef.current) {
            setState(prev => ({ ...prev, isPolling: false }));
        }
    }, []);

    const fetchStatus = useCallback(async (id: string) => {
        try {
            const response = await fetch(`/api/ai/status/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch status');
            }
            
            const data = await response.json();
            
            if (!mountedRef.current) return;

            setState(prev => ({
                ...prev,
                status: data.status,
                result: data.result || null,
                error: data.error || null
            }));

            if (data.status === 'completed') {
                stopPolling();
                onComplete?.(data.result);
            } else if (data.status === 'failed') {
                stopPolling();
                onError?.(data.error || 'Job failed');
            }
        } catch (err) {
            if (!mountedRef.current) return;
            const errorMsg = err instanceof Error ? err.message : 'Status fetch failed';
            setState(prev => ({ ...prev, error: errorMsg }));
        }
    }, [stopPolling, onComplete, onError]);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            stopPolling();
        };
    }, [stopPolling]);

    useEffect(() => {
        if (!jobId) {
            stopPolling();
            setState({ status: null, result: null, error: null, isPolling: false });
            return;
        }

        setState(prev => ({ ...prev, isPolling: true, status: 'queued' }));
        fetchStatus(jobId);

        intervalRef.current = setInterval(() => {
            fetchStatus(jobId);
        }, pollInterval);

        return () => stopPolling();
    }, [jobId, pollInterval, fetchStatus, stopPolling]);

    return {
        ...state,
        stopPolling
    };
}
