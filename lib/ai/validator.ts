import { aiGenerateJSON } from './adapter';
import { AI_LIMITS, CANVAS, VALIDATION, SUPPORTED_ELEMENT_TYPES, SUPPORTED_SLIDE_TYPES } from './config';
import type { ValidationResult, ValidationError } from './types';
import type { Slide, SlideElement } from '../schemas/template';

function validateElementBounds(
  element: SlideElement,
  slideId: string,
  index: number
): ValidationError[] {
  const errors: ValidationError[] = [];
  const path = `slides["${slideId}"].elements[${index}]`;
  
  if (typeof element.x === 'number') {
    if (element.x < VALIDATION.bounds.minX) {
      errors.push({
        type: 'bounds',
        message: `Element x position (${element.x}) is below minimum (${VALIDATION.bounds.minX})`,
        path: `${path}.x`,
        suggestion: `Set x to ${VALIDATION.bounds.minX}`,
      });
    }
  }
  
  if (typeof element.y === 'number') {
    if (element.y < VALIDATION.bounds.minY) {
      errors.push({
        type: 'bounds',
        message: `Element y position (${element.y}) is below minimum (${VALIDATION.bounds.minY})`,
        path: `${path}.y`,
        suggestion: `Set y to ${VALIDATION.bounds.minY}`,
      });
    }
  }
  
  if (typeof element.x === 'number' && typeof element.width === 'number') {
    const right = element.x + element.width;
    if (right > CANVAS.width) {
      errors.push({
        type: 'bounds',
        message: `Element extends beyond canvas width (${right} > ${CANVAS.width})`,
        path: `${path}`,
        suggestion: `Reduce width to ${CANVAS.width - element.x}`,
      });
    }
  }
  
  if (typeof element.y === 'number' && typeof element.height === 'number') {
    const bottom = element.y + element.height;
    if (bottom > CANVAS.height) {
      errors.push({
        type: 'bounds',
        message: `Element extends beyond canvas height (${bottom} > ${CANVAS.height})`,
        path: `${path}`,
        suggestion: `Reduce height to ${CANVAS.height - element.y}`,
      });
    }
  }
  
  return errors;
}

function validateElementProperties(
  element: SlideElement,
  slideId: string,
  index: number
): ValidationError[] {
  const errors: ValidationError[] = [];
  const path = `slides["${slideId}"].elements[${index}]`;
  
  if (!element.id) {
    errors.push({
      type: 'missing_field',
      message: 'Element missing required "id" field',
      path,
      suggestion: `Add id: "element-${index}"`,
    });
  }
  
  if (!element.type) {
    errors.push({
      type: 'missing_field',
      message: 'Element missing required "type" field',
      path,
      suggestion: 'Add type: "text" or another valid type',
    });
  } else if (!SUPPORTED_ELEMENT_TYPES.includes(element.type as typeof SUPPORTED_ELEMENT_TYPES[number])) {
    errors.push({
      type: 'invalid_value',
      message: `Invalid element type: "${element.type}"`,
      path: `${path}.type`,
      suggestion: `Use one of: ${SUPPORTED_ELEMENT_TYPES.join(', ')}`,
    });
  }
  
  if (element.animation) {
    const anim = element.animation as { type?: string; duration?: number; delay?: number };
    
    if (typeof anim.duration === 'number') {
      if (anim.duration < VALIDATION.animationDuration.min || anim.duration > VALIDATION.animationDuration.max) {
        errors.push({
          type: 'invalid_value',
          message: `Animation duration ${anim.duration} out of range [${VALIDATION.animationDuration.min}, ${VALIDATION.animationDuration.max}]`,
          path: `${path}.animation.duration`,
          suggestion: `Set duration between ${VALIDATION.animationDuration.min} and ${VALIDATION.animationDuration.max}`,
        });
      }
    }
    
    if (typeof anim.delay === 'number' && anim.delay < 0) {
      errors.push({
        type: 'invalid_value',
        message: 'Animation delay cannot be negative',
        path: `${path}.animation.delay`,
        suggestion: 'Set delay to 0 or positive value',
      });
    }
  }
  
  if (typeof element.fontSize === 'number') {
    if (element.fontSize < VALIDATION.fontSize.min || element.fontSize > VALIDATION.fontSize.max) {
      errors.push({
        type: 'invalid_value',
        message: `Font size ${element.fontSize} out of range [${VALIDATION.fontSize.min}, ${VALIDATION.fontSize.max}]`,
        path: `${path}.fontSize`,
        suggestion: `Set fontSize between ${VALIDATION.fontSize.min} and ${VALIDATION.fontSize.max}`,
      });
    }
  }
  
  if (typeof element.zIndex === 'number') {
    if (element.zIndex < 0 || element.zIndex > 100) {
      errors.push({
        type: 'z_index',
        message: `Invalid z-index: ${element.zIndex}`,
        path: `${path}.zIndex`,
        suggestion: 'Set zIndex between 0 and 50',
      });
    }
  }

  if (element.type === 'custom' && element.content) {
    const content = element.content as any;
    const hasChildren = content.layout?.children && content.layout.children.length > 0;
    const hasText = content.layout?.text && content.layout.text.trim().length > 0;
    
    if (!hasChildren && !hasText) {
      errors.push({
        type: 'invalid_value',
        message: 'Custom component has an empty layout (no children or text)',
        path: `${path}.content.layout`,
        suggestion: 'Ensure the layout contains visible elements or text',
      });
    }
  }
  
  return errors;
}

