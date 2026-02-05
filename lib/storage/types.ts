export type ProjectStatus = 'draft' | 'planning' | 'rendering' | 'done' | 'failed';

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  status: ProjectStatus;
  data: any;
  thumbnail?: string;
  renderProgress?: number;
  videoUrl?: string;
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

export interface StorageAdapter {
  listProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  saveProject(project: Project): Promise<void>;
  deleteProject(id: string): Promise<void>;
  getNextRenderId(): Promise<number>;
  saveRenderLog(id: number, log: string): Promise<void>;
  getJob(jobId: string): Promise<JobRecord | null>;
  saveJob(job: JobRecord): Promise<void>;
}

