import { validateSlideJSON, autoFixSlides } from './validator';
import type { JSONPatch } from './types';
import type { Slide, SlideElement } from '../schemas/template';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function applyUpdatePatch(
  slides: Slide[],
  patch: JSONPatch
): Slide[] {
  return slides.map(slide => {
    if (slide.id !== patch.slideId) {
      return slide;
    }
    
    const updatedSlide = { ...slide };
    
    // Element-level update
    if (patch.elementId && updatedSlide.elements) {
      updatedSlide.elements = updatedSlide.elements.map(element => {
        if (element.id !== patch.elementId) {
          return element;
        }
        
        // Apply changes to element
        return {
          ...element,
          ...patch.changes,
        } as SlideElement;
      });
    } else {
      // Slide-level update
      Object.assign(updatedSlide, patch.changes);
    }
    
    return updatedSlide;
  });
}

function applyAddPatch(
  slides: Slide[],
  patch: JSONPatch
): Slide[] {
  // Check if adding a new element to existing slide
  const slideIndex = slides.findIndex(s => s.id === patch.slideId);
  
  if (slideIndex !== -1 && patch.changes.element) {
    // Adding element to existing slide
    return slides.map((slide, index) => {
      if (index !== slideIndex) {
        return slide;
      }
      
      const newElement = patch.changes.element as SlideElement;
      return {
        ...slide,
        elements: [...(slide.elements || []), newElement],
      };
    });
  }
  
  if (slideIndex === -1 && patch.changes.slide) {
    // Adding new slide
    const newSlide = patch.changes.slide as Slide;
    return [...slides, newSlide];
  }
  
  // Fallback - try to add as element if slide exists
  if (slideIndex !== -1) {
    return slides.map((slide, index) => {
      if (index !== slideIndex) {
        return slide;
      }
      
      // Try to construct element from changes
      const newElement: SlideElement = {
        id: `new-element-${Date.now()}`,
        type: 'text',
        content: '',
        x: 100,
        y: 100,
        width: 200,
        height: 50,
        ...patch.changes,
      } as SlideElement;
      
      return {
        ...slide,
        elements: [...(slide.elements || []), newElement],
      };
    });
  }
  
  console.warn(`[Apply] Could not apply add patch for slide: ${patch.slideId}`);
  return slides;
}

function applyRemovePatch(
  slides: Slide[],
  patch: JSONPatch
): Slide[] {
  if (patch.elementId) {
    return slides.map(slide => {
      if (slide.id !== patch.slideId) {
        return slide;
      }
      
      return {
        ...slide,
        elements: slide.elements?.filter(el => el.id !== patch.elementId),
      };
    });
  }
  
  return slides.filter(slide => slide.id !== patch.slideId);
}

function applySinglePatch(
  slides: Slide[],
  patch: JSONPatch
): Slide[] {
  switch (patch.operation) {
    case 'update':
      return applyUpdatePatch(slides, patch);
    case 'add':
      return applyAddPatch(slides, patch);
    case 'remove':
      return applyRemovePatch(slides, patch);
    default:
      console.warn(`[Apply] Unknown patch operation: ${(patch as JSONPatch).operation}`);
      return slides;
  }
}


