import { aiGenerateStructured } from '../adapter';
import { Slide } from '../../../app/generate/types';
import { PipelineOutput, PipelineOutputSchema } from './schema';
import { PLANNER_SYSTEM_PROMPT } from './prompts';

function simplifySlideForContext(slide: Slide): any {
    return {
        id: slide.id,
        background: slide.background,
        elements: slide.elements?.map(el => mapElementContext(el))
    };
}

function mapElementContext(el: any): any {
    const base: any = {
        id: el.id,
        type: el.type,
        isContainer: el.type === 'custom' || Array.isArray(el.children), 
    };

    if (el.type === 'custom' && el.content && typeof el.content === 'object') {
        const content = el.content as any;
        if (content.layout) {
            base.structure = simplifyDom(content.layout);
        }
        if (content.animations) {
            base.animationsCount = Object.keys(content.animations).length;
            base.animatedIds = Object.keys(content.animations);
        }
        if (content.timeline) {
            base.timelineSteps = content.timeline.length;
            // Provide a summary of timeline steps (labels or target IDs)
            base.timelineSummary = content.timeline.map((s: any, i: number) => {
                if (s.label) return `[${i}] Label: ${s.label}`;
                if (s.id) return `[${i}] Animate: ${s.id}`;
                if (s.delay) return `[${i}] Delay: ${s.delay}s`;
                return `[${i}] Step`;
            });
        }
        return base;
    }
    
    return {
        ...base,
        content: typeof el.content === 'string' ? el.content.substring(0, 50) : 'Object content'
    };
}

function simplifyDom(node: any): any {
    return {
        id: node.id,
        tag: node.tag,
        className: node.className,
        text: node.text?.substring(0, 30),
        children: node.children?.map(simplifyDom)
    };
}

export async function planActions(
    slide: Slide, 
    instruction: string, 
    history?: { role: string, content: string }[],
    selectedElementIds: string[] = [],
    themePrompt?: string
): Promise<PipelineOutput> {
    const simplifiedSlide = simplifySlideForContext(slide);
    
    const selectionContext = selectedElementIds.length > 0
        ? `\nCURRENT SELECTION: The user has selected elements with IDs: [${selectedElementIds.join(', ')}]. \nWhen they say "this" or "the selected item", they refer to these.\n`
        : "";
    
    let historyContext = "";
    if (history && history.length > 0) {
        historyContext = "\n--- PREVIOUS CONVERSATION CONTEXT ---\n" + 
            history.map(h => `${h.role.toUpperCase()}: ${h.content}`).join('\n') + 
            "\n--- END OF CONTEXT ---\n";
    }

    const themeContext = themePrompt 
        ? `\n--- THEME RULES (STRICT ADHERENCE REQUIRED) ---\n${themePrompt}\n`
        : "";

    const prompt = `
Slide Context (Current State):
${JSON.stringify(simplifiedSlide, null, 2)}
${historyContext}${themeContext}${selectionContext}

CRITICAL: The current request below is what you must solve NOW. 
The context above is for reference to understand what has been done or discussed.

CURRENT USER REQUEST TO SOLVE:
">>> ${instruction} <<<"

Generate the sequence of actions to execute based ON THE CURRENT REQUEST.
`;

    try {
        if (process.env.DEBUG_AI === 'true') {
            console.log("\n--- DEBUG AI ---");
            console.log("SYSTEM PROMPT:\n", PLANNER_SYSTEM_PROMPT);
            console.log("USER PROMPT:\n", prompt);
            console.log("----------------\n");
        }

        const result = await aiGenerateStructured<PipelineOutput>({
            model: 'main', 
            schema: PipelineOutputSchema,
            schemaName: 'SlideModificationPlan',
            schemaDescription: 'A list of actions to modify the slide',
            systemPrompt: PLANNER_SYSTEM_PROMPT,
            prompt: prompt,
            agentType: 'director'
        });

        return result;
    } catch (error) {
        console.error("Planner failed:", error);
        return { actions: [], reasoning: "AI Failure" };
    }
}
