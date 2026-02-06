import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
console.log('[Worker] Loaded environment. Vertex Project:', process.env.GOOGLE_CLOUD_PROJECT);

import { queue, AIJob } from '../../lib/queue/adapter';
import { redis } from '../../lib/redis/adapter';
import { run, type PipelineInput, type PipelineOutput } from '../../lib/ai';
import { initTracing, shutdownTracing } from '../../lib/ai/tracing';
import { setJobContext, clearJobContext } from '../../lib/ai/adapter';
import { initDatabase } from '../../lib/db/postgres';
import { initAICallsTable } from '../../lib/db/ai-calls';

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
  console.log(`[AI Worker] Processing job: ${job.jobId}`);
  console.log(`[AI Worker] Type: ${job.type}, Query: "${job.userQuery.slice(0, 50)}..."`);
  
  setJobContext(job.jobId);
  
  await updateJobStatus(job.jobId, 'processing');
  
  try {
    const pipelineInput: PipelineInput = {
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
    
    console.log(`[AI Worker] Job ${job.jobId} completed: ${result.slides.length} slides`);
    
    await updateJobStatus(job.jobId, 'completed', {
      result: {
        slides: result.slides,
        metadata: result.metadata,
        appliedPatches: result.appliedPatches,
        isEdit: result.isEdit,
      },
    });
    
  } catch (error) {
    console.error(`[AI Worker] Job ${job.jobId} failed:`, error);
    
    await updateJobStatus(job.jobId, 'failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    clearJobContext();
  }
}

async function main() {
  console.log('AI Worker starting...');
  
  process.on('SIGINT', async () => {
    console.log('\nShutting down AI worker...');
    await shutdownTracing();
    process.exit(0);
  });

  try {
    initTracing();
    
    console.log('Initializing database tables...');
    try {
        await initDatabase();
        console.log('[DB] render_jobs table initialized');
    } catch (err) {
        console.warn('[DB] Failed to init render_jobs (might exist):', err);
    }
    await initAICallsTable();
    
    console.log('Connecting to RabbitMQ...');
    await queue.connect();
    console.log('Connected to RabbitMQ');
    
    console.log('Waiting for AI jobs...');
    await queue.consumeAIJobs(processAIJob);
    
  } catch (error) {
    console.error('AI Worker failed to start:', error);
    await shutdownTracing();
    process.exit(1);
  }
}

main();