function validateSlide(slide: Slide, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const path = `slides[${index}]`;
  
  if (!slide.id) {
    errors.push({
      type: 'missing_field',
      message: 'Slide missing required "id" field',
      path,
      suggestion: `Add id: "slide-${index + 1}"`,
    });
  }
  
  if (slide.type && !SUPPORTED_SLIDE_TYPES.includes(slide.type as typeof SUPPORTED_SLIDE_TYPES[number])) {
    errors.push({
      type: 'invalid_value',
      message: `Invalid slide type: "${slide.type}"`,
      path: `${path}.type`,
      suggestion: `Use one of: ${SUPPORTED_SLIDE_TYPES.join(', ')}`,
    });
  }
  
  if (typeof slide.duration === 'number' && slide.duration <= 0) {
    errors.push({
      type: 'invalid_value',
      message: 'Slide duration must be positive',
      path: `${path}.duration`,
      suggestion: `Set duration to ${VALIDATION.defaultSlideDuration}`,
    });
  }
  
  if (slide.background) {
    if (!['color', 'gradient', 'image'].includes(slide.background.type)) {
      errors.push({
        type: 'invalid_value',
        message: `Invalid background type: "${slide.background.type}"`,
        path: `${path}.background.type`,
        suggestion: 'Use one of: color, gradient, image',
      });
    }
  }
  
  if (slide.elements && Array.isArray(slide.elements)) {
    if (slide.elements.length > AI_LIMITS.MAX_ELEMENTS_PER_SLIDE) {
      errors.push({
        type: 'invalid_value',
        message: `Too many elements (${slide.elements.length} > ${AI_LIMITS.MAX_ELEMENTS_PER_SLIDE})`,
        path: `${path}.elements`,
        suggestion: `Reduce to ${AI_LIMITS.MAX_ELEMENTS_PER_SLIDE} elements`,
      });
    }
    
    for (let i = 0; i < slide.elements.length; i++) {
      const element = slide.elements[i];
      errors.push(...validateElementBounds(element, slide.id, i));
      errors.push(...validateElementProperties(element, slide.id, i));
    }
    
    const elementIds = slide.elements.map(e => e.id).filter(Boolean);
    const duplicates = elementIds.filter((id, i) => elementIds.indexOf(id) !== i);
    for (const dup of duplicates) {
      errors.push({
        type: 'invalid_value',
        message: `Duplicate element ID: "${dup}"`,
        path: `${path}.elements`,
        suggestion: 'Ensure all element IDs are unique',
      });
    }
  }
  
  return errors;
}

