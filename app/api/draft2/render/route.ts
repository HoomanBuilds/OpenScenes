import { NextRequest, NextResponse } from 'next/server';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import os from 'os';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { slideId } = body;
        
        if (!slideId) throw new Error("Missing slideId");

        // 1. Sanitize ID to match the variable name we used in the entry point
        // Logic: "slide-1" -> "Slide_slide_1" (Variable) -> "Slide-slide-1" (Composition ID)
        const sanitizedId = slideId.replace(/[^a-zA-Z0-9]/g, '_');
        const variableName = `Slide_${sanitizedId}`;
        const compositionId = variableName.replace(/_/g, '-');

        // 2. Bundle the NEW entry point
        const entryPoint = path.join(process.cwd(), 'remotion', 'draft2-entry.tsx');
        console.log("Bundling Draft 2 from:", entryPoint);

        const bundleLocation = await bundle({
            entryPoint,
            // Keep external packages out of the bundle to avoid conflicts
            webpackOverride: (config) => config, 
        });

        // 3. Select the specific composition (sanity check)
        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: compositionId,
        });
        
        if (!composition) {
             throw new Error(`Composition ${compositionId} not found in bundle.`);
        }

        // 4. Render to temp file
        const tmpDir = os.tmpdir();
        const outputFile = path.join(tmpDir, `draft2-${Date.now()}.mp4`);
        
        console.log(`Rendering ${compositionId} to: ${outputFile}`);

        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: 'h264',
            outputLocation: outputFile,
        });

        // 5. Stream back
        const fileBuffer = fs.readFileSync(outputFile);
        
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'video/mp4',
                'Content-Disposition': `attachment; filename="draft2-slide-${slideId}.mp4"`,
            },
        });

    } catch (error: any) {
        console.error("Draft 2 Render Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
