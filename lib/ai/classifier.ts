import { z } from 'zod';
import { aiGenerateStructured } from './adapter';
import { Slide } from '../schemas/template';

const EditClassificationSchema = z.object({
  scope: z.enum(['local', 'global']).describe('Classification of the edit scope'),
  affectedSlideIds: z.array(z.string()).describe('IDs of slides affected if scope is local'),
  reasoning: z.string().describe('Brief explanation for the classification'),
});

export type EditClassification = z.infer<typeof EditClassificationSchema>;

const CLASSIFIER_SYSTEM_PROMPT = `You are an EDIT CLASSIFIER for a slide-based presentation system.
Your job is to analyze a user's edit instruction and decide if it is LOCAL or GLOBAL.

## SCOPE DEFINITIONS
1. **LOCAL**:
   - Affects specific slides or elements (e.g., "Change title of slide 1", "Fix typo in the benefits list", "Remove the image from the team slide").
   - Affects a small identifiable group of slides.
2. **GLOBAL**:
   - Affects all slides or the overall theme (e.g., "Make all headings blue", "Change the font everywhere", "Apply a tech vibe to all slides", "Slow down all animations").

## YOUR TASK
1. Identify the scope.
2. If LOCAL, list the IDs of the affected slides.
3. Provide a brief reasoning.`;

export async function classifyEditRequest(
  instruction: string,
  slides: Slide[]
): Promise<EditClassification> {
  const slideSummaries = slides.map((s, i) => `${i + 1}. ID: ${s.id} | Title: ${s.elements?.find(el => el.type === 'headline')?.content || 'Untitled'}`).join('\n');

  const prompt = `Analyze the following instruction and classify the edit scope.

### SLIDES LIST ###
${slideSummaries}

### INSTRUCTION ###
${instruction}

Classify now.`;

  try {
    return await aiGenerateStructured({
      model: 'cheap', // Classification is a lightweight task
      schema: EditClassificationSchema,
      schemaName: 'EditClassification',
      schemaDescription: 'Scope classification for presentation edit',
      systemPrompt: CLASSIFIER_SYSTEM_PROMPT,
      prompt,
      agentType: 'director', // Classifier acts like a director's assistant
    });
  } catch (error) {
    console.error('[Classifier] Error classifying request, defaulting to global:', error);
    return {
      scope: 'global',
      affectedSlideIds: [],
      reasoning: 'Error during classification, using safe fallback.',
    };
  }
}