export function validateSlideJSON(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  
  let slides: Slide[];
  
  if (Array.isArray(data)) {
    slides = data as Slide[];
  } else if (data && typeof data === 'object' && 'slides' in data) {
    slides = (data as { slides: Slide[] }).slides;
  } else if (data && typeof data === 'object' && 'id' in data) {
    slides = [data as Slide];
  } else {
    return {
      valid: false,
      errors: [{
        type: 'schema',
        message: 'Invalid data format - expected Slide array or object with slides property',
      }],
    };
  }
  
  if (slides.length > AI_LIMITS.MAX_SLIDES) {
    errors.push({
      type: 'invalid_value',
      message: `Too many slides (${slides.length} > ${AI_LIMITS.MAX_SLIDES})`,
      path: 'slides',
      suggestion: `Reduce to ${AI_LIMITS.MAX_SLIDES} slides`,
    });
  }
  
  for (let i = 0; i < slides.length; i++) {
    errors.push(...validateSlide(slides[i], i));
  }
  
  const slideIds = slides.map(s => s.id).filter(Boolean);
  const duplicateSlides = slideIds.filter((id, i) => slideIds.indexOf(id) !== i);
  for (const dup of duplicateSlides) {
    errors.push({
      type: 'invalid_value',
      message: `Duplicate slide ID: "${dup}"`,
      path: 'slides',
      suggestion: 'Ensure all slide IDs are unique',
    });
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

export function autoFixSlides(slides: Slide[]): Slide[] {
  return slides.map((slide, slideIndex) => {
    const fixed = { ...slide };
    
    if (!fixed.id) {
      fixed.id = `slide-${slideIndex + 1}`;
    }
    
    if (!fixed.type) {
      fixed.type = 'default';
    }
    
    if (typeof fixed.duration !== 'number' || fixed.duration <= 0) {
      fixed.duration = VALIDATION.defaultSlideDuration;
    }
    
    if (!fixed.background) {
      fixed.background = { type: 'color', value: '#0a0a0a' };
    }
    
    if (fixed.elements && Array.isArray(fixed.elements)) {
      fixed.elements = fixed.elements.map((element, elemIndex) => {
        const fixedElement = { ...element };
        
        if (!fixedElement.id) {
          fixedElement.id = `${fixed.id}-element-${elemIndex}`;
        }
        
        if (typeof fixedElement.x === 'number') {
          fixedElement.x = Math.max(0, fixedElement.x);
        }
        if (typeof fixedElement.y === 'number') {
          fixedElement.y = Math.max(0, fixedElement.y);
        }
        
        if (typeof fixedElement.x === 'number' && typeof fixedElement.width === 'number') {
          if (fixedElement.x + fixedElement.width > CANVAS.width) {
            fixedElement.x = Math.max(0, CANVAS.width - fixedElement.width);
            
            if (fixedElement.width > CANVAS.width) {
               fixedElement.width = CANVAS.width;
               fixedElement.x = 0;
            }
          }
        }
        
        if (typeof fixedElement.y === 'number' && typeof fixedElement.height === 'number') {
          if (fixedElement.y + fixedElement.height > CANVAS.height) {
            fixedElement.y = Math.max(0, CANVAS.height - fixedElement.height);
            
            if (fixedElement.height > CANVAS.height) {
               fixedElement.height = CANVAS.height;
               fixedElement.y = 0;
            }
          }
        }
        
        return fixedElement;
      });
      
      if (fixed.elements.length > AI_LIMITS.MAX_ELEMENTS_PER_SLIDE) {
        fixed.elements = fixed.elements.slice(0, AI_LIMITS.MAX_ELEMENTS_PER_SLIDE);
      }
    }
    
    return fixed;
  });
}

const VALIDATOR_SYSTEM_PROMPT = `You are a JSON REPAIR specialist.

You receive a malformed slide JSON and a list of validation errors. Your job is to fix the JSON and return a valid version.

## COMMON ERRORS
1. Coordinate overflow (x + width > ${CANVAS.width} or y + height > ${CANVAS.height})
2. Invalid property names (font instead of fontSize)
3. Missing required fields (id, type, x, y, width, height)
4. Invalid z-index values
5. Malformed animation objects

## RULES
1. Fix ONLY the reported errors. Do not change valid parts.
2. If an element overflows, shrink width/height or adjust x/y.
3. If a property is invalid, remove it or replace with the closest valid one.
4. Output ONLY the fixed JSON. No explanations.`;

export async function repairSlideJSON(
  malformedJSON: string,
  errors: ValidationError[]
): Promise<Slide[]> {
  console.log(`[Validator] Attempting AI repair for ${errors.length} errors...`);
  
  const errorsList = errors.map(e => 
    `- ${e.path || 'root'}: ${e.message}${e.suggestion ? ` (${e.suggestion})` : ''}`
  ).join('\n');
  
  const prompt = `Fix the following malformed slide JSON.

### MALFORMED JSON ###
${malformedJSON}
### END MALFORMED JSON ###

### VALIDATION ERRORS ###
${errorsList}
### END VALIDATION ERRORS ###

Return the fixed JSON now.`;

  try {
    const result = await aiGenerateJSON({
      model: 'validator',
      systemPrompt: VALIDATOR_SYSTEM_PROMPT,
      prompt,
      agentType: 'validator',
    });
    
    let slides: Slide[];
    
    if (Array.isArray(result)) {
      slides = result as Slide[];
    } else if (result && typeof result === 'object' && 'slides' in result) {
      slides = (result as { slides: Slide[] }).slides;
    } else {
      throw new Error('Unexpected repair result format');
    }
    
    slides = autoFixSlides(slides);
    
    const revalidation = validateSlideJSON(slides);
    
    if (!revalidation.valid) {
      console.warn('[Validator] AI repair incomplete, applying auto-fixes');
    }
    
    console.log('[Validator] Repair complete');
    return slides;
  } catch (error) {
    console.error('[Validator] AI repair failed:', error);
    throw new Error(`Failed to repair slide JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function formatValidationErrors(result: ValidationResult): string {
  if (result.valid) {
    return 'Validation passed';
  }
  
  const lines: string[] = [`Validation failed with ${result.errors.length} error(s):`];
  
  for (const error of result.errors) {
    lines.push(`  ❌ ${error.path || 'root'}: ${error.message}`);
    if (error.suggestion) {
      lines.push(`     💡 ${error.suggestion}`);
    }
  }
  
  if (result.warnings && result.warnings.length > 0) {
    lines.push('');
    lines.push(`Warnings (${result.warnings.length}):`);
    for (const warning of result.warnings) {
      lines.push(`  ⚠️ ${warning.path || 'root'}: ${warning.message}`);
    }
  }
  
  return lines.join('\n');
}
