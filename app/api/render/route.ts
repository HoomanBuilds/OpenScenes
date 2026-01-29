import { NextRequest, NextResponse } from 'next/server';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import os from 'os';

export async function POST(req: NextRequest) {
    try {
        const plan = await req.json();

        // 1. Bundle the composition
        // We point to our new entry point
        const entryPoint = path.join(process.cwd(), 'remotion', 'index.tsx');
        
        console.log("Bundling from:", entryPoint);

        const bundleLocation = await bundle({
            entryPoint,
            // If you need specific webpack config, you can add it here.
            // For Next.js/Tailwind, standard bundle usually works if dependencies are installed.
        });

        // 2. Select Composition
        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: 'Main',
            inputProps: { plan },
        });

        // 3. Render Media
        const tmpDir = os.tmpdir();
        const outputFile = path.join(tmpDir, `render-${Date.now()}.mp4`);

        console.log("Rendering to:", outputFile);

        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: 'h264',
            outputLocation: outputFile,
            inputProps: { plan },
        });

        // 4. Read file and return as stream/buffer
        const fileBuffer = fs.readFileSync(outputFile);

        // Cleanup
        // fs.unlinkSync(outputFile); // Optional: cleanup temp file

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'video/mp4',
                'Content-Disposition': 'attachment; filename="video.mp4"',
            },
        });

    } catch (error: any) {
        console.error("Rendering Error:", error);
        return NextResponse.json(
            { error: error.message || "Unknown rendering error" },
            { status: 500 }
        );
    }
}
