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
    quality: 'low' | 'medium' | 'high' | 'ultra';
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
    // HARDCODED OVERRIDES FOR SMOOTHNESS & QUALITY
    fps = 60; 
    quality = 'ultra';
    scale = Math.max(scale, 2); 
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

        const crfMap = { ultra: 10, high: 18, medium: 23, low: 28 }; // Lower CRF = Higher quality
        const crf = crfMap[quality] || 18;
        
        // Auto-scale up for ultra quality if scale is default
        const effectiveScale = quality === 'ultra' && scale === 1 ? 2 : scale;

        logger.log('\n' + '='.repeat(60));
        logger.log(`🎬OpenScenes VIDEO GENERATION STARTED (ID: #${renderId})`);
        logger.log('='.repeat(60));
        logger.log('');
        logger.log(`📋 JOB SETTINGS:`);
        logger.log(`   - Template: "${templateData.name}"`);
        logger.log(`   - Slides:   ${templateData.slides.length}`);
        logger.log(`   - Speed:    ${speed}x`);
        logger.log(`   - Quality:  ${quality.toUpperCase()} (CRF ${crf})`);
        logger.log(`   - Duration: ${totalDurationFrames} frames (${durationSec}s)`);
        logger.log(`   - Output:   ${format.toUpperCase()} @ ${fps}fps (Scale: ${effectiveScale}x)`);
        logger.log('-'.repeat(40));

        const entryPoint = path.join(process.cwd(), 'remotion', 'index.tsx');
        const rootDir = process.cwd();
        
        if (!fs.existsSync(entryPoint)) {
            throw new Error(`Remotion entry point not found at: ${entryPoint}`);
        }

        logger.log('📦 Bundling Remotion composition (Cache Busting v2)...');
        bundleLocation = await bundle({ 
            entryPoint,
            rootDir,
            enableCaching: false, 
            webpackOverride: (config: any) => {
                const cssPath = path.resolve(rootDir, 'remotion', 'style.css');
                
                // Add absolute CSS path to entry to ensure it's picked up
                if (typeof config.entry === 'string') {
                    config.entry = [cssPath, config.entry];
                } else if (Array.isArray(config.entry)) {
                    config.entry.unshift(cssPath);
                }

                return {
                    ...config,
                    module: {
                        ...config.module,
                        rules: [
                            ...(config.module?.rules ?? []).filter((rule: any) => {
                                const isCss = rule && rule.test && rule.test.toString().includes('css');
                                return !isCss;
                            }),
                            {
                                test: /\.css$/i,
                                use: [
                                    eval('require.resolve')('style-loader'),
                                    eval('require.resolve')('css-loader'),
                                    {
                                        loader: eval('require.resolve')('postcss-loader'),
                                        options: {
                                            postcssOptions: {
                                                plugins: [
                                                    eval('require')('@tailwindcss/postcss'),
                                                ],
                                            },
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                };
            },
        });

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
