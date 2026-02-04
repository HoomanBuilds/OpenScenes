import { useEffect } from 'react';
import { storage } from '@/lib/storage/adapter';
import { Project } from '@/lib/storage/types';
import { Slide } from '../types';

type Params = {
  projectId: string | null;
  slides: Slide[];
  globalPrompt: string;
  projectName: string;
  visualStyle: string;
  setSlides: (s: Slide[]) => void;
  setGlobalPrompt: (s: string) => void;
  setProjectName: (s: string) => void;
  setVisualStyle: (s: string) => void;
  setLastSaved: (n: number) => void;
};

export function useProjectPersistence({
  projectId,
  slides,
  globalPrompt,
  projectName,
  visualStyle,
  setSlides,
  setGlobalPrompt,
  setProjectName,
  setVisualStyle,
  setLastSaved,
}: Params) {
  useEffect(() => {
    if (!projectId) return;

    (async () => {
      const project = await storage.getProject(projectId);
      if (!project) return;

      project.data.slides && setSlides(project.data.slides);
      project.data.globalPrompt && setGlobalPrompt(project.data.globalPrompt);
      project.name && setProjectName(project.name);
      project.data.themeId && setVisualStyle(project.data.themeId);
    })();
  }, [projectId]);

  useEffect(() => {
    if (!projectId || slides.length === 0) return;

    const t = setTimeout(async () => {
      const project = await storage.getProject(projectId);
      if (!project) return;

      let thumbnail = project.thumbnail;
      const first = slides[0];

      if (first?.background?.type === 'image') {
        thumbnail = first.background.value;
      } else {
        const img = first?.elements?.find(e => e.type === 'image');
        if (img) thumbnail = img.content as string;
      }

      const updated: Project = {
        ...project,
        name: projectName,
        description: globalPrompt || project.description,
        updatedAt: Date.now(),
        data: {
          ...project.data,
          slides,
          globalPrompt,
          themeId: visualStyle,
        },
        thumbnail,
      };

      await storage.saveProject(updated);
      setLastSaved(Date.now());
    }, 1000);

    return () => clearTimeout(t);
  }, [slides, globalPrompt, projectName, visualStyle, projectId]);
}
