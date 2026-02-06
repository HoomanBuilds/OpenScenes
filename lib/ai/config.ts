export const AI_MODELS = {
  main: 'gemini-2.5-flash',
  creative: 'gemini-2.5-pro',
  cheap: 'gemini-2.5-flash-lite',
  medium: 'gemini-2.5-flash',
  validator: 'gemini-2.5-flash-lite',
} as const;

export const AI_IMAGE_CONFIG = {
  model: 'imagen-3.0-fast-generate-001',
  enabled: () => process.env.ENABLE_AI_IMAGES === 'true',
  bucket: 'ai-assets',
} as const;

export type ModelAlias = keyof typeof AI_MODELS;

export const AI_LIMITS = {
  MAX_SLIDES: 12,
  MAX_ASSETS_PER_RENDER: 5,
  MAX_ELEMENTS_PER_SLIDE: 20,
  SUMMARIZE_THRESHOLD_CHARS: 8000,
  BATCH_SIZE: 3,
  MAX_RETRIES: 2,
  MAX_PATCHES_PER_EDIT: 20,
} as const;

export const AI_TEMPERATURES = {
  summarizer: 0.3,
  director: 0.7,
  generator: 0.5,
  validator: 0.2,
  editor: 0.2,
} as const;

export const AI_MAX_TOKENS = {
  summarizer: {
    input: 32000,
    output: 4000,
  },
  director: {
    input: 16000,
    output: 8000,
  },
  generator: {
    input: 8000,
    output: 16000,
  },
  validator: {
    input: 4000,
    output: 3000,
  },
  editor: {
    input: 8000,
    output: 2000,
  },
} as const;

export const CANVAS = {
  width: 1000,
  height: 562,
  aspectRatio: '16:9',
  zIndexLayers: {
    background: { min: 0, max: 5 },
    decoration: { min: 6, max: 9 },
    content: { min: 10, max: 20 },
    overlay: { min: 21, max: 50 },
  },
} as const;

export const VALIDATION = {
  bounds: {
    minX: 0,
    minY: 0,
    maxX: CANVAS.width,
    maxY: CANVAS.height,
  },
  
  animationDuration: {
    min: 0.1,
    max: 5.0,
  },
  
  fontSize: {
    min: 10,
    max: 200,
  },
  
  defaultSlideDuration: 180,
} as const;

export const SUPPORTED_ELEMENT_TYPES = [
  'headline',
  'subheadline', 
  'text',
  'shape',
  'chart',
  'image',
  'custom',
] as const;

export const SUPPORTED_SLIDE_TYPES = [
  'title',
  'problem',
  'solution',
  'features',
  'metrics',
  'comparison',
  'testimonial',
  'pricing',
  'roadmap',
  'team',
  'cta',
  'custom',
  'default',
] as const;

export const SUPPORTED_ANIMATION_TYPES = [
  'fade',
  'pop',
  'slide',
  'scale',
] as const;

export const SUPPORTED_BACKGROUND_TYPES = [
  'color',
  'gradient',
  'image',
] as const;

export const AI_CONFIG = {
  debug: true,
  models: AI_MODELS,
  limits: AI_LIMITS,
  temperatures: AI_TEMPERATURES,
  maxTokens: AI_MAX_TOKENS,
  canvas: CANVAS,
  validation: VALIDATION,
  supportedTypes: {
    elements: SUPPORTED_ELEMENT_TYPES,
    slides: SUPPORTED_SLIDE_TYPES,
    animations: SUPPORTED_ANIMATION_TYPES,
    backgrounds: SUPPORTED_BACKGROUND_TYPES,
  },
} as const;

export default AI_CONFIG;
