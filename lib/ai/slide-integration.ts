import { Slide } from '../../app/generate/types';
import { editSlideSmart } from './slide/pipeline';

export interface ChatHistoryItem {
    role: 'user' | 'assistant';
    content: string;
}

export async function processSlideEditWithHistory(
    slide: Slide,
    instruction: string,
    history: ChatHistoryItem[] = [],
    selectedElementIds: string[] = []
): Promise<{ slide: Slide, explanation: string }> {
    let contextInstruction = instruction;
    
    if (history && history.length > 0) {
        const historyText = history
            .map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`)
            .join('\n');
            
        contextInstruction = `Conversation History:\n${historyText}\n\nCurrent Instruction: ${instruction}`;
    }
    
    return await editSlideSmart(slide, contextInstruction, history, selectedElementIds);
}
