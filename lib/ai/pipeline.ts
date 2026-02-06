import { AI_LIMITS } from './config';
import { summarizeContent, formatSummaryForPrompt, needsSummarization } from './summarizer';
import { planPresentation, createMinimalPlan } from './director';
import { generateSlides, insertAssetUrls } from './slideGenerator';
import { generateAssets, collectAssetDirectives } from './assetGenerator';
import { validateSlideJSON, autoFixSlides } from './validator';
import { generateEditPatches, createEditRequest } from './editor';
import { applyPatches } from './apply';
import { logger } from './logger';
import type {
  PipelineInput,
  PipelineOutput,
  SummarizerOutput,
  DirectorOutput,
  AssetMetadata,
  GenerationMetadata,
  ThemeConfig,
} from './types';
import type { Slide } from '../schemas/template';

import { getTheme } from '@/app/lib/themes';

async function loadThemeConfig(themeName: string): Promise<ThemeConfig | null> {
  try {
    const appTheme = getTheme(themeName);
    if (!appTheme) return null;
    
    return {
       id: appTheme.id,
       name: appTheme.name,
       description: appTheme.description,
       preview_gradient: appTheme.preview_gradient,
       tags: appTheme.tags,
       colors: {
           background_primary: appTheme.colors.background_primary,
           background_secondary: appTheme.colors.background_secondary,
           background_tertiary: appTheme.colors.background_tertiary,
           text_primary: appTheme.colors.text_primary,
           text_secondary: appTheme.colors.text_secondary || '#a1a1aa',
           text_muted: appTheme.colors.text_muted || '#52525b',
           accent_primary: appTheme.colors.accent_primary,
           accent_secondary: appTheme.colors.accent_secondary || appTheme.colors.accent_primary,
           accent_tertiary: appTheme.colors.accent_tertiary,
           success: appTheme.colors.success || '#22c55e',
           warning: appTheme.colors.warning || '#eab308',
           error: appTheme.colors.error || '#ef4444',
           chart_palette: appTheme.colors.chart_palette || [appTheme.colors.accent_primary]
       },
       typography: {
           font_headline: appTheme.typography.font_headline,
           font_body: appTheme.typography.font_body,
           headline_sizes: { hero: 96, large: 64, medium: 48, small: 32 },
           body_sizes: { large: 24, medium: 18, small: 16 },
           line_height: 1.5
       },
       spacing: { margin_x: 60, margin_y: 60, element_gap: 20, section_gap: 40 },
       decorations: {},
       animations: { default_type: 'fade', default_duration: 0.5, stagger_delay: 0.1, style: 'smooth' },
       prompt_injection: appTheme.prompt_injection
    };
  } catch (error) {
    console.warn("Failed to load theme config", error);
    return null;
  }
}

function getThemePrompt(themeConfig: ThemeConfig | null, themeName: string): string {
  if (themeConfig?.prompt_injection) {
    return themeConfig.prompt_injection;
  }
  
  return `Theme: ${themeName}
Use professional styling with clean layouts.
Background: dark colors (#0a0a0a, #18181b)
Text: white for headlines, gray for body
Accent: indigo (#6366f1)`;
}

function buildMetadata(
  input: PipelineInput,
  summary: SummarizerOutput | null,
  directorPlan: DirectorOutput | null,
  assetUrls?: string[]
): GenerationMetadata {
  return {
    topic: summary?.topic,
    intent: summary?.intent,
    summary: summary?.summary,
    keyPoints: summary?.keyPoints.map(kp => kp.point),
    commonPrompt: directorPlan?.commonPrompt,
    assetUrls,
    generatedAt: new Date().toISOString(),
    themeName: input.themeName,
    userQuery: input.userQuery,
    narrativeArc: directorPlan?.narrativeArc,
  };
}

