import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition, makeCancelSignal } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { RenderJob } from '../../lib/queue/types';
import { objectStorage } from '../../lib/object-storage/adapter';
import { updateJobStatus } from '../../lib/db/postgres';
import { progressManager } from './progress';

// Singleton Redis for cancellation
const Redis = require('ioredis');
let cancellationSubscriber: any = null;
const activeCancelFunctions = new Map<string, () => void>();

function initCancellationListener() {
    if (cancellationSubscriber) return;
    
    cancellationSubscriber = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
    
    cancellationSubscriber.subscribe('render:cancel', (err: any) => {
        if (err) progressManager.log(`[Error] Failed to subscribe to cancellation: ${err}`);
    });

    cancellationSubscriber.on('message', (channel: string, message: string) => {
        if (channel === 'render:cancel') {
            const cancelFn = activeCancelFunctions.get(message);
            if (cancelFn) {
                progressManager.updateBar(message, 0, 'Cancelling...');
                cancelFn();
            }
        }
    });
}

// Initialize immediately
initCancellationListener();

interface ProcessResult {
  videoUrl: string;
  renderTime: string;
  totalDurationFrames: number;
  fileSizeMB: string;
}

let cachedBundleLocation: string | null = null;

function calculateTotalDurationInFrames(slides: any[], fps: number): number {
  return slides.reduce((acc, slide) => {
    const duration = slide.duration || 150;
    if (duration >= 1000) {
      return acc + Math.ceil(duration / 1000 * fps);
    }
    return acc + duration;
  }, 0);
}

export async function processRenderJob(job: RenderJob): Promise<ProcessResult | undefined> {
  const startTime = Date.now();
  let outputFile: string | null = null;
  
  // Initialize progress bar
  const bar = progressManager.createBar(job.jobId, 100, 'Starting...');

  // Setup cancellation
  const { cancelSignal, cancel } = makeCancelSignal();
  activeCancelFunctions.set(job.jobId, cancel);

  try {
    await updateJobStatus(job.jobId, 'processing', { progress: 0 });

    const { templateData, fps, scale, format, quality } = job;

    const totalDurationFrames = calculateTotalDurationInFrames(templateData.slides, fps);

    const crfMap = { ultra: 10, high: 18, medium: 23, low: 28 };
    const crf = crfMap[quality] || 18;
    const effectiveScale = quality === 'ultra' && scale === 1 ? 2 : scale;

    progressManager.updateBar(job.jobId, 2, 'Bundling...');
    
    const entryPoint = path.join(process.cwd(), 'remotion', 'index.tsx');
    const rootDir = process.cwd();
    
    if (!fs.existsSync(entryPoint)) {
      throw new Error(`Remotion entry point not found at: ${entryPoint}`);
    }

    let bundleLocation = cachedBundleLocation;

    if (!bundleLocation) {
        await updateJobStatus(job.jobId, 'processing', { progress: 5 });
        
        bundleLocation = await bundle({ 
            entryPoint,
            rootDir,
            enableCaching: true, 
            webpackOverride: (config: any) => {
              const cssPath = path.resolve(rootDir, 'remotion', 'style.css');
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

      cachedBundleLocation = bundleLocation;
    } 

    progressManager.updateBar(job.jobId, 15, 'Rendering...');
    await updateJobStatus(job.jobId, 'processing', { progress: 15 });

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
    const safeName = templateData.name.replace(/[^a-zA-Z0-9-_]/g, '_');
    outputFile = path.join(tmpDir, `render-${job.jobId}.${format}`);
    
    let lastProgressUpdate = 15;

    await renderMedia({
      composition: finalComposition,
      serveUrl: bundleLocation,
      codec: format === 'webm' ? 'vp8' : 'h264',
      outputLocation: outputFile,
      inputProps: { templateData },
      cancelSignal,
      crf,
      onProgress: async ({ progress }) => {
        const percent = Math.floor(15 + progress * 75);
        progressManager.updateBar(job.jobId, percent);
        
        if (percent >= lastProgressUpdate + 5) { 
          lastProgressUpdate = percent;
          await updateJobStatus(job.jobId, 'processing', { progress: percent });
        }
      },
    });

    const renderTime = ((Date.now() - startTime) / 1000).toFixed(2);
    const stats = fs.statSync(outputFile);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    progressManager.updateBar(job.jobId, 95, 'Uploading...');
    await updateJobStatus(job.jobId, 'processing', { progress: 95 });

    const videoStream = fs.createReadStream(outputFile);
    const objectKey = `${job.jobId}/${safeName}.${format}`;
    const contentType = format === 'webm' ? 'video/webm' : 'video/mp4';
    
    const videoUrl = await objectStorage.uploadStream('videos', objectKey, videoStream, contentType, stats.size);

    if (outputFile && fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile);
    }

    progressManager.updateBar(job.jobId, 100, 'Complete');
    await updateJobStatus(job.jobId, 'completed', { videoUrl, progress: 100 });
    
    setTimeout(() => {
        progressManager.removeBar(job.jobId);
    }, 2000);

    return {
      videoUrl,
      renderTime,
      totalDurationFrames,
      fileSizeMB,
    };

  } catch (error: any) {
    if (outputFile && fs.existsSync(outputFile)) {
      try { fs.unlinkSync(outputFile); } catch {}
    }

    const isCancelled = 
        error.message === 'USER_CANCEL_REQUEST' || 
        (error.message && error.message.includes('The operation was aborted')) ||
        (error.message && error.message.includes('renderMedia() got cancelled'));

    const status = isCancelled ? 'cancelled' : 'failed';
    const errorMessage = isCancelled ? 'Cancelled by user' : error.message;

    if (isCancelled) {
        progressManager.updateBar(job.jobId, 0, 'Cancelled');
    } else {
        progressManager.updateBar(job.jobId, 0, 'Failed');
        progressManager.log(`[Error] Job ${job.jobId} failed: ${error.message}`);
    }

    await updateJobStatus(job.jobId, status, { error: errorMessage });
    
    setTimeout(() => {
        progressManager.removeBar(job.jobId);
    }, 5000);

    if (!isCancelled) {
        throw error;
    }
  } finally {
      activeCancelFunctions.delete(job.jobId);
  }
}