export function applyPatches(
  slides: Slide[],
  patches: JSONPatch[],
  options: {
    validate?: boolean;
    autoFix?: boolean;
    allowInvalid?: boolean;
  } = {}
): Slide[] {
  const { validate = true, autoFix = true, allowInvalid = false } = options;
  
  console.log(`[Apply] Applying ${patches.length} patches to ${slides.length} slides`);
  
  let result = deepClone(slides);
  
  for (const patch of patches) {
    try {
      result = applySinglePatch(result, patch);
      console.log(`[Apply] Applied ${patch.operation} to ${patch.slideId}${patch.elementId ? '/' + patch.elementId : ''}`);
    } catch (error) {
      console.error(`[Apply] Failed to apply patch:`, patch, error);
      if (!allowInvalid) {
        throw new Error(`Failed to apply patch to ${patch.slideId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }
  
  if (validate) {
    const validation = validateSlideJSON(result);
    
    if (!validation.valid) {
      console.warn(`[Apply] Validation failed after patches: ${validation.errors.length} errors`);
      
      if (autoFix) {
        console.log('[Apply] Auto-fixing validation errors...');
        result = autoFixSlides(result);
        
        const revalidation = validateSlideJSON(result);
        if (!revalidation.valid && !allowInvalid) {
          throw new Error(`Patches resulted in invalid slides: ${revalidation.errors.map(e => e.message).join(', ')}`);
        }
      } else if (!allowInvalid) {
        throw new Error(`Patches resulted in invalid slides: ${validation.errors.map(e => e.message).join(', ')}`);
      }
    }
  }
  
  console.log(`[Apply] Complete - ${result.length} slides after patching`);
  return result;
}

export function previewPatches(
  slides: Slide[],
  patches: JSONPatch[]
): {
  affected: {
    slideId: string;
    elementId?: string;
    operation: string;
    description: string;
  }[];
  summary: string;
} {
  const affected: Array<{
    slideId: string;
    elementId?: string;
    operation: string;
    description: string;
  }> = [];
  
  for (const patch of patches) {
    let description = '';
    
    switch (patch.operation) {
      case 'update':
        description = `Update ${Object.keys(patch.changes).join(', ')}`;
        break;
      case 'add':
        description = patch.elementId ? 'Add new element' : 'Add new slide';
        break;
      case 'remove':
        description = patch.elementId ? 'Remove element' : 'Remove slide';
        break;
    }
    
    affected.push({
      slideId: patch.slideId,
      elementId: patch.elementId,
      operation: patch.operation,
      description,
    });
  }
  
  const summary = `${patches.length} patch(es): ${affected.map(a => a.description).join(', ')}`;
  
  return { affected, summary };
}

export function reversePatch(
  originalSlides: Slide[],
  patch: JSONPatch
): JSONPatch | null {
  const slide = originalSlides.find(s => s.id === patch.slideId);
  
  if (!slide) {
    return null;
  }
  
  switch (patch.operation) {
    case 'update': {
      const originalChanges: Record<string, unknown> = {};
      
      if (patch.elementId) {
        const element = slide.elements?.find(e => e.id === patch.elementId);
        if (element) {
          for (const key of Object.keys(patch.changes)) {
            originalChanges[key] = (element as Record<string, unknown>)[key];
          }
        }
      } else {
        for (const key of Object.keys(patch.changes)) {
          originalChanges[key] = (slide as unknown as Record<string, unknown>)[key];
        }
      }
      
      return {
        slideId: patch.slideId,
        elementId: patch.elementId,
        operation: 'update',
        changes: originalChanges,
      };
    }
    
    case 'add':
      return {
        slideId: patch.slideId,
        elementId: patch.elementId || (patch.changes.element as SlideElement)?.id,
        operation: 'remove',
        changes: {},
      };
    
    case 'remove': {
      if (patch.elementId) {
        const element = slide.elements?.find(e => e.id === patch.elementId);
        if (element) {
          return {
            slideId: patch.slideId,
            operation: 'add',
            changes: { element },
          };
        }
      } else {
        return {
          slideId: patch.slideId,
          operation: 'add',
          changes: { slide },
        };
      }
      return null;
    }
    
    default:
      return null;
  }
}

export function mergePatches(patches: JSONPatch[]): JSONPatch[] {
  const mergedMap = new Map<string, JSONPatch>();
  
  for (const patch of patches) {
    const key = `${patch.slideId}:${patch.elementId || 'slide'}`;
    
    if (patch.operation === 'remove') {
      mergedMap.set(key, patch);
      continue;
    }
    
    const existing = mergedMap.get(key);
    
    if (!existing) {
      mergedMap.set(key, { ...patch });
    } else if (existing.operation === 'update' && patch.operation === 'update') {
      existing.changes = {
        ...existing.changes,
        ...patch.changes,
      };
    } else {
      mergedMap.set(key, patch);
    }
  }
  
  return Array.from(mergedMap.values());
}
