import { z } from 'zod';
import { aiGenerateStructured } from './adapter';
import { AI_LIMITS } from './config';
import type { EditRequest, EditOutput, JSONPatch, GenerationMetadata } from './types';
import type { Slide } from '../schemas/template';

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

## PATCH FORMAT
Each patch has:
- slideId: ID of the slide to modify
- elementId: ID of the element (optional, for element-level changes)
- operation: "update" | "add" | "remove"
- changes: Object with properties to change/add

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

### Example 3: Remove an element
Instruction: "Remove the subtitle"
Patch:
{
  "slideId": "slide-1",
  "elementId": "subheadline-1",
  "operation": "remove",
  "changes": {}
}

### Example 4: Add an element
Instruction: "Add a subtitle saying 'Welcome'"
Patch:
{
  "slideId": "slide-1",
  "operation": "add",
  "changes": {
    "element": {
      "id": "new-subheadline",
      "type": "subheadline",
      "content": "Welcome",
      "x": 100,
      "y": 200,
      "width": 800,
      "height": 50,
      "fontSize": 28,
      "textColor": "#a1a1aa",
      "textAlign": "center",
      "zIndex": 11
    }
  }
}

## RULES
1. Generate the MINIMUM number of patches needed.
2. Never regenerate entire slides - only patch what's needed.
3. Use "update" for modifying existing content.
4. Use "add" only for new elements or slides.
5. Use "remove" for deletions.
6. Keep changes targeted and precise.
7. Maximum ${AI_LIMITS.MAX_PATCHES_PER_EDIT} patches per request.
8. Reference actual slide/element IDs from the existing presentation.`;

function buildSlidesContext(slides: Slide[]): string {
  const parts: string[] = [];
  
  for (const slide of slides) {
    parts.push(`### Slide: ${slide.id} (${slide.type}) ###`);
    
    if (slide.background) {
      parts.push(`Background: ${slide.background.type} = ${slide.background.value}`);
    }
    
    if (slide.elements && slide.elements.length > 0) {
      parts.push('Elements:');
      for (const el of slide.elements) {
        const content = el.content ? el.content.slice(0, 50) : '';
        parts.push(`  - ${el.id} (${el.type}): "${content}"`);
        parts.push(`    Position: (${el.x}, ${el.y}) Size: ${el.width}x${el.height}`);
        if (el.textColor) parts.push(`    Color: ${el.textColor}`);
        if (el.fontSize) parts.push(`    FontSize: ${el.fontSize}`);
      }
    }
    parts.push('');
  }
  
  return parts.join('\n');
}

function buildEditorPrompt(request: EditRequest): string {
  const parts: string[] = [];
  
  parts.push('Generate JSON patches for the following edit instruction.');
  parts.push('');
  
  parts.push('### EDIT INSTRUCTION ###');
  parts.push(request.instruction);
  parts.push('### END EDIT INSTRUCTION ###');
  parts.push('');
  
  if (request.presentationSummary) {
    parts.push('### PRESENTATION CONTEXT ###');
    parts.push(`Summary: ${request.presentationSummary}`);
    if (request.keyPoints && request.keyPoints.length > 0) {
      parts.push('Key Points:');
      for (const kp of request.keyPoints) {
        parts.push(`  - ${kp}`);
      }
    }
    parts.push('### END CONTEXT ###');
    parts.push('');
  }
  
  parts.push('### EXISTING SLIDES ###');
  parts.push(buildSlidesContext(request.existingSlides));
  parts.push('### END EXISTING SLIDES ###');
  parts.push('');
  
  parts.push('Generate the minimal patches needed to fulfill the edit instruction.');
  
  return parts.join('\n');
}

export async function generateEditPatches(
  request: EditRequest
): Promise<EditOutput> {
  console.log(`[Editor] Processing edit instruction: "${request.instruction.slice(0, 50)}..."`);
  
  const prompt = buildEditorPrompt(request);
  
  try {
    const result = await aiGenerateStructured({
      model: 'cheap',
      schema: EditOutputSchema,
      schemaName: 'EditOutput',
      schemaDescription: 'JSON patches for presentation edit',
      systemPrompt: EDITOR_SYSTEM_PROMPT,
      prompt,
      agentType: 'editor',
    });
    
    console.log(`[Editor] Generated ${result.patches.length} patches: ${result.changeDescription}`);
    
    const validatedPatches = validatePatches(result.patches, request.existingSlides);
    
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
