import { z } from 'zod';

export const ActionTypeSchema = z.enum([
    'ADD_COMPONENT', 
    'UPDATE_STYLE', 
    'UPDATE_CONTENT', 
    'REMOVE_COMPONENT', 
    'MOVE_COMPONENT', 
    'UPDATE_ANIMATION', 
    'UPDATE_TIMELINE',
    'REPLACE_SLIDE'
]);

export type ActionType = z.infer<typeof ActionTypeSchema>;

const parseJSON = (val: any) => {
    if (typeof val === 'string') {
        if (val.trim().startsWith('{') || val.trim().startsWith('[')) {
            try {
                return JSON.parse(val);
            } catch (e) {
                return val;
            }
        }
    }
    return val;
};

const repairContent = (val: any): { text?: string; content?: any } => {
    if (val === null || val === undefined) return {};
    const parsed = parseJSON(val);
    
    // Already correct object format - but validate it's not malformed
    if (typeof parsed === 'object' && !Array.isArray(parsed)) {
        // Check for common AI mistake: { "content": "text" } or { "text": "content" }
        // where the value is literally a property name instead of actual content
        const keys = Object.keys(parsed);
        if (keys.length === 1) {
            const key = keys[0];
            const value = parsed[key];
            // If value is literally "text" or "content", the AI made an error
            // We can't fix it without more context, but log a warning
            if (value === 'text' || value === 'content') {
                console.warn(`[Schema Repair] Detected likely malformed content: { "${key}": "${value}" }`);
            }
        }
        if (parsed.content && !parsed.text) {
            parsed.text = parsed.content;
            delete parsed.content;
        }
        return parsed;
    }
    
    // Handle string directly
    if (typeof parsed === 'string') {
        return { text: parsed };
    }
    
    // Handle array formats like ["content", "Pipeline Verified"]
    if (Array.isArray(parsed)) {
        // EDGE CASE: ["content"] or ["text"] - AI forgot the value
        if (parsed.length === 1 && typeof parsed[0] === 'string') {
            console.warn(`[Schema Repair] Malformed content: received ["${parsed[0]}"] without value. Cannot auto-fix.`);
            return {};
        }
        if (parsed.length === 2 && typeof parsed[0] === 'string') {
            const key = parsed[0];
            const value = parsed[1];
            if (key === 'text' || key === 'content') {
                return { text: value };
            }
        }
        // Handle nested arrays [["content", "value"]]
        if (parsed.length >= 1 && Array.isArray(parsed[0])) {
            const result: Record<string, any> = {};
            for (const pair of parsed) {
                if (Array.isArray(pair) && pair.length === 2) {
                    result[pair[0] as string] = pair[1];
                }
            }
            return result;
        }
    }
    
    return parsed || {};
};

const repairStyle = (val: any): { style?: Record<string, any>; className?: string; background?: Record<string, any> } => {
    if (val === null || val === undefined) return {};
    const parsed = parseJSON(val);
    
    // Already correct object format
    if (typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
    }
    
    // Handle string directly - assume background color
    if (typeof parsed === 'string') {
        return { background: { type: 'color', value: parsed } };
    }
    
    // Handle array formats
    if (Array.isArray(parsed)) {
        if (parsed.length === 1 && typeof parsed[0] === 'string') {
            console.warn(`[Schema Repair] Malformed style: received ["${parsed[0]}"] without value. Cannot auto-fix.`);
            return {};
        }
        // [["type", "color"], ["value", "blue"]] for background
        if (parsed.length >= 1 && Array.isArray(parsed[0])) {
            const obj: Record<string, any> = {};
            for (const pair of parsed) {
                if (Array.isArray(pair) && pair.length === 2) {
                    obj[pair[0] as string] = pair[1];
                }
            }
            // Check if this looks like a background object
            if (obj.type && obj.value) {
                return { background: obj };
            }
            return obj;
        }
        // ["background", { type: "color", value: "blue" }]
        if (parsed.length === 2 && parsed[0] === 'background' && typeof parsed[1] === 'object') {
            return { background: parsed[1] };
        }
        // ["background", "blue"] shorthand
        if (parsed.length === 2 && parsed[0] === 'background' && typeof parsed[1] === 'string') {
            return { background: { type: 'color', value: parsed[1] } };
        }
        // ["style", { color: "blue" }]
        if (parsed.length === 2 && parsed[0] === 'style' && typeof parsed[1] === 'object') {
            return { style: parsed[1] };
        }
    }
    
    return parsed || {};
};

const BaseActionSchema = z.object({
    id: z.string().optional().describe('Action ID'),
    reasoning: z.string().optional().describe('Specific reasoning for this step'),
});

