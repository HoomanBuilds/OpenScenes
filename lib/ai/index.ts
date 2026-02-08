export {
  runPipeline,
  runEditPipeline,
  run,
  willSummarize,
  estimateSlideCount,
} from './pipeline';

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

export type {
  SummarizerInput,
  SummarizerOutput,
  
  DirectorInput,
  DirectorOutput,
  AssetDirective,
  SlideBatch,
  SceneGuidance,
  
  SlideGeneratorInput,
  SlideGeneratorOutput,
  
  AssetGeneratorInput,
  AssetGeneratorOutput,
  GeneratedAsset,
  
  ValidationResult,
  ValidationError,
  
  EditRequest,
  EditOutput,
  JSONPatch,
  
  PipelineInput,
  PipelineOutput,
  GenerationMetadata,
  
  ThemeConfig,
  ThemeColors,
  ThemeTypography,
  ThemeRegistry,
  
  AgentConfig,
  PromptConfig,
} from './types';

export {
  summarizeContent,
  needsSummarization,
  createMinimalSummary,
  formatSummaryForPrompt,
} from './summarizer';

export {
  planPresentation,
  createMinimalPlan,
  getSuggestedSlideCount,
} from './director';

export {
  generateSlides,
  generateSingleSlide,
  insertAssetUrls,
} from './slideGenerator';

export {
  generateAssets,
  generateSingleAsset,
  collectAssetDirectives,
} from './assetGenerator';

export {
  validateSlideJSON,
  autoFixSlides,
  repairSlideJSON,
  formatValidationErrors,
} from './validator';

export {
  smartEditSlide,
  smartEditPresentation,
} from './smartEditor';

export type {
  SmartEditRequest,
  SmartEditResult,
  EditType,
} from './smartEditor';

export {
  applyPatches,
  previewPatches,
  reversePatch,
  mergePatches,
} from './apply';

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
