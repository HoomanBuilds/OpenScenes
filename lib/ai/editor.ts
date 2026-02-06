import { z } from 'zod';
import { aiGenerateStructured } from './adapter';
import { AI_LIMITS } from './config';
import type { EditRequest, EditOutput, JSONPatch, GenerationMetadata } from './types';
import type { Slide } from '../schemas/template';
import { classifyEditRequest, EditClassification } from './classifier';

const JSONPatchSchema = z.object({
  slideId: z.string().describe('ID of the slide to edit'),
  elementId: z.string().optional().describe('ID of the element to edit (optional)'),
  operation: z.enum(['update', 'add', 'remove']).describe('Type of operation'),
  changes: z.record(z.string(), z.unknown()).describe('Changes to apply'),
});

const EditOutputSchema = z.object({
  patches: z.array(JSONPatchSchema).max(AI_LIMITS.MAX_PATCHES_PER_EDIT),
  changeDescription: z.string().describe('Human-readable description of changes'),
});

const EDITOR_SYSTEM_PROMPT = `You are the EDIT SPECIALIST for OpenScenes, an AI video presentation generator.

## YOUR ROLE
You receive an existing presentation and an edit instruction. Your job is to:
1. Understand what the user wants to change
2. Generate MINIMAL JSON patches to achieve that change
3. Never regenerate the entire presentation

## CONTEXT HANDLING
You are provided with a mix of FULL JSON slides and SUMMARIZED slides.
- **FULL JSON**: You have the complete structure. You can add/update/remove elements freely.
- **SUMMARIZED**: You only have the ID/Title. You should ONLY patch these if it's a GLOBAL change (like theme/style) that applies consistently across all slides.

## PATCH FORMAT
Each patch has:
- slideId: ID of the slide to modify
- elementId: ID of the element (optional, for element-level changes)
- operation: "update" | "add" | "remove"
- changes: Object with properties to change/add. NEVER LEAVE THIS EMPTY.

## EXAMPLES

### Example 1: Change headline text
Instruction: "Make the title say 'Hello World'"
Patch:
{
  "slideId": "slide-1",
  "elementId": "headline-1",
  "operation": "update",
  "changes": { "content": "Hello World" }
}

### Example 2: Change background color
Instruction: "Make the first slide background blue"
Patch:
{
  "slideId": "slide-1",
  "operation": "update",
  "changes": { "background": { "type": "color", "value": "#3b82f6" } }
}

### Example 3: Update text color
Instruction: "Make the headline on slide 2 red"
Patch:
{
  "slideId": "slide-2",
  "elementId": "headline-1",
  "operation": "update",
  "changes": { "textColor": "#ef4444" }
}

## RULES
1. Generate the MINIMUM number of patches needed.
2. Never regenerate entire slides.
3. The "changes" object MUST contain the actual new values. NEVER leave it empty.
4. Use "update" for modifying existing content.
5. Use "add" only for new elements or slides.
6. Reference actual slide/element IDs from the existing presentation.`;

function buildSlidesContext(slides: Slide[], classification: EditClassification): string {
  const parts: string[] = [];
  
  for (const slide of slides) {
    const isTarget = classification.scope === 'global' || 
                     classification.affectedSlideIds.includes(slide.id) ||
                     slides.indexOf(slide) < 2; // Always include first 2 as reference
    
    parts.push(`### Slide: ${slide.id} (${slide.type}) [${isTarget ? 'FULL CONTEXT' : 'SUMMARY ONLY'}] ###`);
    
    if (isTarget) {
      if (slide.background) {
        parts.push(`Background: ${JSON.stringify(slide.background)}`);
      }
      
      if (slide.elements && slide.elements.length > 0) {
        parts.push('Elements (Full JSON):');
        parts.push(JSON.stringify(slide.elements, null, 2));
      }
    } else {
      const title = slide.elements?.find(el => el.type === 'headline')?.content || 'Untitled';
      parts.push(`Title: "${title.slice(0, 50)}..."`);
      parts.push(`(Full data omitted to save tokens. Only patch if applying a global change)`);
    }
    parts.push('');
  }
  
  return parts.join('\n');
}

