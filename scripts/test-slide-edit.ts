import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { smartEditSlide } from '../lib/ai/smartEditor';
import type { Slide } from '../lib/schemas/template';

async function testSlideEdit() {
  const inputPath = path.resolve('scripts/results/global-output.json');
  const outputPath = path.resolve('scripts/results/slide-edit-output.json');
  
  try {
    console.log('--- LOADING INPUT DATA ---');
    const data = await fs.readFile(inputPath, 'utf8');
    const input = JSON.parse(data);
    
    const targetSlide: Slide = input.slides[0];
    
    console.log('\n--- TARGET SLIDE ---');
    console.log(`Slide ID: ${targetSlide.id}`);
    console.log(`Slide Type: ${targetSlide.type}`);
    console.log(`Duration: ${targetSlide.duration}ms`);
    console.log(`Elements: ${targetSlide.elements?.length || 0}`);
    
    const request = {
      slide: targetSlide,
      instruction: "Change the main title color to bright cyan (#00ffff) and add a subtle glow effect",
      themePrompt: "Deep Blue Modern Theme",
      projectContext: "WealthSync AI HUD - Financial Dashboard Presentation"
    };
    
    console.log('\n--- STARTING SLIDE EDIT PIPELINE ---');
    console.log(`Instruction: "${request.instruction}"`);
    console.log('Processing single slide...');
    
    const result = await smartEditSlide(request);
    
    console.log('\n--- EDIT COMPLETE ---');
    console.log(`Edited Slide ID: ${result.id}`);
    console.log(`Type: ${result.type}`);
    console.log(`Elements Modified: ${result.elements?.length || 0}`);
    
    // Prepare output with comparison
    const output = {
      instruction: request.instruction,
      original: targetSlide,
      edited: result,
      timestamp: new Date().toISOString()
    };
    
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
    
    console.log(`\n✅ Output saved to: ${outputPath}`);
    console.log('\nVerification:');
    console.log('- Check the "edited" field to see the modified slide');
    console.log('- Compare "original" vs "edited" to see the changes');
    console.log('- Look for patch operations in the logs above');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

testSlideEdit();
