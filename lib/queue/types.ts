export interface RenderJob {
  jobId: string;
  templateData: any;
  fps: number;
  scale: number;
  format: 'mp4' | 'webm';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  createdAt: number;
}

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface JobRecord {
  jobId: string;
  status: JobStatus;
  videoUrl?: string;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

export interface QueueAdapter {
  connect(): Promise<void>;
  publishRenderJob(job: RenderJob): Promise<void>;
  consumeRenderJobs(handler: (job: RenderJob) => Promise<void>): Promise<void>;
  close(): Promise<void>;
}
