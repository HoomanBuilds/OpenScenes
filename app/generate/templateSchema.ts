import { z } from 'zod';

export const AnimationSchema = z.object({
    type: z.string().optional(),
    direction: z.string().optional(),
    duration: z.number().optional(),
    delay: z.number().optional(),
}).passthrough().optional();

const ElementSchema = z.object({
    id: z.string(),
    type: z.string(),
    x: z.number().optional(),
    y: z.number().optional(),
}).passthrough();

const BackgroundSchema = z.object({
    type: z.string(),
    value: z.string().optional(),
}).passthrough().optional();

const TransitionSchema = z.object({
    type: z.enum(['none', 'fade', 'slide', 'wipe']),
    duration: z.number().optional(),
}).optional();

const SlideSchema = z.object({
    id: z.string(),
    type: z.string().optional(),
    duration: z.number().optional(),
    background: BackgroundSchema.optional(),
    elements: z.array(ElementSchema).optional(),
    transition: TransitionSchema.optional(),
}).passthrough();

export const TemplateSchema = z.object({
    name: z.string(),
    slides: z.array(SlideSchema),
}).passthrough();

export type ImportedTemplate = z.infer<typeof TemplateSchema>;

export function validateTemplate(data: unknown): { success: true; data: ImportedTemplate } | { success: false; error: string } {
    const result = TemplateSchema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    } else {
        return { success: false, error: result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') };
    }
}
