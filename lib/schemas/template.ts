export interface SlideElement {
  id: string;
  type: string;
  content: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  [key: string]: any;
}

export interface Slide {
  id: string;
  type: string;
  duration: number;
  elements?: SlideElement[];
  background?: {
    type: 'color' | 'image' | 'gradient';
    value: string;
  };
}

/**
 * Metadata from AI generation, stored for edit mode context
 */
export interface GenerationMetadata {
  /** Summarized topic */
  topic?: string;
  /** Detected intent (product_launch, educational, etc.) */
  intent?: string;
  /** Content summary for edit context */
  summary?: string;
  /** Key points extracted from content */
  keyPoints?: string[];
  /** Director's common prompt */
  commonPrompt?: string;
  /** Narrative arc stages */
  narrativeArc?: string[];
  /** Total tokens used in generation */
  tokensUsed?: number;
  /** Generation timestamp (ISO string) */
  generatedAt: string;
  /** Theme used for generation */
  themeName: string;
  /** Original user query */
  userQuery: string;
}

export interface TemplateData {
  name: string;
  slides: Slide[];
  /** AI generation metadata for edit mode context */
  metadata?: GenerationMetadata;
}


export function validateTemplate(data: any): TemplateData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid template: must be a JSON object');
  }
  
  if (!data.name || typeof data.name !== 'string') {
    throw new Error('Invalid template: missing "name" field');
  }
  
  if (!Array.isArray(data.slides)) {
    throw new Error('Invalid template: "slides" must be an array');
  }
  
  if (data.slides.length === 0) {
    throw new Error('Invalid template: must have at least one slide');
  }
  
  for (let i = 0; i < data.slides.length; i++) {
    const slide = data.slides[i];
    if (!slide.id) {
      throw new Error(`Invalid template: slide ${i + 1} missing "id"`);
    }
    if (typeof slide.duration !== 'number' || slide.duration <= 0) {
      data.slides[i].duration = 5000;
    }
  }
  
  return data as TemplateData;
}

export function calculateTotalDuration(slides: Slide[]): number {
  return slides.reduce((acc, slide) => acc + (slide.duration || 150), 0);
}
