import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY || 'sk-placeholder',
    baseURL: 'https://api.deepseek.com/v1',
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { slideId, visualPrompt, themePrompt } = body;

        const systemPrompt = `
You are an Expert React/Remotion Developer.
Your goal is to WRITE A COMPLETE REACT COMPONENT for a single video slide.

CONTEXT:
- Theme: ${themePrompt}
- Visual Goal: ${visualPrompt}
- Output File Name: Slide_${slideId}.tsx

REQUIREMENTS:
1. Export a default React component named "Slide".
2. Use 'remotion' hooks: useCurrentFrame, interpolate, spring, useVideoConfig.
3. RETURN ONLY RAW CODE. Do not wrap in markdown code blocks.
4. **STYLING RULE**: Use Tailwind CSS for EVERYTHING (layout, colors, typography, spacing).
   - Example: \`className="w-full h-full bg-black flex flex-col..."\`
   - DO NOT use inline \`style={{...}}\` for static properties like \`color\` or \`fontSize\`.
   - ONLY use \`style={{...}}\` for DYNAMIC properties driven by \`interpolate\` or \`spring\` (e.g. \`opacity\`, \`transform\`).
5. You can use 'lucide-react' for icons.
6. The component MUST be self-contained.
7. Use absolute positioning (w-full h-full absolute top-0 left-0) to ensure it covers the canvas.
8. Use standard 1920x1080 design.

EXAMPLE OUTPUT:
import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

export default function Slide() {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1]);
  return (
    <div className="w-full h-full bg-black text-white flex items-center justify-center">
       <h1 style={{ opacity }} className="text-9xl font-bold">Generated Title</h1>
    </div>
  );
}
`;

        const completion = await openai.chat.completions.create({
            model: "deepseek-chat",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Write the code." }
            ],
            temperature: 0.7,
        });

        let code = completion.choices[0].message.content || "";
        
        // Strip markdown if present
        code = code.replace(/```tsx/g, '').replace(/```typescript/g, '').replace(/```/g, '');

        // Write to file
        const fileName = `Slide_${slideId}.tsx`;
        // Sanitize ID for variable name (e.g. "slide-1" -> "slide_1")
        const sanitizedId = slideId.replace(/[^a-zA-Z0-9]/g, '_');
        const componentName = `Slide_${sanitizedId}`;
        const filePath = path.join(process.cwd(), 'app', 'draft2', 'generated', fileName);
        
        fs.writeFileSync(filePath, code);

        // Update index.ts to export this new component
        const indexPath = path.join(process.cwd(), 'app', 'draft2', 'generated', 'index.ts');
        let indexContent = "";
        try {
            indexContent = fs.readFileSync(indexPath, 'utf-8');
        } catch (e) {
            indexContent = "// Auto-generated exports\n";
        }

        // Avoid duplicate exports
        if (!indexContent.includes(`export { default as ${componentName} }`)) {
            const exportStmt = `\nexport { default as ${componentName} } from './${fileName.replace('.tsx', '')}';`;
            fs.appendFileSync(indexPath, exportStmt);
        }

        return NextResponse.json({ success: true, components: [fileName] });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
