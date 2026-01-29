import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ExecutionPlanSchema, RegistryComponentEnum } from '../../../registry/schema';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const openai = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY || 'sk-placeholder',
    baseURL: 'https://api.deepseek.com/v1',
});

const RequestSchema = z.object({
    theme: z.enum(['dark', 'light', 'cinematic', 'minimal']),
    duration: z.number().min(3).max(60),
    slideCount: z.number().default(1),
    motionIntensity: z.enum(['low', 'medium', 'high']),
    textDensity: z.enum(['minimal', 'balanced', 'dense']),
    customPrompt: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const input = RequestSchema.parse(body);

        const jsonSchema = zodToJsonSchema(ExecutionPlanSchema as any, "executionPlan");

        const systemPrompt = `
You are the AI Director for a premium video generator.
Your goal is to output a STRICT JSON "Execution Plan" for a single-slide video.

COMPONENTS (Must use from Registry):
${RegistryComponentEnum.options.map(o => `- ${o}`).join('\n')}

DESIGN DIRECTIVE:
1. **Visuals MUST be Cinematic**: Use large fonts, high contrast, and vivid colors.
2. **"Max Power" Mode**: You have full creative control. Do not produce "safe" or "minimal" designs unless asked.
3. **Use 'extras' for Overrides**: You can pass 'fontSize' (e.g. "10rem"), 'gradient' (e.g. "linear-gradient(to right, #ff00cc, #333399)") in the content.extras object.
4. **Motion**: Use 'high' intensity for impactful intros.

RULES:
1. Output ONLY valid JSON.
2. Respect constraints: Duration=${input.duration}s.
3. Timing: 'durationInFrames' = ${input.duration * 30}.
4. Provide 'video' and 'slides' (array of 1).

JSON SCHEMA:
${JSON.stringify(jsonSchema, null, 2)}

ONE-SHOT EXAMPLE (Rich & Cinematic):
{
  "video": {
    "totalDurationFrames": 150,
    "theme": "cinematic",
    "fps": 30,
    "width": 1920,
    "height": 1080
  },
  "slides": [
    {
      "id": "slide-0",
      "componentId": "TITLE_CENTER_FADE",
      "content": { 
        "title": "THE FUTURE", 
        "subtitle": "is cleaner than you think.", 
        "extras": { "fontSize": "12rem", "subtitleSize": "4rem" }
      },
      "timing": { "durationInFrames": 150 },
      "motion": { "intensity": "high", "enterDuration": 25, "exitDuration": 25, "holdDuration": 100 },
      "style": { "primaryColor": "#00ffcc", "backgroundColor": "#050505", "fontFamily": "Inter" }
    }
  ]
}

User Request:
Theme: ${input.theme}
Duration: ${input.duration}s
Intensity: ${input.motionIntensity}
Density: ${input.textDensity}
Extra Prompt: ${input.customPrompt || 'None'}

Return the JSON execution plan:
`;

        const completion = await openai.chat.completions.create({
            model: "deepseek-chat",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Generate the execution plan." }
            ],
            temperature: 0.7, // Higher temperature for creativity
            response_format: { type: 'json_object' } // Enforce JSON mode
        });

        const rawContent = completion.choices[0].message.content;
        console.log("AI Raw Output:", rawContent);
        
        if (!rawContent) {
            throw new Error("No content from deepseek");
        }

        // Validate JSON
        let parsedJson;
        try {
            parsedJson = JSON.parse(rawContent);
        } catch (e) {
            throw new Error("Invalid JSON returned by AI");
        }

        // Validate Schema
        const executionPlan = ExecutionPlanSchema.parse(parsedJson);

        return NextResponse.json(executionPlan);

    } catch (error: any) {
        console.error("AI Generation Error:", error);
        return NextResponse.json(
            { error: error.message || "Unknown error" },
            { status: 400 }
        );
    }
}
