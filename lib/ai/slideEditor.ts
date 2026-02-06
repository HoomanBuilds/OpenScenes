import { z } from 'zod';
import { aiGenerateStructured, aiGenerateJSON } from './adapter';
import { AI_LIMITS } from './config';
import type { JSONPatch, ThemeConfig } from './types';
import type { Slide, SlideElement } from '../schemas/template';

const SlideEditPatchSchema = z.object({
  mode: z.literal('patch'),
  patches: z.array(z.object({
    elementId: z.string().optional().describe('ID of the element to patch (omit for slide-level changes)'),
    operation: z.enum(['update', 'add', 'remove']),
    changes: z.record(z.string(), z.unknown()).describe('Properties to change. NEVER leave empty.'),
  })),
  explanation: z.string().describe('Brief explanation of changes made'),
});

const SlideEditRegenerateSchema = z.object({
  mode: z.literal('regenerate'),
  newSlide: z.object({
    type: z.string(),
    duration: z.number(),
    background: z.object({
      type: z.enum(['color', 'image', 'gradient']),
      value: z.string(),
    }).optional(),
    elements: z.array(z.any()),
  }),
  explanation: z.string().describe('Brief explanation of the new design'),
});

const SlideEditOutputSchema = z.discriminatedUnion('mode', [
  SlideEditPatchSchema,
  SlideEditRegenerateSchema,
]);

export type SlideEditOutput = z.infer<typeof SlideEditOutputSchema>;

export interface SlideEditRequest {
  slideId: string;
  slide: Slide;
  instruction: string;
  themeName: string;
  themePrompt?: string;
  projectSummary?: string;
  themeConfig?: ThemeConfig;
}

const SLIDE_EDITOR_SYSTEM_PROMPT = `You are the SLIDE EDITOR for OpenScenes, an AI presentation generator.

## YOUR ROLE
You receive a SINGLE slide and an edit instruction. You must decide:
1. **PATCH MODE**: For small changes (text, colors, positions, styling)
2. **REGENERATE MODE**: For major structural changes (convert to custom component, complete redesign)

## SLIDE STRUCTURE
A slide has:
- id: Unique identifier
- type: "title" | "features" | "custom" | "cta" | etc.
- duration: Duration in milliseconds (1000ms = 1 second)
- background: { type: "color" | "image" | "gradient", value: "..." }
- elements: Array of elements

## ELEMENT TYPES
1. **headline**: Main title text (fontSize: 48-96, fontWeight: bold)
2. **subheadline**: Secondary text (fontSize: 24-36)
3. **text**: Body text (fontSize: 16-24, lineHeight: 1.5)
4. **image**: Image element (objectFit: cover/contain, opacity: 0-1)
5. **shape**: Decorative shapes (content: rect/circle, color, borderRadius)
6. **list**: Bullet points (items: string[])
7. **custom**: Full custom component with layout/animations/timeline

## ELEMENT PROPERTIES
All elements have: id, type, x, y, width, height, zIndex
Text elements also have: content, fontSize, fontWeight, textColor, textAlign, letterSpacing, lineHeight
Animation: { type, duration, delay, direction, ease }

## CUSTOM COMPONENT FORMAT
When regenerating as custom, use this structure in the element content:
{
  "layout": { "tag": "div", "className": "...", "children": [...] },
  "animations": { "elementId": { "initial": {...} } },
  "timeline": [{ "id": "elementId", "animate": {...}, "transition": {...} }]
}

## DECISION RULES
- **Use PATCH** for: text changes, color changes, position/size adjustments, adding/removing single elements
- **Use REGENERATE** for: "make this custom", "redesign", "convert to", "completely change"

## OUTPUT FORMAT
For PATCH mode, output patches with:
- elementId (optional, omit for slide-level changes like background)
- operation: "update" | "add" | "remove"
- changes: { property: newValue } - NEVER EMPTY

For REGENERATE mode, output a complete new slide structure.`;

function buildSlideEditPrompt(request: SlideEditRequest): string {
  const parts: string[] = [];

  parts.push('## INSTRUCTION');
  parts.push(request.instruction);
  parts.push('');

  parts.push('## CURRENT SLIDE (Full JSON)');
  parts.push('```json');
  parts.push(JSON.stringify(request.slide, null, 2));
  parts.push('```');
  parts.push('');

  if (request.projectSummary) {
    parts.push('## PROJECT CONTEXT');
    parts.push(request.projectSummary);
    parts.push('');
  }

  if (request.themePrompt) {
    parts.push('## THEME GUIDANCE');
    parts.push(request.themePrompt);
    parts.push('');
  }

  if (request.themeConfig) {
    parts.push('## THEME COLORS');
    parts.push(`- Background: ${request.themeConfig.colors.background_primary}`);
    parts.push(`- Text Primary: ${request.themeConfig.colors.text_primary}`);
    parts.push(`- Accent: ${request.themeConfig.colors.accent_primary}`);
    parts.push('');
  }

  parts.push('## TASK');
  parts.push('Analyze the instruction and decide whether to PATCH or REGENERATE.');
  parts.push('Output valid JSON matching the expected schema.');

  return parts.join('\n');
}

export async function generateSlideEdit(request: SlideEditRequest): Promise<SlideEditOutput> {
  console.log(`[SlideEditor] Processing: "${request.instruction}"`);
  console.log(`[SlideEditor] Slide ID: ${request.slideId}, Type: ${request.slide.type}`);

  const prompt = buildSlideEditPrompt(request);

  try {
    const result = await aiGenerateStructured({
      model: 'main', // Use main model for complex slide edits
      schema: SlideEditOutputSchema,
      schemaName: 'SlideEditOutput',
      schemaDescription: 'Slide edit result - either patches or full regeneration',
      systemPrompt: SLIDE_EDITOR_SYSTEM_PROMPT,
      prompt,
      agentType: 'editor',
    });

    console.log(`[SlideEditor] Mode: ${result.mode}`);
    if (result.mode === 'patch') {
      console.log(`[SlideEditor] Generated ${result.patches.length} patches`);
    } else {
      console.log(`[SlideEditor] Regenerated slide with ${result.newSlide.elements.length} elements`);
    }

    return result;
  } catch (error) {
    console.error('[SlideEditor] Error:', error);
    throw new Error(`Slide edit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function applySlideEdit(slide: Slide, edit: SlideEditOutput): Slide {
  if (edit.mode === 'regenerate') {
    return {
      id: slide.id,
      ...edit.newSlide,
    };
  }

  let result = JSON.parse(JSON.stringify(slide)) as Slide;

  for (const patch of edit.patches) {
    if (patch.operation === 'remove' && patch.elementId) {
      result.elements = result.elements?.filter(el => el.id !== patch.elementId);
    } else if (patch.operation === 'add' && patch.changes.element) {
      result.elements = [...(result.elements || []), patch.changes.element as SlideElement];
    } else if (patch.operation === 'update') {
      if (patch.elementId) {
        result.elements = result.elements?.map(el => {
          if (el.id !== patch.elementId) return el;
          return { ...el, ...patch.changes } as SlideElement;
        });
      } else {
        result = { ...result, ...patch.changes } as Slide;
      }
    }
  }

  return result;
}
