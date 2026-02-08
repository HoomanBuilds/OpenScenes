import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { run } from '../lib/ai/pipeline';
import type { PipelineInput } from '../lib/ai/types';
import fs from 'fs/promises';

import { logger } from '../lib/ai/logger';
const noop = () => {};
logger.worker = { start: noop, env: noop, connection: noop, ready: noop, jobStart: noop, jobComplete: noop, jobError: noop, blank: noop, divider: noop } as any;
logger.pipeline = { start: (msg: string) => console.log(`[PIPELINE] START: ${msg}`), complete: (msg: string) => console.log(`[PIPELINE] COMPLETE: ${msg}`) } as any;
logger.summarizer = { complete: (msg: string) => console.log(`[SUMMARIZER] DONE: ${msg}`) } as any;
logger.director = { planning: () => console.log('[DIRECTOR] Planning...'), planned: (msg: string) => console.log(`[DIRECTOR] Planned: ${msg}`) } as any;
logger.asset = { generating: (count: number) => console.log(`[ASSET] Generating ${count} assets...`), complete: (msg: string) => console.log(`[ASSET] Done: ${msg}`), generated: (key: string, success: boolean) => console.log(`[ASSET] Generated ${key}: ${success ? '✅' : '❌'}`) } as any;
logger.generator = { 
  generating: (count: number, batch: number, total: number) => console.log(`[GENERATOR] Batch ${batch}/${total}: Generating ${count} slides...`), 
  generated: (count: number) => console.log(`[GENERATOR] Batch complete: ${count} slides ready.`) 
} as any;
logger.validator = { 
  validating: () => console.log(`[VALIDATOR] Validating slides...`), 
  valid: () => console.log(`[VALIDATOR] All slides OK.`), 
  fixed: (count: number) => console.log(`[VALIDATOR] Fixed ${count} issues.`) 
} as any;
logger.debug = { log: async (msg: string) => console.log(`[DEBUG] ${msg}`), prompt: async (msg: string) => {} } as any;

async function testFullGlobalPipeline() {
  const query = "The Future of AI in Healthcare";
  console.log(`Starting Full Global Pipeline Test for query: "${query}"`);
  
  try {
    const input: PipelineInput = {
      jobId: 'test-wealthsync-1',
      userQuery: `Create a 2-slide presentation for "WealthSync AI" using Custom Mode.

Title: WealthSync AI Subtitle: Your $8.4B Portfolio, Managed.

Slide 1 (Hero): A "Global Markets HUD" with a rotating 3D purple grid floor. Main metric: "Net Worth: $1.2M" in neon green. 
Slide 2 (Stats): Two vertical cards tilted 15deg showing "APY +14.2%" and "Market Volume $500M". Use glassmorphic panels and subtle semi-transparent borders.

Naming Rule: Ensure the presentation name is catchy (e.g., "WealthSync Portfolio HUD").`,
      themeName: 'modern_dark',
      requestedSlideCount: 2
    };
    const result = await run(input);
    
    console.log('Pipeline execution successful.');
    console.log(`Generated ${result.slides.length} slides.`);
    
    const outputDir = path.resolve('scripts/results');
    await fs.mkdir(outputDir, { recursive: true });
    
    const outputPath = path.join(outputDir, 'global-output.json');
    await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
    
    console.log(`Result saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('Pipeline failed:', error);
  }
}

testFullGlobalPipeline();
