import { z } from 'zod';
import { aiGenerateJSON, aiGenerateStructured } from './adapter';
import { CANVAS } from './config';
import type { ThemeConfig } from './types';
import type { Slide } from '../schemas/template';
import { CUSTOM_COMPONENT_SYSTEM_PROMPT, buildCustomComponentPrompt } from './prompts';
import { applyPathPatch } from './apply';

const EditTypeSchema = z.enum(['content', 'style', 'animation', 'redesign']);
type EditType = z.infer<typeof EditTypeSchema>;

// Basic patch structure
const PatchSchema = z.object({
  path: z.string().describe('Dot-notation path like "background.value" or "elements.0.content"'),
  value: z.any().describe('New value to set at the path'),
});

const SmartEditPatchOutput = z.object({
  action: z.literal('patch'),
  patches: z.array(PatchSchema),
  summary: z.string(),
});

// Classification structure
const ClassificationSchema = z.object({
  scope: z.enum(['local', 'global']),
  editType: EditTypeSchema.optional(),
  affectedSlideIds: z.array(z.string()),
  reasoning: z.string(),
});
type ClassificationResult = z.infer<typeof ClassificationSchema>;

export interface SmartEditRequest {
  existingSlides: Slide[];
  instruction: string;
  themePrompt?: string;
  themeConfig?: ThemeConfig;
  projectContext?: string;
}

export interface SmartEditResult {
  slides: Slide[];
  summary: string;
  isGlobal: boolean;
  affectedSlideIds: string[];
}

const CLASSIFIER_PROMPT = `You are an EDIT CLASSIFIER. Decide if the instruction is LOCAL or GLOBAL.

## SCOPE DEFINITIONS
1. **LOCAL**: Affects specific slides (e.g., "change title of slide 1", "fix typo in benefits").
2. **GLOBAL**: Affects all slides or theme (e.g., "make all headings blue", "change font everywhere").

## EDIT TYPES (for LOCAL edits)
- **content**: Text changes, typos.
- **style**: Visual changes (colors, sizes).
- **animation**: Motion changes.
- **redesign**: Major structural redesign.

Output JSON with: scope ("local" | "global"), editType (for local), affectedSlideIds (array), and reasoning.`;


const PATCH_SYSTEM_PROMPT = `You are a SLIDE PATCH generator.

## YOUR TASK
Generate minimal JSON patches to modify a slide. Use dot-notation paths.

## PATH EXAMPLES
- "background.value" → Change background color
- "elements.0.content" → Change first element's content
- "elements.2.textColor" → Change third element's text color
- "elements.0.animation.delay" → Change animation delay
- "duration" → Change slide duration

## OUTPUT FORMAT
{
  "action": "patch",
  "patches": [
    { "path": "elements.0.content", "value": "New Title" },
    { "path": "background.value", "value": "#1a1a2e" }
  ],
  "summary": "Changed title and background color"
}

## RULES
1. Use the SHORTEST path possible
2. Only patch what the user requested
3. Never regenerate entire elements when a single property change suffices
4. For nested objects, merge at the deepest level`;

async function classifyEdit(instruction: string, slideSummaries: string): Promise<ClassificationResult> {
  try {
    const result = await aiGenerateStructured({
      model: 'cheap',
      schema: ClassificationSchema,
      schemaName: 'EditClassification',
      schemaDescription: 'Edit type and scope classification',
      systemPrompt: CLASSIFIER_PROMPT,
      prompt: `Instruction: ${instruction}\n\nSlides:\n${slideSummaries}`,
      agentType: 'director',
    });
    console.log(`[SmartEditor] Scope: ${result.scope}, Type: ${result.editType} (${result.reasoning})`);
    return result;
  } catch (e) {
    console.warn('[SmartEditor] Classification failed, defaulting to local style:', e);
    return { scope: 'local', editType: 'style', affectedSlideIds: [], reasoning: 'Fallback due to error' };
  }
}

function getModelForEditType(editType: EditType): 'cheap' | 'medium' | 'main' {
  switch (editType) {
    case 'content': return 'cheap';
    case 'style': return 'medium';
    case 'animation': return 'medium';
    case 'redesign': return 'main';
  }
}

function buildPatchPrompt(slide: Slide, instruction: string, themeConfig?: ThemeConfig): string {
  const parts: string[] = [];
  
  parts.push('## INSTRUCTION');
  parts.push(instruction);
  parts.push('');
  
  parts.push('## CURRENT SLIDE');
  parts.push('```json');
  parts.push(JSON.stringify(slide, null, 2));
  parts.push('```');
  parts.push('');
  
  if (themeConfig) {
    parts.push('## THEME (for reference)');
    parts.push(`- Accent: ${themeConfig.colors.accent_primary}`);
    parts.push(`- Text: ${themeConfig.colors.text_primary}`);
    parts.push('');
  }
  
  parts.push('Generate patches now.');
  return parts.join('\n');
}

async function generatePatches(
  slide: Slide,
  instruction: string,
  editType: EditType,
  themeConfig?: ThemeConfig
): Promise<{ patches: Array<{ path: string; value: any }>; summary: string }> {
  const model = getModelForEditType(editType);
  console.log(`[SmartEditor] Generating patches with ${model} model`);
  
  const prompt = buildPatchPrompt(slide, instruction, themeConfig);
  
  const result = await aiGenerateStructured({
    model,
    schema: SmartEditPatchOutput,
    schemaName: 'SmartEditPatchOutput',
    schemaDescription: 'Patch-based edit output',
    systemPrompt: PATCH_SYSTEM_PROMPT,
    prompt,
    agentType: 'editor',
  });
  
  return { patches: result.patches, summary: result.summary };
}



