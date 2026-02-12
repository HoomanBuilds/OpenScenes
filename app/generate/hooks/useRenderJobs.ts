import { useState, useEffect } from 'react';
import { showAISuccess, showAIError } from '@/lib/utils/sonner';
import { toast } from 'sonner';

export interface RenderJob {
    jobId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelling' | 'cancelled';
    progress?: number;
    videoUrl?: string;
    name: string;
    createdAt: number;
    error?: string;
}

export const useRenderJobs = (projectId?: string) => {
    const [jobs, setJobs] = useState<RenderJob[]>([]);

    useEffect(() => {
        if (!projectId) {
            setJobs([]);
            return;
        }

        const fetchJobs = async () => {
             try {
                const res = await fetch(`/api/render/project/${projectId}`);
                if (res.ok) {
                    const data = await res.json();
                    setJobs(data.jobs);
                }
             } catch (e) {
                console.error('Failed to fetch jobs', e);
             }
        };
        
        fetchJobs();
    }, [projectId]);

    const addJob = (job: RenderJob) => {
        setJobs(prev => [job, ...prev]);
    };

    const updateJob = (jobId: string, updates: Partial<RenderJob>) => {
        setJobs(prev => prev.map(job => 
            job.jobId === jobId ? { ...job, ...updates } : job
        ));
    };

    const clearJobs = () => {
        setJobs([]);
    };

    useEffect(() => {
        const activeJobs = jobs.filter(j => j.status === 'queued' || j.status === 'processing');
        if (activeJobs.length === 0) return;

        const interval = setInterval(async () => {
            for (const job of activeJobs) {
                try {
                    const res = await fetch(`/api/video/${job.jobId}`);
                    if (res.ok) {
                        const data = await res.json();
                        
                        if (data.status !== job.status || data.progress !== job.progress) {
                            if (data.status === 'completed') {
                                showAISuccess(`Video "${job.name}" rendered successfully!`);
                            } else if (data.status === 'failed') {
                                showAIError(`Video "${job.name}" failed to render: ${data.error}`);
                            }
                            updateJob(job.jobId, {
                                status: data.status,
                                videoUrl: data.videoUrl,
                                progress: data.progress,
                                error: data.error
                            });
                        }
                    }
                } catch (e) {
                    console.error(`Failed to check status for job ${job.jobId}`, e);
                }
            }
        }, 3000); 

        return () => clearInterval(interval);
    }, [jobs]);

    const cancelJob = async (jobId: string) => {
        try {
            await fetch('/api/render/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId })
            });
        } catch (e) {
            console.error(`Failed to cancel job ${jobId}`, e);
        }
    };

    return { jobs, addJob, updateJob, clearJobs, cancelJob };
};