export async function runPipeline(input: PipelineInput): Promise<PipelineOutput> {
  logger.pipeline.start(input.themeName);
  
  const themeConfig = await loadThemeConfig(input.themeName);
  const themePrompt = getThemePrompt(themeConfig, input.themeName);
  
  let summary: SummarizerOutput | null = null;
  
  const hasContent = input.userQuery || input.uploadedFileContent || input.urlContent;
  
  if (hasContent) {
    summary = await summarizeContent({
      userQuery: input.userQuery,
      fileContent: input.uploadedFileContent,
      urlContent: input.urlContent,
      jobId: input.jobId,
    });
    
    logger.summarizer.complete(summary.topic);
    await logger.debug.log(input.jobId || 'unknown', '1-summarizer', summary);
  }
  
  let directorPlan: DirectorOutput;
  
  try {
    directorPlan = await planPresentation({
      userQuery: input.userQuery,
      summary: summary || undefined,
      themeName: input.themeName,
      themePrompt,
      requestedSlideCount: input.requestedSlideCount,
      additionalInstructions: input.additionalInstructions,
      jobId: input.jobId,
    });
    
    logger.director.planned(
      directorPlan.totalSlides, 
      directorPlan.batches.length, 
      directorPlan.narrativeArc
    );
    await logger.debug.log(input.jobId || 'unknown', '2-director-plan', directorPlan);
  } catch {
    directorPlan = createMinimalPlan(
      input.userQuery,
      input.themeName,
      input.requestedSlideCount || summary?.suggestedSlideCount || 6
    );
  }
  
  const assetDirectives = collectAssetDirectives(directorPlan.batches);
  let assetMetadata = new Map<string, AssetMetadata>();
  
  if (assetDirectives.length > 0) {
    logger.asset.generating(assetDirectives.length);
    await logger.debug.log(input.jobId || 'unknown', '3-asset-directives', assetDirectives);
    
    const assetResult = await generateAssets({ 
      directives: assetDirectives,
      jobId: input.jobId,
    });
    assetMetadata = assetResult.assets;
    await logger.debug.log(input.jobId || 'unknown', '4-asset-results', {
      assets: Object.fromEntries(assetMetadata),
      results: assetResult.results
    });
    
    logger.asset.complete(assetResult.results.filter(r => r.success).length, assetResult.results.filter(r => !r.success).length);
  }
  
  const allSlides: Slide[] = [];
  let previousSummary = '';
  
  for (let batchIndex = 0; batchIndex < directorPlan.batches.length; batchIndex++) {
    const batch = directorPlan.batches[batchIndex];
    const batchScenes = directorPlan.scenes.filter(s => 
      batch.slides.includes(s.sceneIndex)
    );
    
    logger.generator.generating(batchScenes.length, batchIndex + 1, directorPlan.batches.length);
    
    try {
      const batchResult = await generateSlides({
        commonPrompt: directorPlan.commonPrompt,
        batchPrompt: batch.prompt,
        themePrompt,
        sceneGuidance: batchScenes,
        previousSlideSummary: previousSummary,
        assetMetadata,
        themeConfig: themeConfig || undefined, // Pass the loaded theme
        jobId: input.jobId,
      });
      
      allSlides.push(...batchResult.slides);
      previousSummary = batchResult.batchSummary;
      
      await logger.debug.log(input.jobId || 'unknown', `5-batch-${batchIndex + 1}`, batchResult);
      logger.generator.generated(batchResult.slides.length);
    } catch (error) {
       console.error(`[Pipeline] Batch ${batchIndex + 1} failed:`, error);
       await logger.debug.log(input.jobId || 'unknown', `5-batch-${batchIndex + 1}-error`, { error: error instanceof Error ? error.message : String(error) });
    }
  }
  
  let finalSlides = insertAssetUrls(allSlides, assetMetadata);
  
  logger.validator.validating();
  
  const validation = validateSlideJSON(finalSlides);
  
  if (!validation.valid) {
    logger.validator.fixed(validation.errors.length);
    finalSlides = autoFixSlides(finalSlides);
    await logger.debug.log(input.jobId || 'unknown', '6-validation-fix', {
      initial: validation.errors,
      fixed: finalSlides
    });
  } else {
    logger.validator.valid();
  }
  
  if (finalSlides.length > AI_LIMITS.MAX_SLIDES) {
    finalSlides = finalSlides.slice(0, AI_LIMITS.MAX_SLIDES);
  }
  
  const assetUrls = Array.from(assetMetadata.values()).map(a => a.url);
  const metadata = buildMetadata(input, summary, directorPlan, assetUrls);
  
  logger.pipeline.complete(finalSlides.length);
  await logger.debug.log(input.jobId || 'unknown', '7-final-output', {
    slides: finalSlides,
    metadata
  });
  
  return {
    slides: finalSlides,
    metadata,
    isEdit: false,
  };
}

export async function runEditPipeline(input: PipelineInput): Promise<PipelineOutput> {
  console.log('[Pipeline] Starting edit pipeline...');
  console.log(`[Pipeline] Instruction: "${input.editInstruction?.slice(0, 100)}..."`);
  
  if (!input.existingSlides || !input.editInstruction) {
    throw new Error('Edit pipeline requires existingSlides and editInstruction');
  }
  
  const editRequest = createEditRequest(
    input.existingSlides,
    input.editInstruction,
    input.previousMetadata
  );
  
  const editResult = await generateEditPatches(editRequest);
  
  console.log(`[Pipeline] Generated ${editResult.patches.length} patches`);
  
  let editedSlides: Slide[];
  
  try {
    editedSlides = applyPatches(input.existingSlides, editResult.patches, {
      validate: true,
      autoFix: true,
    });
  } catch (error) {
    console.error('[Pipeline] Patch application failed:', error);
    throw new Error(`Failed to apply edits: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  const metadata: GenerationMetadata = {
    ...input.previousMetadata,
    generatedAt: new Date().toISOString(),
    themeName: input.themeName,
    userQuery: input.editInstruction,
  };
  
  console.log(`[Pipeline] Edit complete: ${editedSlides.length} slides`);
  
  return {
    slides: editedSlides,
    metadata,
    isEdit: true,
    appliedPatches: editResult.patches,
  };
}

export async function run(input: PipelineInput): Promise<PipelineOutput> {
  const isEditMode = !!(input.existingSlides && input.editInstruction);
  
  if (isEditMode) {
    return runEditPipeline(input);
  }
  
  return runPipeline(input);
}

export function willSummarize(input: PipelineInput): boolean {
  return needsSummarization({
    userQuery: input.userQuery,
    fileContent: input.uploadedFileContent,
    urlContent: input.urlContent,
  });
}

export function estimateSlideCount(input: PipelineInput): number {
  const contentLength = [
    input.userQuery?.length || 0,
    input.uploadedFileContent?.length || 0,
    input.urlContent?.length || 0,
  ].reduce((a, b) => a + b, 0);
  
  if (contentLength < 500) return 4;
  if (contentLength < 2000) return 6;
  if (contentLength < 5000) return 8;
  return Math.min(12, Math.ceil(contentLength / 1000));
}
