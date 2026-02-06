import { aiGenerateJSON, aiGenerateStructured } from './adapter';
import { AI_LIMITS, CANVAS, SUPPORTED_ELEMENT_TYPES, SUPPORTED_SLIDE_TYPES } from './config';
import { logger } from './logger';
import type { 
  SlideGeneratorInput, 
  SlideGeneratorOutput,
  AssetMetadata,
  SceneGuidance,
} from './types';
import type { Slide, SlideElement } from '../schemas/template';
import { TEMPLATE_REGISTRY, TemplateId } from './templates';
import { ZodType } from 'zod';
import { 
  SLIDE_GENERATOR_SYSTEM_PROMPT, 
  buildSlideGeneratorPrompt,
  buildTemplateFillerPrompt,
  DATA_FILLER_SYSTEM_PROMPT,
  CUSTOM_COMPONENT_SYSTEM_PROMPT,
  buildCustomComponentPrompt
} from './prompts';
import { CustomComponentOutputSchema } from './customSchema';
import { COMPONENT_REGISTRY } from './components';

function validateElement(element: SlideElement, slideId: string): SlideElement {
  const validated = { ...element };
  
  if (!validated.id) {
    validated.id = `${slideId}-element-${Math.random().toString(36).slice(2, 8)}`;
  }
  
  if (typeof validated.x === 'number') {
    validated.x = Math.max(0, Math.min(validated.x, CANVAS.width - 10));
  }
  if (typeof validated.y === 'number') {
    validated.y = Math.max(0, Math.min(validated.y, CANVAS.height - 10));
  }
  
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

function validateSlide(slide: Slide, index: number): Slide {
  const validated = { ...slide };
  
  if (!validated.id) {
    validated.id = `slide-${index + 1}`;
  }
  
  if (!validated.type || !SUPPORTED_SLIDE_TYPES.includes(validated.type as typeof SUPPORTED_SLIDE_TYPES[number])) {
    validated.type = 'default';
  }
  
  if (typeof validated.duration !== 'number' || validated.duration <= 0) {
    validated.duration = 180;
  }
  
  if (!validated.background) {
    validated.background = { type: 'color', value: '#0a0a0a' };
  }
  
  if (validated.elements && Array.isArray(validated.elements)) {
    validated.elements = validated.elements.map(el => validateElement(el, validated.id));
    
    if (validated.elements.length > AI_LIMITS.MAX_ELEMENTS_PER_SLIDE) {
      console.warn(`[SlideGenerator] Capping elements from ${validated.elements.length} to ${AI_LIMITS.MAX_ELEMENTS_PER_SLIDE}`);
      validated.elements = validated.elements.slice(0, AI_LIMITS.MAX_ELEMENTS_PER_SLIDE);
    }
  } else {
    validated.elements = [];
  }
  
  return validated;
}

function createSlideSummary(slide: Slide): string {
  const parts: string[] = [];
  
  parts.push(`Slide ID: ${slide.id}, Type: ${slide.type}`);
  
  if (slide.background) {
    parts.push(`Background: ${slide.background.type} - ${slide.background.value}`);
  }
  
  if (slide.elements && slide.elements.length > 0) {
    parts.push(`Elements (${slide.elements.length}):`);
    for (const el of slide.elements.slice(0, 5)) {
      let contentPreview = '';
      if (typeof el.content === 'string') {
        contentPreview = el.content.slice(0, 30);
      } else if (typeof el.content === 'object') {
        contentPreview = '[Custom Layout JSON]';
      }
      parts.push(`  - ${el.type} at (${el.x}, ${el.y}): ${contentPreview}`);
    }
  }
  
  return parts.join('\n');
}

async function fillTemplateData(
    templateId: string, 
    context: string, 
    _commonPrompt: string,
    _themePrompt: string
): Promise<any> {
    const template = TEMPLATE_REGISTRY[templateId as TemplateId];
    if (!template) throw new Error(`Template ${templateId} not found`);

    const prompt = buildTemplateFillerPrompt(context);

    return await aiGenerateStructured({
        model: 'cheap',
        schema: template.schema as unknown as ZodType<any>,
        schemaName: `TemplateData_${templateId}`,
        schemaDescription: `Content for ${template.name}`,
        systemPrompt: DATA_FILLER_SYSTEM_PROMPT,
        prompt,
        agentType: 'generator'
    });
}

export async function generateSlides(
  input: SlideGeneratorInput
): Promise<SlideGeneratorOutput> {
  const slides: Slide[] = [];
  const freeFormScenes: SceneGuidance[] = [];
  const freeFormIndices: number[] = [];

  for (let i = 0; i < input.sceneGuidance.length; i++) {
    const scene = input.sceneGuidance[i];

    if (scene.mode === 'template' && scene.templateId && TEMPLATE_REGISTRY[scene.templateId as TemplateId]) {
       try {
         if (input.jobId) {
             const fillerPrompt = buildTemplateFillerPrompt(scene.templateContext || scene.intent);
             await logger.debug.prompt(input.jobId, `template-filler-${scene.templateId}-${i}`, fillerPrompt);
         }

         const data = await fillTemplateData(
             scene.templateId, 
             scene.templateContext || scene.intent, 
             input.commonPrompt,
             input.themePrompt
         );
         
         const template = TEMPLATE_REGISTRY[scene.templateId as TemplateId];
         const elements = template.render(data, {}); 
         
         slides[i] = {
             id: scene.sceneId || `slide-${i}`,
             type: template.slideType,
             duration: scene.durationMs,
             background: { type: 'color', value: '#0a0a0a' }, 
             elements
         };
         continue;
         
       } catch (error) {
           console.error(`[SlideGenerator] Template generation failed for ${scene.templateId}`, error);
           freeFormScenes.push(scene);
           freeFormIndices.push(i);
       }
    } 
    else if (scene.mode === 'custom') {
        try {
            console.log(`[SlideGenerator] Generating custom component for scene ${scene.sceneId}`);
            
            const customPrompt = buildCustomComponentPrompt(
                `${scene.visualGuidance}. Intent: ${scene.intent}`, 
                input.themePrompt || 'Modern Dark Theme'
            );

            if (input.jobId) {
                await logger.debug.prompt(input.jobId, `custom-slide-${i}`, customPrompt, CUSTOM_COMPONENT_SYSTEM_PROMPT);
            }

            const customContent = await aiGenerateJSON({
                model: 'main',
                systemPrompt: CUSTOM_COMPONENT_SYSTEM_PROMPT,
                prompt: customPrompt,
                agentType: 'generator'
            });

            slides[i] = {
                id: scene.sceneId || `slide-${i}`,
                type: 'custom',
                duration: scene.durationMs,
                background: { type: 'color', value: '#0a0a0a' },
                elements: [
                    {
                        id: `custom-${Math.random().toString(36).substr(2, 9)}`,
                        type: 'custom',
                        x: 0,
                        y: 0,
                        width: 1000,
                        height: 562,
                        zIndex: 10,
                        content: customContent as any 
                    }
                ]
            };
            continue; 

        } catch (e) {
            console.warn(`[SlideGenerator] Custom generation failed for ${scene.sceneId}`, e);
            freeFormScenes.push(scene);
            freeFormIndices.push(i);
        }
    }
    else if (scene.mode === 'component' && scene.componentId) {
        try {
            console.log(`[SlideGenerator] Component mode for ${scene.componentId}`);
            
            const componentExample = COMPONENT_REGISTRY[scene.componentId];
            const componentContext = componentExample 
                ? `\n\nREFERENCE COMPONENT JSON:\n${JSON.stringify(componentExample).slice(0, 5000)}... (truncated)` 
                : '';

            const customPrompt = buildCustomComponentPrompt(
                `STRICTLY based on component '${scene.componentId}'. ${scene.visualGuidance}. ${componentContext}`, 
                input.themePrompt || 'Modern Dark Theme'
            );

            if (input.jobId) {
                await logger.debug.prompt(input.jobId, `component-slide-${i}`, customPrompt);
            }

            const customContent = await aiGenerateJSON({
                 model: 'main', 
                 systemPrompt: CUSTOM_COMPONENT_SYSTEM_PROMPT, 
                 prompt: customPrompt,
                 agentType: 'generator'
             });
             
             slides[i] = {
                id: scene.sceneId || `slide-${i}`,
                type: 'custom', 
                duration: scene.durationMs,
                background: { type: 'color', value: '#0a0a0a' },
                elements: [
                    {
                        id: `custom-${Math.random().toString(36).substr(2, 9)}`,
                        type: 'custom',
                        x: 0,
                        y: 0,
                        width: 1000,
                        height: 562,
                        zIndex: 10,
                        content: customContent as any 
                    }
                ]
            };
            console.log(`[SlideGenerator] Component slide added at index ${i}: ${slides[i]?.id}`);
            continue;
            
        } catch (e) {
             console.error(`[SlideGenerator] CUSTOM MODE FAILED for Scene ${scene.sceneId}. Falling back to Template.`, e);
             freeFormScenes.push(scene);
             freeFormIndices.push(i);
        }
    }
    else {
       freeFormScenes.push(scene);
       freeFormIndices.push(i);
    }
  }

  if (freeFormScenes.length > 0) {
      const prompt = buildSlideGeneratorPrompt({
          ...input,
          sceneGuidance: freeFormScenes
      });

      if (input.jobId) {
          const batchId = freeFormScenes[0].sceneIndex;
          await logger.debug.prompt(input.jobId, `batch-slides-${batchId}`, prompt);
      }

      try {
        const result = await aiGenerateJSON({
          model: 'main',
          systemPrompt: SLIDE_GENERATOR_SYSTEM_PROMPT,
          prompt,
          agentType: 'generator',
        });
        
        let generatedFromBatch: Slide[];
        if (Array.isArray(result)) {
          generatedFromBatch = result as Slide[];
        } else if (result && typeof result === 'object' && 'slides' in result) {
          generatedFromBatch = (result as { slides: Slide[] }).slides;
        } else {
          throw new Error('Unexpected response format - expected array of slides');
        }

        generatedFromBatch.forEach((slide, idx) => {
            const originalIndex = freeFormIndices[idx];
            slides[originalIndex] = validateSlide(slide, originalIndex);
        });

      } catch (error) {
          throw new Error(`Slide generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
  }

  console.log(`[SlideGenerator] Before filter: slides array length=${slides.length}, defined entries=${slides.filter(Boolean).length}`);
  slides.forEach((s, i) => { if(s) console.log(`  [${i}] ${s.id}`); });
  
  const finalSlides = slides.filter(Boolean);

  const lastSlide = finalSlides[finalSlides.length - 1];
  const batchSummary = lastSlide ? createSlideSummary(lastSlide) : '';
    
  return {
    slides: finalSlides,
    batchSummary,
  };
}

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

export function insertAssetUrls(
  slides: Slide[],
  assetMetadata: Map<string, AssetMetadata>
): Slide[] {
  const assignedAssetUrls = new Set<string>();

  return slides.map(slide => ({
    ...slide,
    elements: slide.elements?.map(element => {
      if (element.type !== 'image') return element;

      let asset = assetMetadata.get(element.id);
      
      if (!asset) {
        asset = assetMetadata.get(`${slide.id}-${element.id}`);
      }

      if (!asset) {
        asset = Array.from(assetMetadata.values()).find(
          a => a.targetSlideId === slide.id && !assignedAssetUrls.has(a.url)
        );
      }

      if (asset) {
        assignedAssetUrls.add(asset.url);
        return {
          ...element,
          content: asset.url,
        };
      }
      
      return element;
    }),
  }));
}
