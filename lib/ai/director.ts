import { z } from 'zod';
import { aiGenerateStructured } from './adapter';
import { AI_LIMITS, AI_IMAGE_CONFIG, CANVAS } from './config';
import { formatSummaryForPrompt } from './summarizer';
import { logger } from './logger';
import type { 
  DirectorInput, 
  DirectorOutput, 
  SummarizerOutput,
  SceneGuidance,
  SlideBatch,
} from './types';

import { getDirectorSystemPrompt } from './prompts';

const SceneGuidanceSchema = z.object({
  sceneIndex: z.number(),
  sceneId: z.string(),
  mode: z.enum(['component', 'custom', 'generative']).describe('Generation mode'),
  slideType: z.enum([
    'title', 'problem', 'solution', 'features', 'metrics', 
    'comparison', 'testimonial', 'pricing', 'roadmap', 
    'team', 'cta'
  ]).describe('Categorical type of slide'),
  intent: z.string(),
  durationMs: z.number().min(2000).max(15000),
  slidePrompt: z.string().describe('Detailed, narrative prompt for this specific slide, including visual, animation, and content details.'),
  
  componentId: z.string().optional().describe('ID of the component to use (for component mode)'),
});

const DirectorOutputSchema = z.object({
  presentationTitle: z.string(),
  themeId: z.string(),
  totalSlides: z.number().min(1).max(AI_LIMITS.MAX_SLIDES),
  estimatedDurationSeconds: z.number(),
  narrativeArc: z.array(z.string()),
  globalStyle: z.object({
    fontHeadline: z.string().optional(),
    fontBody: z.string().optional(),
    animationStyle: z.enum(['smooth', 'punchy', 'minimal']).optional(),
    pacing: z.enum(['slow', 'moderate', 'fast']).optional(),
  }),
  commonPrompt: z.string().describe('Global visual and stylistic prompt applied to all slides'),
  globalPrompt: z.string().describe('Global visual prompt for consistency'),
  scenes: z.array(SceneGuidanceSchema),
  batches: z.array(z.object({
    slides: z.array(z.number()),
    prompt: z.string(),
    assets: z.array(z.object({
      type: z.literal('image'),
      prompt: z.string(),
      targetSlideId: z.string().optional(),
      targetElementId: z.string().optional(),
    })).optional(),
  })),
});

function buildThemesSummary(themes: Record<string, unknown>): string {
  const lines: string[] = ['Available themes:'];
  
  for (const [id, theme] of Object.entries(themes)) {
    const t = theme as { name: string; tags: string[]; description: string };
    lines.push(`- ${id}: ${t.name} - ${t.description} [${t.tags?.join(', ')}]`);
  }
  
  return lines.join('\n');
}

function buildDirectorPrompt(
  input: DirectorInput,
  themesRegistry?: Record<string, unknown>
): string {
  const parts: string[] = [];
  
  parts.push('Create a presentation plan based on the following content and preferences.');
  parts.push('');
  
  if (input.summary) {
    parts.push('### SUMMARIZED CONTENT ###');
    parts.push(formatSummaryForPrompt(input.summary));
    parts.push('### END SUMMARIZED CONTENT ###');
    parts.push('');
  } else {
    parts.push('### USER REQUEST ###');
    parts.push(input.userQuery);
    parts.push('### END USER REQUEST ###');
    parts.push('');
  }
  
  parts.push('### USER PREFERENCES ###');
  parts.push(`- Selected Theme: ${input.themeName}`);
  if (input.requestedSlideCount) {
    parts.push(`- Requested Slide Count: ${input.requestedSlideCount}`);
  }
  if (input.additionalInstructions) {
    parts.push(`- Additional Instructions: ${input.additionalInstructions}`);
  }
  parts.push('### END USER PREFERENCES ###');
  parts.push('');
  
  if (input.themePrompt) {
    parts.push('### SELECTED THEME STYLE GUIDE ###');
    parts.push(input.themePrompt);
    parts.push('### END THEME STYLE GUIDE ###');
    parts.push('');
  }
  
  if (themesRegistry) {
    parts.push('### AVAILABLE THEMES ###');
    parts.push(buildThemesSummary(themesRegistry));
    parts.push('### END AVAILABLE THEMES ###');
    parts.push('');
  }
  
  parts.push('Create the full presentation plan now. Include batches for generation.');
  
  return parts.join('\n');
}