function buildEditorPrompt(request: EditRequest, classification: EditClassification): string {
  const parts: string[] = [];
  
  parts.push('Generate JSON patches for the following edit instruction.');
  parts.push('');
  
  parts.push('### EDIT INSTRUCTION ###');
  parts.push(request.instruction);
  parts.push('### END EDIT INSTRUCTION ###');
  parts.push('');

  parts.push('### CLASSIFICATION BIAS ###');
  parts.push(`Scope: ${classification.scope}`);
  parts.push(`Reasoning: ${classification.reasoning}`);
  parts.push('');
  
  if (request.presentationSummary) {
    parts.push('### PRESENTATION CONTEXT ###');
    parts.push(`Summary: ${request.presentationSummary}`);
    parts.push('### END CONTEXT ###');
    parts.push('');
  }
  
  parts.push('### EXISTING SLIDES ###');
  parts.push(buildSlidesContext(request.existingSlides, classification));
  parts.push('### END EXISTING SLIDES ###');
  parts.push('');
  
  parts.push('Generate the minimal patches needed. Output VALID JSON patches.');
  
  return parts.join('\n');
}

export async function generateEditPatches(
  request: EditRequest
): Promise<EditOutput> {
  console.log(`[Editor] Processing: "${request.instruction}"`);                          
  
  const classification = await classifyEditRequest(request.instruction, request.existingSlides);
  console.log(`[Editor] Classification:`, JSON.stringify(classification, null, 2));

  const prompt = buildEditorPrompt(request, classification);
  console.log(`[Editor] Prompt length: ${prompt.length} chars`);
  
  try {
    const result = await aiGenerateStructured({
      model: classification.scope === 'global' ? 'main' : 'medium', 
      schema: EditOutputSchema,
      schemaName: 'EditOutput',
      schemaDescription: 'JSON patches for presentation edit',
      systemPrompt: EDITOR_SYSTEM_PROMPT,
      prompt,
      agentType: 'editor',
    });
    
    console.log(`[Editor] RAW LLM OUTPUT:`, JSON.stringify(result, null, 2));
    
    const validatedPatches = validatePatches(result.patches, request.existingSlides);
    
    for (const patch of validatedPatches) {
      if (!patch.changes || Object.keys(patch.changes).length === 0) {
        console.warn(`[Editor] WARNING: Patch has empty changes!`, JSON.stringify(patch));
      }
    }
    
    return {
      patches: validatedPatches,
      changeDescription: result.changeDescription,
    };
  } catch (error) {
    console.error('[Editor] Error generating patches:', error);
    throw new Error(`Edit patch generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function validatePatches(patches: JSONPatch[], slides: Slide[]): JSONPatch[] {
  const slideIds = new Set(slides.map(s => s.id));
  const elementIdsBySlide = new Map<string, Set<string>>();
  
  for (const slide of slides) {
    const elementIds = new Set(slide.elements?.map(e => e.id) || []);
    elementIdsBySlide.set(slide.id, elementIds);
  }
  
  const validPatches: JSONPatch[] = [];
  
  for (const patch of patches) {
    if (patch.operation === 'add' && !slideIds.has(patch.slideId)) {
      validPatches.push(patch);
      continue;
    }
    
    if (!slideIds.has(patch.slideId)) {
      console.warn(`[Editor] Patch references non-existent slide: ${patch.slideId}`);
      continue;
    }
    
    if (patch.elementId && patch.operation !== 'add') {
      const slideElements = elementIdsBySlide.get(patch.slideId);
      if (!slideElements?.has(patch.elementId)) {
        console.warn(`[Editor] Patch references non-existent element: ${patch.elementId} in ${patch.slideId}`);
        continue;
      }
    }
    
    validPatches.push(patch);
  }
  
  return validPatches;
}

export function createEditRequest(
  slides: Slide[],
  instruction: string,
  metadata?: GenerationMetadata
): EditRequest {
  return {
    existingSlides: slides,
    instruction,
    presentationSummary: metadata?.summary,
    keyPoints: metadata?.keyPoints?.map(kp => 
      typeof kp === 'string' ? kp : kp
    ),
  };
}

export function quickTextReplace(
  slides: Slide[],
  slideId: string,
  elementId: string,
  newContent: string
): JSONPatch {
  return {
    slideId,
    elementId,
    operation: 'update',
    changes: { content: newContent },
  };
}

export function quickBackgroundChange(
  slideId: string,
  color: string
): JSONPatch {
  return {
    slideId,
    operation: 'update',
    changes: {
      background: { type: 'color', value: color },
    },
  };
}

export function canQuickEdit(instruction: string): boolean {
  const lowerInstruction = instruction.toLowerCase();
  
  if (
    lowerInstruction.includes('change') && 
    lowerInstruction.includes('to') &&
    !lowerInstruction.includes('all') &&
    !lowerInstruction.includes('every')
  ) {
    return false;
  }
  
  return false;
}
