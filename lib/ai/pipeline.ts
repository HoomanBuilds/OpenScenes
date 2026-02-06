/**
 * AI Pipeline Orchestrator
 * 
 * Main entry point connecting all AI modules.
 * Handles both generation and edit flows.
 */

import { AI_LIMITS } from './config';
import { summarizeContent, formatSummaryForPrompt, needsSummarization } from './summarizer';
import { planPresentation, createMinimalPlan } from './director';
import { generateSlides, insertAssetUrls } from './slideGenerator';
import { generateAssets, collectAssetDirectives } from './assetGenerator';
import { validateSlideJSON, autoFixSlides } from './validator';
import { generateEditPatches, createEditRequest } from './editor';
import { applyPatches } from './apply';
import type {
  PipelineInput,
  PipelineOutput,
  SummarizerOutput,
  DirectorOutput,
  GenerationMetadata,
  ThemeConfig,
} from './types';
import type { Slide } from '../schemas/template';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Load theme configuration from theme.json
 */
async function loadThemeConfig(themeName: string): Promise<ThemeConfig | null> {
  try {
    // In a real implementation, this would load from file or database
    // For now, return null to use default behavior
    console.log(`[Pipeline] Loading theme: ${themeName}`);
    return null;
  } catch (error) {
    console.warn(`[Pipeline] Failed to load theme: ${themeName}`, error);
    return null;
  }
}

/**
 * Get theme prompt injection
 */
function getThemePrompt(themeConfig: ThemeConfig | null, themeName: string): string {
  if (themeConfig?.prompt_injection) {
    return themeConfig.prompt_injection;
  }
  
  // Default minimal theme guidance
  return `Theme: ${themeName}
Use professional styling with clean layouts.
Background: dark colors (#0a0a0a, #18181b)
Text: white for headlines, gray for body
Accent: indigo (#6366f1)`;
}

/**
 * Build generation metadata
 */
function buildMetadata(
  input: PipelineInput,
  summary: SummarizerOutput | null,
  directorPlan: DirectorOutput | null
): GenerationMetadata {
  return {
    topic: summary?.topic,
    intent: summary?.intent,
    summary: summary?.summary,
    keyPoints: summary?.keyPoints.map(kp => kp.point),
    commonPrompt: directorPlan?.commonPrompt,
    generatedAt: new Date().toISOString(),
    themeName: input.themeName,
    userQuery: input.userQuery,
    narrativeArc: directorPlan?.narrativeArc,
  };
}

// ============================================================================
// GENERATION PIPELINE
// ============================================================================

/**
 * Run the full generation pipeline
 * 
 * Flow:
 * 1. Summarize content (if needed)
 * 2. Director planning
 * 3. Asset generation (if requested)
 * 4. Slide generation (batched)
 * 5. JSON assembly & validation
 */
