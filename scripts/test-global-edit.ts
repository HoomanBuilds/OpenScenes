import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { smartEditPresentation } from '../lib/ai/smartEditor';

async function testGlobalEdit() {
  const inputPath = path.resolve('scripts/results/global-output.json');
  const outputPath = path.resolve('scripts/results/patch-output.json');
  
  try {
    console.log('--- LOADING INPUT DATA ---');
    const data = await fs.readFile(inputPath, 'utf8');
    const input = JSON.parse(data);
    
    const request = {
      existingSlides: input.slides,
      instruction: "Change all headline colors to blue and all backgrounds to #000033.",
      themePrompt: "Deep Blue Modern Theme",
      projectContext: "WealthSync AI HUD"
    };
    
    console.log('\n--- STARTING GLOBAL EDIT PIPELINE ---');
    console.log(`Instruction: "${request.instruction}"`);
    console.log(`Processing ${input.slides.length} slides...`);
    
    const result = await smartEditPresentation(request);
    
    console.log('\n--- EDIT COMPLETE ---');
    console.log(`Summary: ${result.summary}`);
    console.log(`Scope: ${result.isGlobal ? 'GLOBAL' : 'LOCAL'}`);
    console.log(`Affected Slide IDs: ${result.affectedSlideIds.join(', ')}`);
    
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
    
    console.log(`\nPatched output saved to: ${outputPath}`);
    console.log('Verification: Check the "patches" field in smartEditor.ts logs above to see generated dot-notation.');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testGlobalEdit();
