import { NextRequest, NextResponse } from 'next/server';
import { validateTemplate, TemplateData } from './schemas';
import { processVideoGeneration } from './service';
import fs from 'fs';

export async function POST(req: NextRequest) {
    console.log('\n' + '='.repeat(60));
    console.log('🎬 CLARITY VIDEO GENERATION STARTED');
    console.log('='.repeat(60) + '\n');
    
    try {
        const contentType = req.headers.get('content-type') || '';
        let templateData: TemplateData;
        
        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            const templateFile = formData.get('template') as File | null;
            const templateJsonString = formData.get('templateJson') as string | null;
            
            if (templateFile) {
                const fileContent = await templateFile.text();
                templateData = validateTemplate(JSON.parse(fileContent));
            } else if (templateJsonString) {
                templateData = validateTemplate(JSON.parse(templateJsonString));
            } else {
                throw new Error('No template provided. Send either "template" file or "templateJson" field.');
            }
        } else if (contentType.includes('application/json')) {
            const body = await req.json();
            templateData = validateTemplate(body);
        } else {
            throw new Error('Unsupported content type. Use multipart/form-data or application/json.');
        }
        
        const { searchParams } = new URL(req.url);
        const fps = parseInt(searchParams.get('fps') || '30', 10);
        const scale = parseFloat(searchParams.get('scale') || '1');
        const format = searchParams.get('format') === 'webm' ? 'webm' : 'mp4';
        const speed = parseFloat(searchParams.get('speed') || '1');
        const quality = (searchParams.get('quality') || 'high') as 'low' | 'medium' | 'high';
        
        if (fps < 1 || fps > 120) throw new Error('FPS must be between 1 and 120');
        if (speed < 0.1 || speed > 10) throw new Error('Speed must be between 0.1 and 10');

        const result = await processVideoGeneration({
            templateData,
            fps,
            scale,
            format,
            speed,
            quality,
            abortSignal: req.signal
        });

        const contentTypeMap = {
            mp4: 'video/mp4',
            webm: 'video/webm',
        };

        const fileStream = fs.createReadStream(result.filePath);
        const stream = new ReadableStream({
            start(controller) {
                fileStream.on('data', (chunk) => controller.enqueue(chunk));
                fileStream.on('end', () => {
                    controller.close();
                    try { fs.unlinkSync(result.filePath); } catch (e) {} 
                });
                fileStream.on('error', (err) => {
                    controller.error(err);
                    try { fs.unlinkSync(result.filePath); } catch (e) {}
                });
            },
            cancel() {
                fileStream.destroy();
                try { fs.unlinkSync(result.filePath); } catch (e) {}
            }
        });
        
        return new NextResponse(stream as any, {
            status: 200,
            headers: {
                'Content-Type': contentTypeMap[format],
                'Content-Disposition': `attachment; filename="${result.fileName}"`,
                'Content-Length': result.sizeBytes.toString(),
                'X-Render-Time': `${result.renderTime}s`,
                'X-Total-Frames': result.totalDurationFrames.toString(),
                'X-Duration-Seconds': (result.totalDurationFrames / fps).toFixed(2),
            },
        });
        
    } catch (error: any) {
        console.error('\n❌ RENDERING ERROR:', error.message);
        console.log('='.repeat(60) + '\n');

        if (error.name === 'AbortError' || req.signal.aborted) {
             return NextResponse.json(
                { error: 'Render aborted by user' },
                { status: 499 }
            );
        }
        
        return NextResponse.json(
            { 
                error: error.message || 'Unknown rendering error',
                hint: 'Check that your JSON template is valid and follows the expected schema.',
            },
            { status: 400 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        name: 'Clarity Video Generator - fromJson',
        version: '1.0.0',
        description: 'Generate videos from template JSON files',
        endpoints: {
            POST: {
                url: '/api/generate/fromJson',
                params: {
                    fps: 'number (1-120)',
                    scale: 'number (0.1-2.0)',
                    format: 'mp4 | webm'
                },
                body: 'multipart/form-data (template file) OR application/json'
            }
        }
    });
}