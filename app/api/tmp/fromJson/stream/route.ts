import { NextRequest } from 'next/server';
import { validateTemplate, TemplateData, calculateTotalDuration } from '../schemas';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition, makeCancelSignal } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { startCpuMonitor } from '@/app/lib/monitor';
import { storage } from '../../../../../lib/storage/adapter';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    

    
    (async () => {
        const logBuffer: string[] = [];
        const log = (msg: string = '') => {
            console.log(msg);
            logBuffer.push(msg);
        };
        
        let outputFile: string | null = null;
        let cpuMonitor: any = null;
        let renderId = 0;
        let isStreamOpen = true;
        
        const { cancel, cancelSignal } = makeCancelSignal();

        const sendEvent = async (event: string, data: any) => {
            if (!isStreamOpen) return;
            try {
                await writer.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
            } catch (err) {
                isStreamOpen = false;
                cancel();
            }
        };

        try {
            const contentType = req.headers.get('content-type') || '';
            let templateData: TemplateData;
            
            if (contentType.includes('multipart/form-data')) {
                const formData = await req.formData();
                const templateJsonString = formData.get('templateJson') as string | null;
                if (!templateJsonString) throw new Error('No templateJson');
                templateData = validateTemplate(JSON.parse(templateJsonString));
            } else {
                const body = await req.json();
                templateData = validateTemplate(body);
            }
            
            const { searchParams } = new URL(req.url);
            const fps = parseInt(searchParams.get('fps') || '30', 10);
            const scale = parseFloat(searchParams.get('scale') || '1');
            const format = searchParams.get('format') === 'webm' ? 'webm' : 'mp4';
            const speed = parseFloat(searchParams.get('speed') || '1');
            const quality = (searchParams.get('quality') || 'high') as 'low' | 'medium' | 'high' | 'ultra';
            
            if (speed !== 1) {
                templateData.slides = templateData.slides.map(slide => ({
                    ...slide,
                    duration: Math.round(slide.duration / speed)
                }));
            }
            
            const totalDurationFrames = calculateTotalDuration(templateData.slides);
            renderId = await storage.getNextRenderId();
            const crfMap = { ultra: 10, high: 18, medium: 23, low: 28 };
            const crf = crfMap[quality] || 18;
            const durationSec = (totalDurationFrames / fps).toFixed(1);

            // Auto-scale up for ultra quality if scale is default
            const effectiveScale = quality === 'ultra' && scale === 1 ? 2 : scale;
            
            log('\n' + '='.repeat(60));
            log(`🎬 OpenScenes VIDEO GENERATION STARTED (ID: #${renderId})`);
            log('='.repeat(60));
            log('');
            log(`📋 JOB SETTINGS:`);
            log(`   - Template: "${templateData.name}"`);
            log(`   - Slides:   ${templateData.slides.length}`);
            log(`   - Speed:    ${speed}x`);
            log(`   - Quality:  ${quality.toUpperCase()} (CRF ${crf})`);
            log(`   - Duration: ${totalDurationFrames} frames (${durationSec}s)`);
            log(`   - Output:   ${format.toUpperCase()} @ ${fps}fps (Scale: ${effectiveScale}x)`);
            log('-'.repeat(40));
            
            await sendEvent('start', {
                renderId,
                name: templateData.name,
                slides: templateData.slides.length,
                frames: totalDurationFrames,
                duration: durationSec
            });
            
            let currentCpu = 0;
            cpuMonitor = startCpuMonitor(1000, (usage) => {
                currentCpu = usage;
            });
            
            log('📦 Bundling Remotion composition...');
            await sendEvent('progress', { phase: 'bundling', percent: 0, cpu: 0 });
            
            const entryPoint = path.join(process.cwd(), 'remotion', 'index.tsx');
            const bundleLocation = await bundle({ entryPoint });
            
            await sendEvent('progress', { phase: 'composing', percent: 5, cpu: currentCpu });
            
            const composition = await selectComposition({
                serveUrl: bundleLocation,
                id: 'SlideVideo',
                inputProps: { templateData },
            });
            
            const finalComposition = {
                ...composition,
                durationInFrames: totalDurationFrames,
                fps,
                width: Math.round(1000 * effectiveScale),
                height: Math.round(563 * effectiveScale),
            };
            
            const tmpDir = os.tmpdir();
            const timestamp = Date.now();
            const safeName = templateData.name.replace(/[^a-zA-Z0-9-_]/g, '_');
            outputFile = path.join(tmpDir, `Scenes-${safeName}-${timestamp}.${format}`);
            
            log(`🚀 RENDER STARTED -> ${safeName}.${format}`);
            log(`   Resolution: ${finalComposition.width}x${finalComposition.height}`);
            await sendEvent('progress', { phase: 'rendering', percent: 10, cpu: currentCpu });
            
            
            // const { cancel, cancelSignal } = makeCancelSignal(); // Moved to top
            const startTime = Date.now();
            let lastSentPercent = 10;
            let lastLoggedPercent = -1;
            
            await renderMedia({
                composition: finalComposition,
                serveUrl: bundleLocation,
                codec: format === 'webm' ? 'vp8' : 'h264',
                outputLocation: outputFile,
                inputProps: { templateData },
                cancelSignal,
                crf,
                onProgress: async ({ progress }) => {
                    const percent = Math.floor(progress * 100);
                    
                    if (percent !== lastLoggedPercent && percent % 5 === 0) {
                        const bars = Math.floor(percent / 5);
                        const dots = 20 - bars;
                        const visual = '█'.repeat(bars) + '░'.repeat(dots);
                        try {
                            process.stdout.write(`\r   [${visual}] ${percent}% [CPU: ${currentCpu}%] `);
                        } catch (e) {
                            // Ignore stdout errors (EPIPE)
                        }
                        lastLoggedPercent = percent;
                    }
                    
                    const mappedPercent = Math.floor(10 + progress * 85);
                    if (mappedPercent > lastSentPercent && mappedPercent % 5 === 0) {
                        await sendEvent('progress', { phase: 'rendering', percent: mappedPercent, cpu: currentCpu });
                        lastSentPercent = mappedPercent;
                    }
                },
            });
            
            console.log('\n');
            cpuMonitor.stop();
            const renderTime = ((Date.now() - startTime) / 1000).toFixed(2);
            const stats = fs.statSync(outputFile);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            
            log(`✅ RENDER COMPLETE in ${renderTime}s`);
            log(`📄 Output Size: ${fileSizeMB}MB`);
            log('='.repeat(60) + '\n');
            
            await sendEvent('progress', { phase: 'finalizing', percent: 98, cpu: currentCpu });
            
            log('📤 Preparing video for download...');
            
            const publicDir = path.join(process.cwd(), 'public', 'renders');
            if (!fs.existsSync(publicDir)) {
                fs.mkdirSync(publicDir, { recursive: true });
            }
            
            const publicFileName = `Scenes-${safeName}-${timestamp}.${format}`;
            const publicFilePath = path.join(publicDir, publicFileName);
            
            fs.copyFileSync(outputFile, publicFilePath);
            fs.unlinkSync(outputFile);
            
            const videoUrl = `/renders/${publicFileName}`;
            log(`✅ Video ready`);
            
            await sendEvent('complete', {
                renderId,
                fileName: publicFileName,
                renderTime,
                fileSizeMB,
                videoUrl,
                mimeType: format === 'webm' ? 'video/webm' : 'video/mp4'
            });
            
            await storage.saveRenderLog(renderId, logBuffer.join('\n'));

            setTimeout(() => {
                if (fs.existsSync(publicFilePath)) {
                    fs.unlinkSync(publicFilePath);
                    console.log(`🗑️ Cleanup: Deleted ephemeral video ${publicFileName}`);
                }
            }, 60 * 1000);
            
        } catch (error: any) {
            if (outputFile && fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
            
            if (error.message === 'renderMedia() got cancelled' || error.message.includes('Aborted')) {
                console.log('\x1b[33m\n    - Rendering Aborted\x1b[0m');
                console.log('------------------------------------------------------------\x1b[0m');
            } else {
                log(`❌ ERROR: ${error.message}`);
                if (isStreamOpen) {
                    try {
                        await sendEvent('error', { message: error.message });
                    } catch (e) {
                        console.error('Failed to send error event:', e);
                    }
                }
            }
        } finally {
            try {
                await writer.close();
            } catch (e) {
                // Ignore Writer close error as it might be already closed
            }
        }
    })().catch(err => {
        console.error('Unhandled stream error:', err);
    });
    
    return new Response(stream.readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