function createBatchesFromScenes(
  scenes: SceneGuidance[], 
  batchSize: number = AI_LIMITS.BATCH_SIZE
): SlideBatch[] {
  const batches: SlideBatch[] = [];
  let currentBatch: SceneGuidance[] = [];

  const flushBatch = () => {
    if (currentBatch.length === 0) return;
    
    const slideIndices = currentBatch.map(s => s.sceneIndex);
    const batchPrompt = `[BATCH: ${currentBatch[0].mode.toUpperCase()}] Slides ${slideIndices.map(i => i + 1).join(', ')}`;
    
    batches.push({ slides: slideIndices, prompt: batchPrompt });
    currentBatch = [];
  };

  for (const scene of scenes) {
    if (scene.mode === 'custom' || scene.mode === 'generative') {
      flushBatch();
      
      batches.push({
        slides: [scene.sceneIndex],
        prompt: `[BATCH: ${scene.mode}] Slide ${scene.sceneIndex + 1} - ${scene.slideType}`
      });
      continue;
    }

    // Component mode: Group them
    if (scene.mode === 'component') {
      currentBatch.push(scene);
      if (currentBatch.length >= batchSize) {
        flushBatch();
      }
    }
  }

  flushBatch();
  return batches;
}

export function validateDirectorOutput(output: DirectorOutput): DirectorOutput {
  if (output.totalSlides > AI_LIMITS.MAX_SLIDES) {
    console.warn(`[Director] Capping slides from ${output.totalSlides} to ${AI_LIMITS.MAX_SLIDES}`);
    output.totalSlides = AI_LIMITS.MAX_SLIDES;
    output.scenes = output.scenes.slice(0, AI_LIMITS.MAX_SLIDES);
  }
  
  if (output.scenes.length !== output.totalSlides) {
    console.warn(`[Director] Scene count mismatch: ${output.scenes.length} scenes for ${output.totalSlides} slides`);
    output.totalSlides = output.scenes.length;
  }
  
  output.scenes = output.scenes.map((scene, index) => ({
    ...scene,
    sceneIndex: index,
    sceneId: scene.sceneId || `scene-${index}`,
  }));
  
  let totalAssets = 0;
  output.batches = output.batches.map(batch => {
    if (batch.assets) {
      const allowedAssets = batch.assets.slice(0, AI_LIMITS.MAX_ASSETS_PER_RENDER - totalAssets);
      totalAssets += allowedAssets.length;
      return { ...batch, assets: allowedAssets };
    }
    return batch;
  });
  
  if (totalAssets > AI_LIMITS.MAX_ASSETS_PER_RENDER) {
    console.warn(`[Director] Capped assets from ${totalAssets} to ${AI_LIMITS.MAX_ASSETS_PER_RENDER}`);
  }
  
  if (!output.batches || output.batches.length === 0) {
    output.batches = createBatchesFromScenes(output.scenes);
  } else {
    const allIndices = output.batches.flatMap(b => b.slides);
    const maxIndex = Math.max(...(allIndices.length > 0 ? allIndices : [0]));
    
    if (maxIndex === output.scenes.length && !allIndices.includes(0)) {
      console.log('[Director] Detecting 1-based indexing, normalizing to 0-based');
      output.batches = output.batches.map(b => ({
        ...b,
        slides: b.slides.map(s => s - 1).filter(s => s >= 0 && s < output.scenes.length)
      }));
    } else {
      output.batches = output.batches.map(b => ({
        ...b,
        slides: b.slides.filter(s => s >= 0 && s < output.scenes.length)
      }));
    }
    
    const coveredIndices = new Set(output.batches.flatMap(b => b.slides));
    const missingIndices = output.scenes
      .map((_, i) => i)
      .filter(i => !coveredIndices.has(i));
      
    if (missingIndices.length > 0) {
      console.log(`[Director] Found ${missingIndices.length} orphaned scenes, adding to batches`);
      if (output.batches.length > 0) {
        output.batches[output.batches.length - 1].slides.push(...missingIndices);
        output.batches[output.batches.length - 1].slides.sort((a, b) => a - b);
      } else {
        output.batches = createBatchesFromScenes(output.scenes);
      }
    }
  }
  
  return output;
}

