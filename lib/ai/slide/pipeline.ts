import { Slide } from '../../../app/generate/types';
import { planActions } from './planner';
import { executeActions } from './executor';

function normalizeCustomElements(slide: Slide): Slide {
    for (const el of slide.elements || []) {
        if (el.type === "custom" && (el as any).structure && !el.content) {
            el.content = {
                layout: (el as any).structure,
                animations: {},
                timeline: []
            };
        }
    }
    return slide;
}

export async function editSlideSmart(
    slide: Slide, 
    instruction: string, 
    history?: { role: string, content: string }[],
    selectedElementIds: string[] = []
): Promise<{ slide: Slide, explanation: string }> {
    console.log(`[SmartPipeline] Processing: "${instruction}" for slide ${slide.id}`);
    
    // 1. Plan
    const plan = await planActions(slide, instruction, history, selectedElementIds);
    console.log(`[SmartPipeline] Plan:`, JSON.stringify(plan, null, 2));

    if (!plan.actions || plan.actions.length === 0) {
        return { slide, explanation: "I couldn't identify any specific actions to take based on your request." };
    }

    // 2. Execute
    const normalized = normalizeCustomElements(slide);
    const updatedSlide = executeActions(normalized, plan.actions);
    
    return { 
        slide: updatedSlide, 
        explanation: plan.reasoning || "Updated slide based on instructions." 
    };
}
