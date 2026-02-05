import { loadEnvFile } from 'node:process';
import path from 'path';

try {
  loadEnvFile(path.resolve(process.cwd(), '.env'));
} catch (e) {
}

import { queue, RenderJob } from '../../lib/queue/adapter';
import { processRenderJob } from './processor';
import { initDatabase } from '../../lib/db/postgres';

async function handleJob(job: RenderJob): Promise<void> {
  console.log(`Received job: ${job.jobId}`);
  await processRenderJob(job);
}

async function main() {
  console.log('Render Worker starting...');
  
  try {
    console.log('Initializing database...');
    await initDatabase();
    
    await queue.connect();
    console.log('Connected to RabbitMQ');
    
    console.log('Waiting for render jobs...');
    await queue.consumeRenderJobs(handleJob);
    
  } catch (error) {
    console.error('Worker failed to start:', error);
    process.exit(1);
  }
}

main();