export async function planPresentation(
  input: DirectorInput,
  themesRegistry?: Record<string, unknown>
): Promise<DirectorOutput> {
  logger.director.planning(input.themeName);
  
  const prompt = buildDirectorPrompt(input, themesRegistry);
  
  if (input.jobId) {
    await logger.debug.prompt(input.jobId, '2-director', prompt, getDirectorSystemPrompt());
  }
  
  try {
    const result = await aiGenerateStructured({
      model: 'medium',
      schema: DirectorOutputSchema,
      schemaName: 'DirectorOutput',
      schemaDescription: 'Presentation structure and batching plan',
      systemPrompt: getDirectorSystemPrompt(),
      prompt,
      agentType: 'director',
    });
    
    const validatedResult = validateDirectorOutput(result);
    
    return validatedResult;
  } catch (error) {
    throw new Error(`Director planning failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function getSuggestedSlideCount(summary?: SummarizerOutput): number {
  if (!summary) {
    return 6; 
  }
  
  return Math.min(summary.suggestedSlideCount, AI_LIMITS.MAX_SLIDES);
}

export function createMinimalPlan(
  userQuery: string,
  themeName: string,
  slideCount: number = 6
): DirectorOutput {
  const scenes: SceneGuidance[] = [];
  
  scenes.push({
    sceneIndex: 0,
    sceneId: 'scene-title',
    mode: 'custom',
    slideType: 'title',
    intent: 'Hook the viewer with the main topic',
    durationMs: 6000,
    slidePrompt: 'A title slide. Center-aligned hero text with a bold, modern font. The background should be dark and abstract. The title should be "Title" and the subtitle "Subtitle".',
  });
  
  const middleCount = Math.max(1, slideCount - 2);
  const middleTypes = ['features', 'solution', 'metrics', 'comparison'];
  
  for (let i = 0; i < middleCount; i++) {
    const type = middleTypes[i % middleTypes.length];
    scenes.push({
      sceneIndex: i + 1,
      sceneId: `scene-${type}-${i}`,
      mode: 'custom',
      slideType: type,
      intent: `Present ${type} content`,
      durationMs: 6000,
      slidePrompt: `A ${type} slide. Follow the theme guidelines. Display clear, concise content related to ${type}.`,
    });
  }
  
  scenes.push({
    sceneIndex: scenes.length,
    sceneId: 'scene-cta',
    mode: 'custom',
    slideType: 'cta',
    intent: 'Call to action',
    durationMs: 6000,
    slidePrompt: 'A Call to Action slide. Bold, centered text "Get Started" with a "Learn More" label or button style. High contrast and impactful.',
  });
  
  return {
    presentationTitle: userQuery.slice(0, 50),
    themeId: themeName,
    totalSlides: scenes.length,
    estimatedDurationSeconds: scenes.length * 6,
    narrativeArc: ['hook', 'content', 'cta'],
    globalStyle: {
      animationStyle: 'smooth',
      pacing: 'moderate',
    },
    commonPrompt: `Create a presentation about: ${userQuery}`,
    globalPrompt: `Clean, modern presentation about ${userQuery}`,
    scenes,
    batches: createBatchesFromScenes(scenes),
  };
}