const AddComponentSchema = BaseActionSchema.extend({
    action: z.literal('ADD_COMPONENT'),
    elementId: z.string().describe('Unique ID for the new element'),
    elementType: z.enum(['custom', 'headline', 'text', 'image']).default('custom').describe('Type of element'),
    parentId: z.string().describe('The container ID (use "root" for top-level)'),
    structure: z.any().describe('The full component structure: { layout: { tag, className, children }, animations?: {}, timeline?: [] }'),
    position: z.enum(['before', 'after', 'inside']).optional().describe('Position relative to referenceId or parentId'),
    referenceId: z.string().optional().describe('Optional reference element for before/after positioning'),
});

const UpdateStyleSchema = BaseActionSchema.extend({
    action: z.literal('UPDATE_STYLE'),
    targetId: z.string().describe('ID of the element OR the slide ID for background'),
    properties: z.any().transform(repairStyle).describe('Style payload. Use { "style": {...} } or { "background": {...} }'),
});

const UpdateContentSchema = BaseActionSchema.extend({
    action: z.literal('UPDATE_CONTENT'),
    targetId: z.string().describe('ID of the element to update'),
    properties: z.any().transform(repairContent).describe('Content payload. Use { "text": "..." } or { "content": "..." }'),
});

const RemoveComponentSchema = BaseActionSchema.extend({
    action: z.literal('REMOVE_COMPONENT'),
    targetId: z.string().describe('ID of the element to remove'),
});

const MoveComponentSchema = BaseActionSchema.extend({
    action: z.literal('MOVE_COMPONENT'),
    targetId: z.string().describe('ID of the element to move'),
    parentId: z.string().describe('The container to move INTO'),
    referenceId: z.string().optional().describe('Reference element for positioning'),
    position: z.enum(['before', 'after', 'inside']).optional().describe('Where to place relative to reference'),
});

const UpdateAnimationSchema = BaseActionSchema.extend({
    action: z.literal('UPDATE_ANIMATION'),
    targetId: z.string().describe('ID of the element to animate'),
    properties: z.preprocess(val => {
        const parsed = parseJSON(val);
        if (parsed && typeof parsed === 'object' && parsed.initial) {
            return { ...parsed, ...parsed.initial };
        }
        return parsed;
    }, z.record(z.string(), z.any())).describe('Initial animation state. MUST be an object, e.g. { "opacity": 0 }'),
});

const UpdateTimelineSchema = BaseActionSchema.extend({
    action: z.literal('UPDATE_TIMELINE'),
    timelineStep: z.preprocess(parseJSON, z.any()).describe('Full timeline step object to add. MUST be an object.'),
    timelineIndex: z.number().optional().describe('Index for specific placement'),
    position: z.preprocess(val => {
        if (val === 0 || val === '0' || val === 'start' || val === 'prepend') return 'before';
        return val;
    }, z.enum(['before', 'after', 'replace', 'append']).optional().default('append')).describe('Where to put the step relative to timelineIndex'),
});

const ReplaceSlideSchema = BaseActionSchema.extend({
    action: z.literal('REPLACE_SLIDE'),
    elements: z.array(z.any()).describe('The complete new elements array for the slide'),
    background: z.any().optional().describe('New background configuration')
});

export const SlideActionSchema = z.discriminatedUnion('action', [
    AddComponentSchema,
    UpdateStyleSchema,
    UpdateContentSchema,
    RemoveComponentSchema,
    MoveComponentSchema,
    UpdateAnimationSchema,
    UpdateTimelineSchema,
    ReplaceSlideSchema
]);

export type SlideAction = z.infer<typeof SlideActionSchema>;

const unwrapArray = (val: any) => {
    while (Array.isArray(val) && val.length === 1 && !val[0].action) {
        val = val[0];
    }
    
    if (Array.isArray(val) && val.length > 0 && val[0].action) {
        console.log('[Schema] Rewrapping actions-only array');
        return {
            actions: val,
            reasoning: "Executing generated actions."
        };
    }
    
    if (val && typeof val === 'object' && val.action && !val.actions) {
         console.log('[Schema] Rewrapping single-action object');
         return {
             actions: [val],
             reasoning: "Executing single generated action."
         };
    }

    return val;
};

export const PipelineOutputSchema = z.preprocess(unwrapArray, z.object({
    actions: z.array(SlideActionSchema).describe('Sequential modifications'),
    reasoning: z.string().describe('Strategic explanation'),
}));

export type PipelineOutput = z.infer<typeof PipelineOutputSchema>;
