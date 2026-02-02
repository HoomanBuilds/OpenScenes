import { Project, StorageAdapter } from './types';

const STORAGE_KEY = 'clarity_projects_v1';
const RENDER_COUNTER_KEY = 'clarity_render_counter';
const RENDER_LOGS_KEY = 'clarity_render_logs';

class LocalStorageAdapter implements StorageAdapter {
  private getProjectsFromStorage(): Record<string, Project> {
    if (typeof window === 'undefined') return {};
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  }

  private saveProjectsToStorage(projects: Record<string, Project>) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }

  async listProjects(): Promise<Project[]> {
    const projects = this.getProjectsFromStorage();
    return Object.values(projects).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async getProject(id: string): Promise<Project | null> {
    const projects = this.getProjectsFromStorage();
    return projects[id] || null;
  }

  async saveProject(project: Project): Promise<void> {
    const projects = this.getProjectsFromStorage();
    projects[project.id] = { ...project, updatedAt: Date.now() };
    this.saveProjectsToStorage(projects);
  }

  async deleteProject(id: string): Promise<void> {
    const projects = this.getProjectsFromStorage();
    delete projects[id];
    this.saveProjectsToStorage(projects);
  }

  async getNextRenderId(): Promise<number> {
      if (typeof window === 'undefined') return Math.floor(Math.random() * 10000);
      const current = parseInt(localStorage.getItem(RENDER_COUNTER_KEY) || '0', 10);
      const next = current + 1;
      localStorage.setItem(RENDER_COUNTER_KEY, next.toString());
      return next;
  }

  async saveRenderLog(id: number, log: string): Promise<void> {
       if (typeof window === 'undefined') return;
       const raw = localStorage.getItem(RENDER_LOGS_KEY);
       const logs = raw ? JSON.parse(raw) : {};
       logs[id] = log;
       localStorage.setItem(RENDER_LOGS_KEY, JSON.stringify(logs));
  }
}

// Export a singleton instance
// Note: This needs to be client-side only. 
// For SSR safety in Next.js, we might need a wrapper or just ensure it's only called in useEffect/components.
export const localStorageAdapter = new LocalStorageAdapter();
