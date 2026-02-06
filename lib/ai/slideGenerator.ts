/**
 * Slide Generator
 * 
 * Generates slide JSON for each batch following the director's plan.
 * Uses theme prompt + common prompt + batch-specific guidance.
 */

import { aiGenerateJSON } from './adapter';
import { AI_LIMITS, CANVAS, SUPPORTED_ELEMENT_TYPES, SUPPORTED_SLIDE_TYPES } from './config';
import type { 
  SlideGeneratorInput, 
  SlideGeneratorOutput,
  SceneGuidance,
} from './types';
import type { Slide, SlideElement } from '../schemas/template';

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

const SLIDE_GENERATOR_SYSTEM_PROMPT = `You are the SCENE CREATOR for OpenScenes, an AI video presentation generator.

## YOUR ROLE
You generate the precise JSON definition for slides. You receive:
1. The director's guidance for specific scenes
2. The global common prompt (styling rules that apply to all slides)
3. The theme configuration (colors, fonts, styles)
4. A summary of the previous scene (for visual continuity)

## CANVAS SPECIFICATIONS
- Width: ${CANVAS.width}px, Height: ${CANVAS.height}px
- Coordinate Origin: Top-left (0, 0)
- Keep elements within bounds: x + width ≤ ${CANVAS.width}, y + height ≤ ${CANVAS.height}
- Z-Index: Background (0-5), Decoration (6-9), Content (10-20), Overlay (21+)

## ELEMENT TYPES
1. "headline": Large title text (fontSize: 40-96)
2. "subheadline": Secondary title (fontSize: 24-36)
3. "text": Body text, supports textFormat: "markdown" for bullet lists
4. "shape": Decorative or container. content: "rect" or "circle". Use borderRadius for rounded corners.
5. "chart": Data visualization. chartType: "bar" | "pie" | "line" | "area". content: space-separated values.
6. "image": content = image URL. Use objectFit: "cover" | "contain".

## ELEMENT STRUCTURE
Each element MUST have:
- id: unique string (e.g., "headline-1", "shape-bg")
- type: one of the element types above
- x, y: position (numbers, in pixels)
- width, height: dimensions (numbers, in pixels)
- zIndex: number (following layer rules)

Optional properties:
- content: string (text content or shape type)
- fontSize: number
- fontWeight: "normal" | "bold" | "semibold"
- fontFamily: string
- textColor: hex color
- textAlign: "left" | "center" | "right"
- lineHeight: number
- color: hex color (for shapes)
- background: string (gradient or color)
- borderRadius: number
- rotation: number (degrees)
- opacity: number (0-1)
- animation: { type, duration, delay, direction? }

## ANIMATION OPTIONS
- type: "fade" | "pop" | "slide" | "scale"
- duration: 0.3 - 2.0 (seconds)
- delay: 0 - 2.0 (seconds)
- direction (for slide): "up" | "down" | "left" | "right"

## OUTPUT FORMAT
Return a JSON array of slide objects:
[
  {
    "id": "slide-1",
    "type": "title",
    "duration": 180,
    "background": {
      "type": "color",
      "value": "#0a0a0a"
    },
    "elements": [...]
  }
]

## RULES
1. Output ONLY valid JSON array. No markdown, no explanations.
2. Every element MUST have a unique id.
3. Use ONLY properties from the schema.
4. For bullet lists: set textFormat: "markdown" and use "- " prefix.
5. Respect theme colors. Use the provided color palette.
6. Maintain visual continuity with previous scenes.
7. Never exceed canvas bounds.
8. Keep element count reasonable (3-8 per slide).
9. Duration is in frames at 30fps (180 = 6 seconds, 150 = 5 seconds).`;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Build scene guidance section for prompt
 */
function buildSceneGuidancePrompt(scenes: SceneGuidance[]): string {
  const parts: string[] = [];
  
  for (const scene of scenes) {
    parts.push(`### SCENE ${scene.sceneIndex + 1}: ${scene.sceneId} ###`);
    parts.push(`Type: ${scene.slideType}`);
    parts.push(`Intent: ${scene.intent}`);
    parts.push(`Duration: ${scene.durationFrames} frames`);
    parts.push('Key Content:');
    for (const [key, value] of Object.entries(scene.keyContent)) {
      parts.push(`  - ${key}: ${value}`);
    }
    parts.push(`Visual Guidance: ${scene.visualGuidance}`);
    if (scene.animationNotes) {
      parts.push(`Animation Notes: ${scene.animationNotes}`);
    }
    if (scene.elementsHint && scene.elementsHint.length > 0) {
      parts.push(`Suggested Elements: ${scene.elementsHint.join(', ')}`);
    }
    parts.push('');
  }
  
  return parts.join('\n');
}

