import { z } from 'zod';
import { aiGenerateStructured } from './adapter';
import { AI_LIMITS, CANVAS } from './config';
import { formatSummaryForPrompt } from './summarizer';
import type { 
  DirectorInput, 
  DirectorOutput, 
  SummarizerOutput,
  SceneGuidance,
  SlideBatch,
} from './types';

const SceneGuidanceSchema = z.object({
  sceneIndex: z.number(),
  sceneId: z.string(),
  slideType: z.string(),
  intent: z.string(),
  durationFrames: z.number().min(60).max(600),
  keyContent: z.object({
    headline: z.string().optional().describe('Main title or headline'),
    subheadline: z.string().optional().describe('Subtitle or supporting text'),
    body: z.string().optional().describe('Main paragraph text'),
    items: z.array(z.string()).optional().describe('List items or bullet points'),
    label: z.string().optional().describe('Button label or catgory tag'),
  }).describe('Key text content for the slide'),
  visualGuidance: z.string(),
  animationNotes: z.string().optional(),
  elementsHint: z.array(z.string()).optional(),
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
  commonPrompt: z.string(),
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

const DIRECTOR_SYSTEM_PROMPT = `You are the PRESENTATION DIRECTOR for OpenScenes, an AI video presentation generator.

## YOUR ROLE
You take summarized content and plan a compelling video presentation. You decide:
1. The narrative arc (how the story flows)
2. What each slide should accomplish
3. The pacing and emotional journey
4. Batching strategy for generation
5. Asset requirements (images needed)

## CANVAS CONSTRAINTS
- Viewport: ${CANVAS.width}px × ${CANVAS.height}px (16:9)
- Origin: Top-left (0, 0)
- Z-Index Layers: Background (0-5), Decoration (6-9), Content (10-20), Overlay (21+)

## AVAILABLE SLIDE TYPES
- title: Opening slide with headline + tagline
- problem: Present the challenge/pain point
- solution: Introduce the answer
- features: Showcase capabilities (grid or list)
- metrics: Data-driven stats with charts
- comparison: Side-by-side old vs new
- testimonial: Quote with attribution
- pricing: Tier-based pricing display
- roadmap: Timeline visualization
- team: People showcase
- cta: Final call-to-action
- default: Generic content slide

## BATCHING RULES
- Group 2-3 slides per batch
- Keep related slides in same batch (e.g., problem + solution)
- Assets should be requested in the batch where they're used
- Maximum ${AI_LIMITS.MAX_ASSETS_PER_RENDER} total assets per presentation

## RULES
1. Maximum ${AI_LIMITS.MAX_SLIDES} slides per presentation.
2. Each scene MUST have specific keyContent - never leave it vague.
3. The commonPrompt is injected into every scene creator call.
4. Vary slide types - avoid 3+ consecutive text-heavy slides.
5. Duration should be 120-300 frames per slide (at 30fps, 4-10 seconds).
6. If content is sparse, use fewer slides.
7. Always end with a cta slide.`;

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
  
  for (let i = 0; i < scenes.length; i += batchSize) {
    const batchScenes = scenes.slice(i, i + batchSize);
    const slideIndices = batchScenes.map(s => s.sceneIndex);
    
    const batchPrompt = batchScenes.map(scene => 
      `Slide ${scene.sceneIndex + 1} (${scene.slideType}): ${scene.intent}`
    ).join('\n');
    
    batches.push({
      slides: slideIndices,
      prompt: batchPrompt,
    });
  }
  
  return batches;
}

function validateDirectorOutput(output: DirectorOutput): DirectorOutput {
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
  }
  
  return output;
}

export async function planPresentation(
  input: DirectorInput,
  themesRegistry?: Record<string, unknown>
): Promise<DirectorOutput> {
  console.log('[Director] Starting presentation planning...');
  console.log(`[Director] Theme: ${input.themeName}`);
  
  const prompt = buildDirectorPrompt(input, themesRegistry);
  
  try {
    const result = await aiGenerateStructured({
      model: 'medium',
      schema: DirectorOutputSchema,
      schemaName: 'DirectorOutput',
      schemaDescription: 'Presentation structure and batching plan',
      systemPrompt: DIRECTOR_SYSTEM_PROMPT,
      prompt,
      agentType: 'director',
    });
    
    const validatedResult = validateDirectorOutput(result);
    
    console.log(`[Director] Planned ${validatedResult.totalSlides} slides in ${validatedResult.batches.length} batches`);
    console.log(`[Director] Narrative arc: ${validatedResult.narrativeArc.join(' → ')}`);
    
    return validatedResult;
  } catch (error) {
    console.error('[Director] Error during planning:', error);
    throw new Error(`Director planning failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function getSuggestedSlideCount(summary?: SummarizerOutput): number {
  if (!summary) {
    return 6; // Default
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
    slideType: 'title',
    intent: 'Hook the viewer with the main topic',
    durationFrames: 180,
    keyContent: { headline: 'Title', subheadline: 'Subtitle' },
    visualGuidance: 'Center-aligned hero text',
  });
  
  const middleCount = Math.max(1, slideCount - 2);
  const middleTypes = ['features', 'solution', 'metrics', 'comparison'];
  
  for (let i = 0; i < middleCount; i++) {
    const type = middleTypes[i % middleTypes.length];
    scenes.push({
      sceneIndex: i + 1,
      sceneId: `scene-${type}-${i}`,
      slideType: type,
      intent: `Present ${type} content`,
      durationFrames: 180,
      keyContent: { body: `${type} content` },
      visualGuidance: 'Follow theme guidelines',
    });
  }
  
  scenes.push({
    sceneIndex: scenes.length,
    sceneId: 'scene-cta',
    slideType: 'cta',
    intent: 'Call to action',
    durationFrames: 180,
    keyContent: { headline: 'Get Started', label: 'Learn More' },
    visualGuidance: 'Bold, centered call to action',
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
    scenes,
    batches: createBatchesFromScenes(scenes),
  };
}
