import type { Slide, SlideElement } from '../schemas/template';

export interface SummarizerInput {
  userQuery: string;
  fileContent?: string;
  urlContent?: string;
}

export interface SummarizerOutput {
  topic: string;
  intent: 'product_launch' | 'educational' | 'pitch_deck' | 'report' | 'showcase' | 'explainer' | 'general';
  summary: string;
  keyPoints: Array<{
    priority: number;
    point: string;
    details?: string;
  }>;
  entities: {
    productName?: string;
    companyName?: string;
    tagline?: string;
    metrics?: Array<{ label: string; value: string }>;
    features?: string[];
    cta?: string;
    urls?: string[];
  };
  tone: 'professional' | 'playful' | 'bold' | 'minimal' | 'corporate';
  suggestedSlideCount: number;
  contentDensity: 'sparse' | 'balanced' | 'dense';
}

export interface DirectorInput {
  userQuery: string;
  summary?: SummarizerOutput;
  themeName: string;
  themePrompt: string;
  requestedSlideCount?: number;
  additionalInstructions?: string;
}

export interface AssetDirective {
  type: 'image';
  prompt: string;
  targetSlideId?: string;
  targetElementId?: string;
}

export interface SlideBatch {
  slides: number[];
  prompt: string;
  assets?: AssetDirective[];
}

export interface SceneGuidance {
  sceneIndex: number;
  sceneId: string;
  slideType: string;
  intent: string;
  durationFrames: number;
  keyContent: {
    headline?: string;
    subheadline?: string;
    body?: string;
    items?: string[];
    label?: string;
  };
  visualGuidance: string;
  animationNotes?: string;
  elementsHint?: string[];
}

export interface DirectorOutput {
  presentationTitle: string;
  themeId: string;
  totalSlides: number;
  estimatedDurationSeconds: number;
  narrativeArc: string[];
  globalStyle: {
    fontHeadline?: string;
    fontBody?: string;
    animationStyle?: 'smooth' | 'punchy' | 'minimal';
    pacing?: 'slow' | 'moderate' | 'fast';
  };
  commonPrompt: string;
  scenes: SceneGuidance[];
  batches: SlideBatch[];
}

export interface SlideGeneratorInput {
  commonPrompt: string;
  batchPrompt: string;
  themePrompt: string;
  sceneGuidance: SceneGuidance[];
  previousSlideSummary?: string;
  assetUrls?: Map<string, string>;
}

export interface SlideGeneratorOutput {
  slides: Slide[];
  batchSummary: string;
}

export interface AssetGeneratorInput {
  directives: AssetDirective[];
}

export interface GeneratedAsset {
  directive: AssetDirective;
  url: string;
  success: boolean;
  error?: string;
}

export interface AssetGeneratorOutput {
  assets: Map<string, string>;
  results: GeneratedAsset[];
}

export interface ValidationError {
  type: 'bounds' | 'missing_field' | 'invalid_value' | 'schema' | 'z_index';
  message: string;
  path?: string;
  suggestion?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
}

export interface EditRequest {
  existingSlides: Slide[];
  presentationSummary?: string;
  keyPoints?: string[];
  instruction: string;
}

export interface JSONPatch {
  slideId: string;
  elementId?: string;
  operation: 'update' | 'add' | 'remove';
  changes: Record<string, unknown>;
}

export interface EditOutput {
  patches: JSONPatch[];
  changeDescription: string;
}

export interface GenerationMetadata {
  topic?: string;
  intent?: string;
  summary?: string;
  keyPoints?: string[];
  commonPrompt?: string;
  tokensUsed?: number;
  generatedAt: string;
  themeName: string;
  userQuery: string;
  narrativeArc?: string[];
}

export interface PipelineInput {
  userQuery: string;
  themeName: string;
  uploadedFileContent?: string;
  urlContent?: string;
  requestedSlideCount?: number;
  additionalInstructions?: string;
  // Edit mode fields
  existingSlides?: Slide[];
  editInstruction?: string;
  previousMetadata?: GenerationMetadata;
}

export interface PipelineOutput {
  slides: Slide[];
  metadata: GenerationMetadata;
  isEdit: boolean;
  appliedPatches?: JSONPatch[];
}

export interface ThemeColors {
  background_primary: string;
  background_secondary: string;
  background_tertiary?: string;
  text_primary: string;
  text_secondary: string;
  text_muted: string;
  accent_primary: string;
  accent_secondary: string;
  accent_tertiary?: string;
  success: string;
  warning: string;
  error: string;
  chart_palette: string[];
}

export interface ThemeTypography {
  font_headline: string;
  font_body: string;
  headline_sizes: {
    hero: number;
    large: number;
    medium: number;
    small: number;
  };
  body_sizes: {
    large: number;
    medium: number;
    small: number;
  };
  line_height: number;
}

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  preview_gradient: string;
  tags: string[];
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: {
    margin_x: number;
    margin_y: number;
    element_gap: number;
    section_gap: number;
  };
  decorations: Record<string, unknown>;
  animations: {
    default_type: string;
    default_duration: number;
    stagger_delay: number;
    style: string;
  };
  prompt_injection: string;
}

export interface ThemeRegistry {
  _meta: {
    version: string;
    description: string;
    canvas: { width: number; height: number };
  };
  themes: Record<string, ThemeConfig>;
  theme_selection_hints: Record<string, string[]>;
  font_registry: {
    recommended: string[];
    fallback: string;
  };
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  model: {
    primary: string;
    fallback: string;
    reasoning: string;
  };
  config: {
    max_input_tokens: number;
    max_output_tokens: number;
    temperature: number;
    top_p: number;
  };
  system_prompt: string;
  user_prompt_template: string;
}

export interface PromptConfig {
  _meta: {
    version: string;
    description: string;
    canvas: { width: number; height: number };
    z_index_layers: Record<string, { min: number; max: number }>;
  };
  agents: {
    summarizer: AgentConfig;
    director: AgentConfig;
    scene_creator: AgentConfig;
    validator: AgentConfig;
  };
  pipeline: {
    execution_order: string[];
    scene_creator_loop: {
      parallel_execution: boolean;
      batch_size: number;
      context_window: {
        include_previous_scene_summary: boolean;
        previous_summary_max_tokens: number;
      };
    };
    retry_policy: {
      max_retries: number;
      retry_on: string[];
      use_validator_on_failure: boolean;
    };
  };
  validation: Record<string, unknown>;
  placeholders: {
    description: string;
    list: string[];
  };
}
