import { Project, StorageAdapter, JobRecord } from './types';

const STORAGE_KEY = 'clarity_projects_v1';
const RENDER_COUNTER_KEY = 'clarity_render_counter';
const RENDER_LOGS_KEY = 'clarity_render_logs';
const JOBS_KEY = 'clarity_jobs';

const jobStore: Record<string, JobRecord> = {};

class LocalStorageAdapter implements StorageAdapter {
  private getProjectsFromStorage = (): Record<string, Project> => {
    if (typeof window === 'undefined') return {};
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  }

  private saveProjectsToStorage = (projects: Record<string, Project>) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }

  listProjects = async (): Promise<Project[]> => {
    const projects = this.getProjectsFromStorage();
    return Object.values(projects).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  getProject = async (id: string): Promise<Project | null> => {
    const projects = this.getProjectsFromStorage();
    return projects[id] || null;
  }

  saveProject = async (project: Project): Promise<void> => {
    const projects = this.getProjectsFromStorage();
    projects[project.id] = { ...project, updatedAt: Date.now() };
    this.saveProjectsToStorage(projects);
  }

  deleteProject = async (id: string): Promise<void> => {
    const projects = this.getProjectsFromStorage();
    delete projects[id];
    this.saveProjectsToStorage(projects);
  }

  getNextRenderId = async (): Promise<number> => {
      if (typeof window === 'undefined') return Math.floor(Math.random() * 10000);
      const current = parseInt(localStorage.getItem(RENDER_COUNTER_KEY) || '0', 10);
      const next = current + 1;
      localStorage.setItem(RENDER_COUNTER_KEY, next.toString());
      return next;
  }

  saveRenderLog = async (id: number, log: string): Promise<void> => {
       if (typeof window === 'undefined') return;
       const raw = localStorage.getItem(RENDER_LOGS_KEY);
       const logs = raw ? JSON.parse(raw) : {};
       logs[id] = log;
       localStorage.setItem(RENDER_LOGS_KEY, JSON.stringify(logs));
  }

  getJob = async (jobId: string): Promise<JobRecord | null> => {
    if (typeof window === 'undefined') {
      return jobStore[jobId] || null;
    }
    const raw = localStorage.getItem(JOBS_KEY);
    const jobs = raw ? JSON.parse(raw) : {};
    return jobs[jobId] || null;
  }

  saveJob = async (job: JobRecord): Promise<void> => {
    if (typeof window === 'undefined') {
      jobStore[job.jobId] = job;
      return;
    }
    const raw = localStorage.getItem(JOBS_KEY);
    const jobs = raw ? JSON.parse(raw) : {};
    jobs[job.jobId] = job;
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  }
}

export const localStorageAdapter = new LocalStorageAdapter();

