import { loadEnvFile } from 'node:process';
import path from 'path';

try {
  loadEnvFile(path.resolve(process.cwd(), '.env'));
} catch (e) {
}

import { queue, RenderJob } from '../../lib/queue/adapter';
import { processRenderJob } from './processor';
import { initDatabase } from '../../lib/db/postgres';

const LATEST_ONLY = process.argv.includes('--latest');
const WORKER_START_TIME = Date.now();

async function handleJob(job: RenderJob): Promise<void> {
  if (LATEST_ONLY && job.createdAt < WORKER_START_TIME) {
      progressManager.log(`[Worker] Skipping old job ${job.jobId} (--latest mode)`);
      return;
  }
  progressManager.log(`Received job: ${job.jobId}`);
  await processRenderJob(job);
}

import { progressManager } from './progress';

async function main() {
  console.log('Render Worker starting...');
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
      console.log('\nShutting down worker...');
      progressManager.stop();
      process.exit(0);
  });

  try {
    progressManager.captureConsole();
    progressManager.log('Initializing database...');
    await initDatabase();
    
    await queue.connect();
    progressManager.log('Connected to RabbitMQ');
    
    progressManager.log('Waiting for render jobs...');
    await queue.consumeRenderJobs(handleJob);
    
  } catch (error) {
    console.error('Worker failed to start:', error);
    process.exit(1);
  }
}

main();