export async function runPipeline(input: PipelineInput): Promise<PipelineOutput> {
  console.log('[Pipeline] Starting generation pipeline...');
  console.log(`[Pipeline] Theme: ${input.themeName}`);
  console.log(`[Pipeline] Query: "${input.userQuery.slice(0, 100)}..."`);
  
  // Step 0: Load theme
  const themeConfig = await loadThemeConfig(input.themeName);
  const themePrompt = getThemePrompt(themeConfig, input.themeName);
  
  // Step 1: Summarization
  let summary: SummarizerOutput | null = null;
  
  const hasContent = input.userQuery || input.uploadedFileContent || input.urlContent;
  
  if (hasContent) {
    summary = await summarizeContent({
      userQuery: input.userQuery,
      fileContent: input.uploadedFileContent,
      urlContent: input.urlContent,
    });
    
    console.log(`[Pipeline] Summarization complete - Topic: "${summary.topic}"`);
  }
  
  // Step 2: Director Planning
  let directorPlan: DirectorOutput;
  
  try {
    directorPlan = await planPresentation({
      userQuery: input.userQuery,
      summary: summary || undefined,
      themeName: input.themeName,
      themePrompt,
      requestedSlideCount: input.requestedSlideCount,
      additionalInstructions: input.additionalInstructions,
    });
    
    console.log(`[Pipeline] Director planned ${directorPlan.totalSlides} slides in ${directorPlan.batches.length} batches`);
  } catch (error) {
    console.warn('[Pipeline] Director failed, using minimal plan:', error);
    
    // Fallback to minimal plan
    directorPlan = createMinimalPlan(
      input.userQuery,
      input.themeName,
      input.requestedSlideCount || summary?.suggestedSlideCount || 6
    );
  }
  
  // Step 3: Asset Generation
  const assetDirectives = collectAssetDirectives(directorPlan.batches);
  let assetUrls = new Map<string, string>();
  
  if (assetDirectives.length > 0) {
    console.log(`[Pipeline] Generating ${assetDirectives.length} assets...`);
    
    const assetResult = await generateAssets({ directives: assetDirectives });
    assetUrls = assetResult.assets;
    
    console.log(`[Pipeline] Generated ${assetUrls.size} assets`);
  }
  
  // Step 4: Slide Generation (batched)
  const allSlides: Slide[] = [];
  let previousSummary = '';
  
  for (let batchIndex = 0; batchIndex < directorPlan.batches.length; batchIndex++) {
    const batch = directorPlan.batches[batchIndex];
    const batchScenes = directorPlan.scenes.filter(s => 
      batch.slides.includes(s.sceneIndex)
    );
    
    console.log(`[Pipeline] Generating batch ${batchIndex + 1}/${directorPlan.batches.length} (${batchScenes.length} slides)...`);
    
    try {
      const batchResult = await generateSlides({
        commonPrompt: directorPlan.commonPrompt,
        batchPrompt: batch.prompt,
        themePrompt,
        sceneGuidance: batchScenes,
        previousSlideSummary: previousSummary,
        assetUrls,
      });
      
      allSlides.push(...batchResult.slides);
      previousSummary = batchResult.batchSummary;
      
      console.log(`[Pipeline] Batch ${batchIndex + 1} complete: ${batchResult.slides.length} slides`);
    } catch (error) {
      console.error(`[Pipeline] Batch ${batchIndex + 1} failed:`, error);
      // Continue with remaining batches
    }
  }
  
  // Step 5: Insert asset URLs
  let finalSlides = insertAssetUrls(allSlides, assetUrls);
  
  // Step 6: Validation
  console.log('[Pipeline] Validating generated slides...');
  
  const validation = validateSlideJSON(finalSlides);
  
  if (!validation.valid) {
    console.warn(`[Pipeline] Validation found ${validation.errors.length} errors, auto-fixing...`);
    finalSlides = autoFixSlides(finalSlides);
  }
  
  // Enforce slide limit
  if (finalSlides.length > AI_LIMITS.MAX_SLIDES) {
    console.warn(`[Pipeline] Capping slides from ${finalSlides.length} to ${AI_LIMITS.MAX_SLIDES}`);
    finalSlides = finalSlides.slice(0, AI_LIMITS.MAX_SLIDES);
  }
  
  // Build metadata
  const metadata = buildMetadata(input, summary, directorPlan);
  
  console.log(`[Pipeline] Generation complete: ${finalSlides.length} slides`);
  
  return {
    slides: finalSlides,
    metadata,
    isEdit: false,
  };
}

// ============================================================================
// EDIT PIPELINE
// ============================================================================

/**
 * Run the edit pipeline
 * 
 * Flow:
 * 1. Generate patches from instruction
 * 2. Apply patches to existing slides
 * 3. Validate result
 */
export async function runEditPipeline(input: PipelineInput): Promise<PipelineOutput> {
  console.log('[Pipeline] Starting edit pipeline...');
  console.log(`[Pipeline] Instruction: "${input.editInstruction?.slice(0, 100)}..."`);
  
  if (!input.existingSlides || !input.editInstruction) {
    throw new Error('Edit pipeline requires existingSlides and editInstruction');
  }
  
  // Step 1: Generate patches
  const editRequest = createEditRequest(
    input.existingSlides,
    input.editInstruction,
    input.previousMetadata
  );
  
  const editResult = await generateEditPatches(editRequest);
  
  console.log(`[Pipeline] Generated ${editResult.patches.length} patches`);
  
  // Step 2: Apply patches
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
  
  // Step 3: Build updated metadata
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

// ============================================================================
// UNIFIED ENTRY POINT
// ============================================================================

/**
 * Run pipeline (auto-detects generation vs edit mode)
 */
export async function run(input: PipelineInput): Promise<PipelineOutput> {
  // Determine mode
  const isEditMode = !!(input.existingSlides && input.editInstruction);
  
  if (isEditMode) {
    return runEditPipeline(input);
  }
  
  return runPipeline(input);
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Check if summarization will be needed
 */
export function willSummarize(input: PipelineInput): boolean {
  return needsSummarization({
    userQuery: input.userQuery,
    fileContent: input.uploadedFileContent,
    urlContent: input.urlContent,
  });
}

/**
 * Estimate number of slides for given input
 */
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
