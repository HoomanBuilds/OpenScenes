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
  name?: string;
  type: string;
  duration: number;
  elements?: SlideElement[];
  background?: {
    type: 'color' | 'image' | 'gradient';
    value: string;
  };
}

export interface GenerationMetadata {
  presentationTitle?: string;
  topic?: string;
  intent?: string;
  summary?: string;
  keyPoints?: string[];
  commonPrompt?: string;
  narrativeArc?: string[];
  tokensUsed?: number;
  generatedAt: string;
  themeName: string;
  userQuery: string;
}

export interface TemplateData {
  name: string;
  slides: Slide[];
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
