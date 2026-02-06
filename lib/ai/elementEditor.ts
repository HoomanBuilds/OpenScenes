import { z } from 'zod';
import { aiGenerateStructured } from './adapter';
import type { ThemeConfig } from './types';
import type { SlideElement } from '../schemas/template';

const ElementPatchSchema = z.object({
  elementId: z.string().describe('ID of the element being patched'),
  changes: z.record(z.string(), z.unknown()).describe('Properties to change. NEVER leave empty.'),
});

const ElementEditOutputSchema = z.object({
  patches: z.array(ElementPatchSchema).min(1),
  explanation: z.string().describe('Brief explanation of changes made'),
});

export type ElementEditOutput = z.infer<typeof ElementEditOutputSchema>;

export interface ElementEditRequest {
  slideId: string;
  elements: SlideElement[]; // One or more selected elements
  instruction: string;
  themeName: string;
  themePrompt?: string;
  themeConfig?: ThemeConfig;
}

const ELEMENT_EDITOR_SYSTEM_PROMPT = `You are the ELEMENT EDITOR for OpenScenes, an AI presentation generator.

## YOUR ROLE
You receive ONE OR MORE selected elements and an edit instruction.
Generate precise patches for ONLY the selected elements.

## ELEMENT TYPES & PROPERTIES

### Text Elements (headline, subheadline, text)
- content: string (the text content)
- fontSize: number (16-96)
- fontWeight: "normal" | "bold" | "light"
- textColor: string (hex color like "#ffffff")
- textAlign: "left" | "center" | "right"
- letterSpacing: number
- lineHeight: number

### Position/Size (all elements)
- x, y: number (position in pixels)
- width, height: number (dimensions)
- zIndex: number (layer order)

### Image Elements
- content: string (image URL or description)
- objectFit: "cover" | "contain" | "fill"
- opacity: number (0-1)
- borderRadius: number

### Shape Elements
- content: "rect" | "circle"
- color: string (hex or gradient CSS)
- borderRadius: number
- border: string (e.g., "1px solid #fff")

### Animation (optional for any element)
- animation: { type, duration, delay, direction, ease }

### Custom Components
Custom elements have a special "content" object with:
- layout: { tag, className, style, children, text }
- animations: { elementId: { initial: {...} } }
- timeline: [{ id, animate, transition }]

For custom components, patch the content.layout properties or nested children.

## MULTI-ELEMENT INSTRUCTIONS
When multiple elements are selected:
- "make left one red, right one blue" → identify by position (x values)
- "make all text bigger" → patch all text elements
- "swap colors" → exchange color properties

## OUTPUT FORMAT
Output patches with:
- elementId: exact ID from the input
- changes: { property: newValue } - NEVER EMPTY

For custom components, use dot notation in changes:
{ "content.layout.className": "new-class" }
Or provide nested object:
{ "content": { "layout": { "className": "new-class" } } }`;

function buildElementEditPrompt(request: ElementEditRequest): string {
  const parts: string[] = [];

  parts.push('## INSTRUCTION');
  parts.push(request.instruction);
  parts.push('');

  parts.push('## SELECTED ELEMENTS');
  for (const element of request.elements) {
    parts.push(`### Element: ${element.id} (${element.type})`);
    parts.push('```json');
    parts.push(JSON.stringify(element, null, 2));
    parts.push('```');
    parts.push('');
  }

  if (request.themeConfig) {
    parts.push('## THEME COLORS (for reference)');
    parts.push(`- Text Primary: ${request.themeConfig.colors.text_primary}`);
    parts.push(`- Accent: ${request.themeConfig.colors.accent_primary}`);
    parts.push('');
  }

  parts.push('## TASK');
  parts.push(`Generate patches for the ${request.elements.length} selected element(s).`);
  parts.push('Each patch must have elementId and non-empty changes.');

  return parts.join('\n');
}

export async function generateElementEdit(request: ElementEditRequest): Promise<ElementEditOutput> {
  console.log(`[ElementEditor] Processing: "${request.instruction}"`);
  console.log(`[ElementEditor] Elements: ${request.elements.map(e => e.id).join(', ')}`);

  const prompt = buildElementEditPrompt(request);

  try {
    const result = await aiGenerateStructured({
      model: 'cheap', // Element edits are simple, use cheap model
      schema: ElementEditOutputSchema,
      schemaName: 'ElementEditOutput',
      schemaDescription: 'Element-level patches',
      systemPrompt: ELEMENT_EDITOR_SYSTEM_PROMPT,
      prompt,
      agentType: 'editor',
    });

    console.log(`[ElementEditor] Generated ${result.patches.length} patches`);

    const validIds = new Set(request.elements.map(e => e.id));
    const validPatches = result.patches.filter(p => {
      if (!validIds.has(p.elementId)) {
        console.warn(`[ElementEditor] Dropping patch for unknown element: ${p.elementId}`);
        return false;
      }
      if (!p.changes || Object.keys(p.changes).length === 0) {
        console.warn(`[ElementEditor] Dropping patch with empty changes: ${p.elementId}`);
        return false;
      }
      return true;
    });

    return {
      patches: validPatches,
      explanation: result.explanation,
    };
  } catch (error) {
    console.error('[ElementEditor] Error:', error);
    throw new Error(`Element edit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function deepMerge(target: any, source: any): any {
  const output = { ...target };
  if (target && typeof target === 'object' && source && typeof source === 'object') {
    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

export function applyElementEdits(
  elements: SlideElement[],
  patches: ElementEditOutput['patches']
): SlideElement[] {
  const elementMap = new Map(elements.map(e => [e.id, { ...e }]));

  for (const patch of patches) {
    const element = elementMap.get(patch.elementId);
    if (!element) continue;

    const updated = deepMerge(element, patch.changes);
    elementMap.set(patch.elementId, updated);
  }

  return Array.from(elementMap.values());
}
