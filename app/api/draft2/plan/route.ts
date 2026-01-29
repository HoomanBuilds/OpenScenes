import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const openai = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY || 'sk-placeholder',
    baseURL: 'https://api.deepseek.com/v1',
});

// Schema for the Planner's Output
const PlannerSchema = z.object({
    themePrompt: z.string().describe("A visual description of the global theme (colors, fonts, vibe)"),
    commonPrompt: z.string().describe("Common instruction for all slides (e.g. 'Use large text', 'Fade in')"),
    slides: z.array(z.object({
        id: z.string(),
        script: z.string().describe("The text content or goal of this slide"),
        visualPrompt: z.string().describe("Specific visual instructions for this slide (e.g. 'Title in center', 'Split screen')")
    }))
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { topic, userPrompt } = body;
        
        const jsonSchema = zodToJsonSchema(PlannerSchema as any, "planner");

        const systemPrompt = `
You are the Creative Director (Planner) for a video generator.
Your goal is to break down a user request into a specific plan for 1 or more slides.

USER REQUEST: Topic="${topic}", Extra="${userPrompt}"

INSTRUCTIONS:
1. Define a 'themePrompt' that describes the visual vibe (e.g. "Cyberpunk, neon blue/pink, Glitch font").
2. Define 'commonPrompt' for shared rules (e.g. "All text must be uppercase").
3. Break the video into 'slides'. For a simple request, 1 slide is fine.
4. For each slide, write a 'visualPrompt' that tells the Coder exactly what to build (e.g. "React component with a centered h1 and a gradient background").

OUTPUT JSON SCHEMA:
${JSON.stringify(jsonSchema, null, 2)}

One-Shot Example:
{
  "themePrompt": "Minimalist, Black and White, Inter Font",
  "commonPrompt": "Smooth opalacity fade-ins for all elements",
  "slides": [
    { "id": "slide-1", "script": "Intro", "visualPrompt": "Large centered Title saying 'THE END' with a subtle scale up animation." }
  ]
}

Return ONLY valid JSON.
`;

        const completion = await openai.chat.completions.create({
            model: "deepseek-chat",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Create the plan." }
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' }
        });

        const rawContent = completion.choices[0].message.content;
        const plan = JSON.parse(rawContent!);
        
        return NextResponse.json(plan);
        
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