/**
 * Build the full user prompt for slide generation
 */
function buildSlideGeneratorPrompt(input: SlideGeneratorInput): string {
  const parts: string[] = [];
  
  parts.push(`Generate ${input.sceneGuidance.length} slide(s) following the guidance below.`);
  parts.push('');
  
  // Common prompt
  if (input.commonPrompt) {
    parts.push('### COMMON PROMPT (Apply to all slides) ###');
    parts.push(input.commonPrompt);
    parts.push('### END COMMON PROMPT ###');
    parts.push('');
  }
  
  // Batch-specific prompt
  if (input.batchPrompt) {
    parts.push('### BATCH-SPECIFIC GUIDANCE ###');
    parts.push(input.batchPrompt);
    parts.push('### END BATCH-SPECIFIC GUIDANCE ###');
    parts.push('');
  }
  
  // Scene guidance
  parts.push('### SCENE-BY-SCENE GUIDANCE ###');
  parts.push(buildSceneGuidancePrompt(input.sceneGuidance));
  parts.push('### END SCENE GUIDANCE ###');
  
  // Theme prompt
  if (input.themePrompt) {
    parts.push('');
    parts.push('### THEME CONFIGURATION ###');
    parts.push(input.themePrompt);
    parts.push('### END THEME CONFIGURATION ###');
  }
  
  // Previous slide summary
  if (input.previousSlideSummary) {
    parts.push('');
    parts.push('### PREVIOUS SLIDE SUMMARY (for visual continuity) ###');
    parts.push(input.previousSlideSummary);
    parts.push('### END PREVIOUS SLIDE SUMMARY ###');
  }
  
  // Asset URLs
  if (input.assetUrls && input.assetUrls.size > 0) {
    parts.push('');
    parts.push('### ASSET URLS (use these for image elements) ###');
    for (const [elementId, url] of input.assetUrls) {
      parts.push(`- ${elementId}: ${url}`);
    }
    parts.push('### END ASSET URLS ###');
  }
  
  parts.push('');
  parts.push('Generate the slide JSON array now. Output ONLY valid JSON.');
  
  return parts.join('\n');
}

/**
 * Validate a single slide element
 */
function validateElement(element: SlideElement, slideId: string): SlideElement {
  const validated = { ...element };
  
  // Ensure required fields
  if (!validated.id) {
    validated.id = `${slideId}-element-${Math.random().toString(36).slice(2, 8)}`;
  }
  
  // Clamp position to canvas bounds
  if (typeof validated.x === 'number') {
    validated.x = Math.max(0, Math.min(validated.x, CANVAS.width - 10));
  }
  if (typeof validated.y === 'number') {
    validated.y = Math.max(0, Math.min(validated.y, CANVAS.height - 10));
  }
  
  // Ensure dimensions don't exceed canvas
  if (typeof validated.width === 'number' && typeof validated.x === 'number') {
    if (validated.x + validated.width > CANVAS.width) {
      validated.width = CANVAS.width - validated.x;
    }
  }
  if (typeof validated.height === 'number' && typeof validated.y === 'number') {
    if (validated.y + validated.height > CANVAS.height) {
      validated.height = CANVAS.height - validated.y;
    }
  }
  
  return validated;
}

/**
 * Validate a single slide
 */
