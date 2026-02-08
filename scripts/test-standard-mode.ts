import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { run } from '../lib/ai/pipeline';

async function testStandardMode() {
  const query = "Provide a high-level summary of the benefits of Green Leafy Vegetables. Define what they are, and then list the top 3 vitamins they provide.";
  console.log(`--- TESTING STANDARD MODE ---`);
  console.log(`Prompt: "${query}"`);

  try {
    const result = await run({
      jobId: 'test-standard-vegetables',
      userQuery: query,
      themeName: 'modern_dark'
    });

    console.log('\n--- GENERATION COMPLETE ---');
    console.log(`Slides Generated: ${result.slides.length}`);
    
    // Check if any slide is "default" or "standard" vs "custom"
    result.slides.forEach((slide, i) => {
      const isCustomElement = slide.elements.some(el => el.type === 'custom');
      console.log(`Slide ${i+1} (${slide.id}): ${isCustomElement ? 'CUSTOM MODULE' : 'STANDARD ELEMENTS'}`);
    });

    const outputPath = path.resolve('scripts/results/standard-test-output.json');
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
    
    console.log(`\nFull JSON results saved to: ${outputPath}`);

  } catch (error) {
    console.error('Standard Mode Test failed:', error);
  }
}

testStandardMode();