function applyPatches(slide: Slide, patches: Array<{ path: string; value: any }>): Slide {
  const result = JSON.parse(JSON.stringify(slide));
  
  for (const patch of patches) {
    try {
      applyPathPatch(result, patch.path, patch.value);
      console.log(`[SmartEditor] Applied: ${patch.path}`);
    } catch (e) {
      console.warn(`[SmartEditor] Failed to apply patch ${patch.path}:`, e);
    }
  }
  
  return result;
}

async function smartEditSingleSlide(
  slide: Slide,
  instruction: string,
  editType: EditType,
  themeConfig?: ThemeConfig,
  themePrompt?: string,
  projectContext?: string
): Promise<Slide> {
  const request: SmartEditRequest = {
    existingSlides: [slide],
    instruction,
    themeConfig,
    themePrompt,
    projectContext
  };

  if (editType === 'redesign') {
    return await regenerateSlide({ slide, instruction, projectContext, themePrompt });
  }
  
  const { patches } = await generatePatches(slide, instruction, editType, themeConfig);
  return applyPatches(slide, patches);
}

// Internal helper for legacy support/single slide ops
async function regenerateSlide(req: { slide: Slide, instruction: string, projectContext?: string, themePrompt?: string }): Promise<Slide> {
  console.log('[SmartEditor] Regenerating slide with main model');
  
  const redesignPrompt = `
REDESIGN REQUEST: ${req.instruction}
CURRENT SLIDE CONTEXT: ${req.slide.type}, ${req.slide.duration}ms
${req.projectContext ? `PROJECT CONTEXT: ${req.projectContext}` : ''}

Create a PREMIUM custom component slide. Use glassmorphism, gradients, and pulse animations.
`;

  const customPrompt = buildCustomComponentPrompt(redesignPrompt, req.themePrompt || 'Modern Dark Theme');
  const customContent = await aiGenerateJSON({
    model: 'main',
    systemPrompt: CUSTOM_COMPONENT_SYSTEM_PROMPT,
    prompt: customPrompt,
    agentType: 'generator',
  });
  
  return {
    id: req.slide.id,
    type: 'custom',
    duration: req.slide.duration || 5000,
    background: req.slide.background || { type: 'color', value: '#0a0a0a' },
    elements: [
      {
        id: `custom-${Date.now()}`,
        type: 'custom',
        x: 0,
        y: 0,
        width: CANVAS.width,
        height: CANVAS.height,
        zIndex: 10,
        content: customContent as any,
      }
    ]
  };
}

export async function smartEditSlide(request: { slide: Slide } & Omit<SmartEditRequest, 'existingSlides'>): Promise<Slide> {
  const headlineEl = request.slide.elements?.find(el => el.type === 'headline');
  const slideSummary = `ID: ${request.slide.id} | Title: ${headlineEl?.content || 'Untitled'}`;
  const classification = await classifyEdit(request.instruction, slideSummary);
  return await smartEditSingleSlide(
    request.slide,
    request.instruction,
    classification.editType || 'style',
    request.themeConfig,
    request.themePrompt,
    request.projectContext
  );
}

export async function smartEditPresentation(request: SmartEditRequest): Promise<SmartEditResult> {
  console.log(`[SmartEditor] Multi-Slide Processing: "${request.instruction}"`);
  
  const slideSummaries = request.existingSlides.map((s, i) => `${i + 1}. ID: ${s.id} | Title: ${s.elements?.find(el => el.type === 'headline')?.content || 'Untitled'}`).join('\n');
  
  const classification = await classifyEdit(request.instruction, slideSummaries);

  console.log(`[SmartEditor] Scope: ${classification.scope}, Affected: ${classification.affectedSlideIds.join(', ')}`);

  let finalSlides = [...request.existingSlides];

  if (classification.scope === 'global') {
    // For global, use a single patch generation pass on a medium model
    const globalResult = await generatePatches(
      request.existingSlides[0], // Use first as representative for common properties
      `GLOBAL CHANGE: ${request.instruction}. Apply this change to ALL slides.`,
      'style',
      request.themeConfig
    );
    
    finalSlides = finalSlides.map(slide => applyPatches(slide, globalResult.patches));
    
    return {
      slides: finalSlides,
      summary: `Global update: ${globalResult.summary}`,
      isGlobal: true,
      affectedSlideIds: finalSlides.map(s => s.id)
    };
  } else {
    // For local, iterate and use tiered models
    const affectedIds = new Set(classification.affectedSlideIds);
    const editType = classification.editType || 'style';
    
    const processedSlides = await Promise.all(finalSlides.map(async (slide) => {
      if (!affectedIds.has(slide.id)) return slide;
      return await smartEditSingleSlide(
        slide,
        request.instruction,
        editType,
        request.themeConfig,
        request.themePrompt,
        request.projectContext
      );
    }));
    
    return {
      slides: processedSlides,
      summary: `Local edits applied to ${classification.affectedSlideIds.length} slides.`,
      isGlobal: false,
      affectedSlideIds: classification.affectedSlideIds
    };
  }
}

export type { EditType };
