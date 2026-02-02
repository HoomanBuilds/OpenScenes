export type ProjectStatus = 'draft' | 'planning' | 'rendering' | 'done' | 'failed';

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  status: ProjectStatus;
  data: any; // The JSON schema for slides
  thumbnail?: string;
  renderProgress?: number;
  videoUrl?: string; // If rendered
}

export interface StorageAdapter {
  listProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  saveProject(project: Project): Promise<void>;
  deleteProject(id: string): Promise<void>;
  getNextRenderId(): Promise<number>; // Helper for render IDs
  saveRenderLog(id: number, log: string): Promise<void>;
}
