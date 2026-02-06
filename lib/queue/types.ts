export interface RenderJob {
  jobId: string;
  templateData: any;
  fps: number;
  scale: number;
  format: 'mp4' | 'webm';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  createdAt: number;
}

export interface AIJob {
  jobId: string;
  type: 'generate' | 'edit';
  userQuery: string;
  themeName: string;
  themePrompt?: string;
  uploadedFileContent?: string;
  urlContent?: string;
  requestedSlideCount?: number;
  additionalInstructions?: string;
  existingSlides?: unknown[];
  editInstruction?: string;
  previousMetadata?: unknown;
  createdAt: number;
}

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelling' | 'cancelled';

export interface JobRecord {
  jobId: string;
  status: JobStatus;
  videoUrl?: string;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AIJobRecord {
  jobId: string;
  status: JobStatus;
  result?: {
    slides: unknown[];
    metadata: unknown;
    appliedPatches?: unknown[];
  };
  error?: string;
  createdAt: number;
  updatedAt: number;
}

export interface QueueAdapter {
  connect(): Promise<void>;
  publishRenderJob(job: RenderJob): Promise<void>;
  consumeRenderJobs(handler: (job: RenderJob) => Promise<void>): Promise<void>;
  publishAIJob(job: AIJob): Promise<void>;
  consumeAIJobs(handler: (job: AIJob) => Promise<void>): Promise<void>;
  close(): Promise<void>;
}