function validateSlide(slide: Slide, index: number): Slide {
  const validated = { ...slide };
  
  // Ensure ID
  if (!validated.id) {
    validated.id = `slide-${index + 1}`;
  }
  
  // Ensure type
  if (!validated.type || !SUPPORTED_SLIDE_TYPES.includes(validated.type as typeof SUPPORTED_SLIDE_TYPES[number])) {
    validated.type = 'default';
  }
  
  // Ensure duration
  if (typeof validated.duration !== 'number' || validated.duration <= 0) {
    validated.duration = 180; // Default 6 seconds at 30fps
  }
  
  // Ensure background
  if (!validated.background) {
    validated.background = { type: 'color', value: '#0a0a0a' };
  }
  
  // Validate elements
  if (validated.elements && Array.isArray(validated.elements)) {
    validated.elements = validated.elements.map(el => validateElement(el, validated.id));
    
    // Cap elements per slide
    if (validated.elements.length > AI_LIMITS.MAX_ELEMENTS_PER_SLIDE) {
      console.warn(`[SlideGenerator] Capping elements from ${validated.elements.length} to ${AI_LIMITS.MAX_ELEMENTS_PER_SLIDE}`);
      validated.elements = validated.elements.slice(0, AI_LIMITS.MAX_ELEMENTS_PER_SLIDE);
    }
  } else {
    validated.elements = [];
  }
  
  return validated;
}

/**
 * Create a summary of a slide for context in next batch
 */
function createSlideSummary(slide: Slide): string {
  const parts: string[] = [];
  
  parts.push(`Slide ID: ${slide.id}, Type: ${slide.type}`);
  
  if (slide.background) {
    parts.push(`Background: ${slide.background.type} - ${slide.background.value}`);
  }
  
  if (slide.elements && slide.elements.length > 0) {
    parts.push(`Elements (${slide.elements.length}):`);
    for (const el of slide.elements.slice(0, 5)) {
      const contentPreview = el.content ? el.content.slice(0, 30) : '';
      parts.push(`  - ${el.type} at (${el.x}, ${el.y}): ${contentPreview}`);
    }
  }
  
  return parts.join('\n');
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Generate slides for a batch
 * 
 * @param input - Slide generation input with prompts and scene guidance
 * @returns Generated slides and batch summary
 */
export async function generateSlides(
  input: SlideGeneratorInput
): Promise<SlideGeneratorOutput> {
  console.log(`[SlideGenerator] Generating ${input.sceneGuidance.length} slides...`);
  
  const prompt = buildSlideGeneratorPrompt(input);
  
  try {
    const result = await aiGenerateJSON({
      model: 'main',
      systemPrompt: SLIDE_GENERATOR_SYSTEM_PROMPT,
      prompt,
      agentType: 'generator',
    });
    
    // Parse and validate result
    let slides: Slide[];
    
    if (Array.isArray(result)) {
      slides = result as Slide[];
    } else if (result && typeof result === 'object' && 'slides' in result) {
      slides = (result as { slides: Slide[] }).slides;
    } else {
      throw new Error('Unexpected response format - expected array of slides');
    }
    
    // Validate each slide
    slides = slides.map((slide, index) => validateSlide(slide, index));
    
    // Create summary of last slide for next batch context
    const lastSlide = slides[slides.length - 1];
    const batchSummary = lastSlide ? createSlideSummary(lastSlide) : '';
    
    console.log(`[SlideGenerator] Generated ${slides.length} valid slides`);
    
    return {
      slides,
      batchSummary,
    };
  } catch (error) {
    console.error('[SlideGenerator] Error during generation:', error);
    throw new Error(`Slide generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a single slide (convenience wrapper)
 */
export async function generateSingleSlide(
  sceneGuidance: SceneGuidance,
  commonPrompt: string,
  themePrompt: string,
  previousSlideSummary?: string
): Promise<Slide> {
  const result = await generateSlides({
    commonPrompt,
    batchPrompt: '',
    themePrompt,
    sceneGuidance: [sceneGuidance],
    previousSlideSummary,
  });
  
  if (result.slides.length === 0) {
    throw new Error('No slide generated');
  }
  
  return result.slides[0];
}

/**
 * Insert asset URLs into slide elements
 */
export function insertAssetUrls(
  slides: Slide[],
  assetUrls: Map<string, string>
): Slide[] {
  return slides.map(slide => ({
    ...slide,
    elements: slide.elements?.map(element => {
      // Check if this element has an asset URL
      const assetUrl = assetUrls.get(element.id) || assetUrls.get(`${slide.id}-${element.id}`);
      
      if (assetUrl && element.type === 'image') {
        return {
          ...element,
          content: assetUrl,
        };
      }
      
      return element;
    }),
  }));
}
