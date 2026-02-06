import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { queue, AIJob } from '../../lib/queue/adapter';
import { redis } from '../../lib/redis/adapter';
import { run, type PipelineInput, type PipelineOutput } from '../../lib/ai';
import { initTracing, shutdownTracing } from '../../lib/ai/tracing';
import { setJobContext, clearJobContext } from '../../lib/ai/adapter';
import { initDatabase } from '../../lib/db/postgres';
import { initAICallsTable } from '../../lib/db/ai-calls';
import { initAIAssetsTable } from '../../lib/db/ai-assets';
import { logger } from '../../lib/ai/logger';

const AI_JOB_PREFIX = 'ai:job:';
const AI_JOB_TTL = 3600;

async function updateJobStatus(
  jobId: string, 
  status: 'queued' | 'processing' | 'completed' | 'failed',
  data?: { result?: unknown; error?: string }
) {
  const record = {
    jobId,
    status,
    result: data?.result,
    error: data?.error,
    updatedAt: Date.now(),
  };
  
  await redis.setex(
    `${AI_JOB_PREFIX}${jobId}`,
    AI_JOB_TTL,
    JSON.stringify(record)
  );
}

async function processAIJob(job: AIJob): Promise<void> {
  const startTime = Date.now();
  
  logger.worker.jobStart(job.jobId, job.type, job.userQuery);
  
  setJobContext(job.jobId);
  
  await updateJobStatus(job.jobId, 'processing');
  
  try {
    const pipelineInput: PipelineInput = {
      jobId: job.jobId,
      userQuery: job.userQuery,
      themeName: job.themeName,
      uploadedFileContent: job.uploadedFileContent,
      urlContent: job.urlContent,
      requestedSlideCount: job.requestedSlideCount,
      additionalInstructions: job.additionalInstructions,
    };
    
    if (job.type === 'edit' && job.existingSlides) {
      pipelineInput.existingSlides = job.existingSlides as PipelineInput['existingSlides'];
      pipelineInput.editInstruction = job.editInstruction;
      pipelineInput.previousMetadata = job.previousMetadata as PipelineInput['previousMetadata'];
    }
    
    const result: PipelineOutput = await run(pipelineInput);
    
    const duration = Date.now() - startTime;
    logger.worker.jobComplete(job.jobId, result.slides.length, duration);
    
    await updateJobStatus(job.jobId, 'completed', {
      result: {
        slides: result.slides,
        metadata: result.metadata,
        appliedPatches: result.appliedPatches,
        isEdit: result.isEdit,
      },
    });
    
  } catch (error) {
    logger.worker.jobError(job.jobId, error instanceof Error ? error.message : 'Unknown error');
    
    await updateJobStatus(job.jobId, 'failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    clearJobContext();
  }
}

async function main() {
  logger.worker.start();
  
  logger.worker.env(
    process.env.GOOGLE_CLOUD_PROJECT || 'not set',
    process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
  );
  
  process.on('SIGINT', async () => {
    logger.blank();
    logger.divider();
    console.log('Shutting down AI worker...');
    await shutdownTracing();
    process.exit(0);
  });

  try {
    initTracing();
    
    logger.worker.connection('Database', 'connecting');
    try {
        await initDatabase();
    } catch {
    }
    await initAICallsTable();
    await initAIAssetsTable();
    logger.worker.connection('Database', 'connected');
    
    logger.worker.connection('RabbitMQ', 'connecting');
    await queue.connect();
    logger.worker.connection('RabbitMQ', 'connected');
    
    logger.worker.ready();
    await queue.consumeAIJobs(processAIJob);
    
  } catch (error) {
    console.error('AI Worker failed to start:', error);
    await shutdownTracing();
    process.exit(1);
  }
}

main();

