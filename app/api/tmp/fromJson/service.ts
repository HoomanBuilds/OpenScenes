import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition, makeCancelSignal } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { TemplateData, calculateTotalDuration } from './schemas';
import { startCpuMonitor } from '@/app/lib/monitor';
import { storage } from '../../../../lib/storage/adapter';

interface RenderOptions {
    templateData: TemplateData;
    fps: number;
    scale: number;
    format: 'mp4' | 'webm';
    speed: number;
    quality: 'low' | 'medium' | 'high';
    abortSignal: AbortSignal;
}

interface RenderResult {
    filePath: string;
    fileName: string;
    renderTime: string;
    totalDurationFrames: number;
    fileSizeMB: string;
    sizeBytes: number;
    renderId: number;
}

class LogBuffer {
    buffer: string[] = [];

    log(message: string = '') {
        console.log(message);
        this.buffer.push(message);
    }

    progress(visual: string, percent: number, cpu: number) {
        process.stdout.write(`\r   ${visual} ${percent}% [CPU: ${cpu}%] `);
        
        if (percent % 25 === 0) {
           this.buffer.push(`   Progress: ${percent}% (CPU: ${cpu}%)`);
        }
    }

    getContents() {
        return this.buffer.join('\n');
    }
}

export async function processVideoGeneration({
    templateData,
    fps,
    scale,
    format,
    speed,
    quality,
    abortSignal
}: RenderOptions): Promise<RenderResult> {
    const logger = new LogBuffer();
    const startTime = Date.now();
    let bundleLocation: string | null = null;
    let outputFile: string | null = null;
    let cpuMonitor: ReturnType<typeof startCpuMonitor> | null = null;
    let currentCpu = 0;

    const renderId = await storage.getNextRenderId();

    try {
        cpuMonitor = startCpuMonitor(1000, (usage) => {
            currentCpu = usage;
        });

        if (speed !== 1) {
            templateData.slides = templateData.slides.map(slide => ({
                ...slide,
                duration: Math.round(slide.duration / speed)
            }));
        }

        const totalDurationFrames = calculateTotalDuration(templateData.slides);
        const durationSec = (totalDurationFrames / fps).toFixed(1);

        const crfMap = { high: 20, medium: 26, low: 32 };
        const crf = crfMap[quality];

        logger.log('\n' + '='.repeat(60));
        logger.log(`🎬 CLARITY VIDEO GENERATION STARTED (ID: #${renderId})`);
        logger.log('='.repeat(60));
        logger.log('');
        logger.log(`📋 JOB SETTINGS:`);
        logger.log(`   - Template: "${templateData.name}"`);
        logger.log(`   - Slides:   ${templateData.slides.length}`);
        logger.log(`   - Speed:    ${speed}x`);
        logger.log(`   - Quality:  ${quality.toUpperCase()} (CRF ${crf})`);
        logger.log(`   - Duration: ${totalDurationFrames} frames (${durationSec}s)`);
        logger.log(`   - Output:   ${format.toUpperCase()} @ ${fps}fps (Scale: ${scale}x)`);
        logger.log('-'.repeat(40));

        const entryPoint = path.join(process.cwd(), 'remotion', 'index.tsx');
        if (!fs.existsSync(entryPoint)) {
            throw new Error(`Remotion entry point not found at: ${entryPoint}`);
        }

        logger.log('📦 Bundling Remotion composition...');
        bundleLocation = await bundle({ entryPoint });

        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: 'SlideVideo',
            inputProps: { templateData },
        });

        const finalComposition = {
            ...composition,
            durationInFrames: totalDurationFrames,
            fps,
            width: Math.round(1000 * scale),
            height: Math.round(562 * scale),
        };

        const tmpDir = os.tmpdir();
        const timestamp = Date.now();
        const safeName = templateData.name.replace(/[^a-zA-Z0-9-_]/g, '_');
        outputFile = path.join(tmpDir, `clarity-${safeName}-${timestamp}.${format}`);

        logger.log(`🚀 RENDER STARTED -> ${safeName}.${format}`);
        logger.log(`   Resolution: ${finalComposition.width}x${finalComposition.height}`);

        let lastLoggedPercent = -1;
        const { cancel, cancelSignal } = makeCancelSignal();
        
        if (abortSignal.aborted) {
            cancel();
        } else {
            abortSignal.addEventListener('abort', () => {
                cancel();
                logger.log('\n🛑 Render aborted by client');
            });
        }

        await renderMedia({
            composition: finalComposition,
            serveUrl: bundleLocation,
            codec: format === 'webm' ? 'vp8' : 'h264',
            outputLocation: outputFile,
            inputProps: { templateData },
            cancelSignal,
            crf,
            onProgress: ({ progress }) => {
                const percent = Math.floor(progress * 100);
                if (percent !== lastLoggedPercent && percent % 5 === 0) {
                    const bars = Math.floor(percent / 5);
                    const dots = 20 - bars;
                    const visual = '█'.repeat(bars) + '░'.repeat(dots);
                    
                    logger.progress(`[${visual}]`, percent, currentCpu);
                    
                    lastLoggedPercent = percent;
                }
            },
        });

        console.log('\n'); 
        logger.buffer.push('\n'); 
        
        const renderTime = ((Date.now() - startTime) / 1000).toFixed(2);
        logger.log(`✅ RENDER COMPLETE in ${renderTime}s`);

        const stats = fs.statSync(outputFile);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        logger.log(`📄 Output Size: ${fileSizeMB}MB`);
        logger.log('='.repeat(60) + '\n');
        
        if (cpuMonitor) cpuMonitor.stop();

        await storage.saveRenderLog(renderId, logger.getContents());

        return {
            filePath: outputFile,
            fileName: `${safeName}.${format}`,
            renderTime,
            totalDurationFrames,
            fileSizeMB,
            sizeBytes: stats.size,
            renderId
        };

    } catch (error: any) {
        if (cpuMonitor) cpuMonitor.stop();
        if (outputFile && fs.existsSync(outputFile)) {
            try { fs.unlinkSync(outputFile); } catch (e) {}
        }
        
        logger.log(`❌ ERROR: ${error.message}`);
        await storage.saveRenderLog(renderId, logger.getContents());
        
        throw error;
    }
}
