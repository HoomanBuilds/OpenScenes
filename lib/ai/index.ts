/**
 * AI Pipeline - Public API
 * 
 * Export all public interfaces and functions for the AI generation pipeline.
 */

// ============================================================================
// MAIN PIPELINE
// ============================================================================

export {
  runPipeline,
  runEditPipeline,
  run,
  willSummarize,
  estimateSlideCount,
} from './pipeline';

// ============================================================================
// CONFIGURATION
// ============================================================================

export {
  AI_CONFIG,
  AI_MODELS,
  AI_LIMITS,
  AI_TEMPERATURES,
  CANVAS,
  VALIDATION,
  SUPPORTED_ELEMENT_TYPES,
  SUPPORTED_SLIDE_TYPES,
  SUPPORTED_ANIMATION_TYPES,
  SUPPORTED_BACKGROUND_TYPES,
  type ModelAlias,
} from './config';

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Summarizer
  SummarizerInput,
  SummarizerOutput,
  
  // Director
  DirectorInput,
  DirectorOutput,
  AssetDirective,
  SlideBatch,
  SceneGuidance,
  
  // Generator
  SlideGeneratorInput,
  SlideGeneratorOutput,
  
  // Assets
  AssetGeneratorInput,
  AssetGeneratorOutput,
  GeneratedAsset,
  
  // Validator
  ValidationResult,
  ValidationError,
  
  // Editor
  EditRequest,
  EditOutput,
  JSONPatch,
  
  // Pipeline
  PipelineInput,
  PipelineOutput,
  GenerationMetadata,
  
  // Theme
  ThemeConfig,
  ThemeColors,
  ThemeTypography,
  ThemeRegistry,
  
  // Prompts
  AgentConfig,
  PromptConfig,
} from './types';

// ============================================================================
// INDIVIDUAL MODULES (for advanced usage)
// ============================================================================

// Summarizer
export {
  summarizeContent,
  needsSummarization,
  createMinimalSummary,
  formatSummaryForPrompt,
} from './summarizer';

// Director
export {
  planPresentation,
  createMinimalPlan,
  getSuggestedSlideCount,
} from './director';

// Slide Generator
export {
  generateSlides,
  generateSingleSlide,
  insertAssetUrls,
} from './slideGenerator';

// Asset Generator
export {
  generateAssets,
  generateSingleAsset,
  collectAssetDirectives,
  isUsingRealImageGeneration,
} from './assetGenerator';

// Validator
export {
  validateSlideJSON,
  autoFixSlides,
  repairSlideJSON,
  formatValidationErrors,
} from './validator';

// Editor
export {
  generateEditPatches,
  createEditRequest,
  quickTextReplace,
  quickBackgroundChange,
  canQuickEdit,
} from './editor';

// Apply
export {
  applyPatches,
  previewPatches,
  reversePatch,
  mergePatches,
} from './apply';

// ============================================================================
// ADAPTER (for custom AI calls)
// ============================================================================

export {
  aiGenerateText,
  aiGenerateStructured,
  aiGenerateJSON,
  isVertexConfigured,
  getVertexConfig,
  estimateTokens,
  exceedsTokenLimit,
  type GenerateTextOptions,
  type GenerateStructuredOptions,
  type GenerateJSONOptions,
} from './adapter';
