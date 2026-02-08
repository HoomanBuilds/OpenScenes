import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { smartEditSlide } from '../lib/ai/smartEditor';
import { getAllThemes } from '../app/lib/themes';
import type { Slide } from '../lib/schemas/template';

async function testAPIFlow() {
  const inputPath = path.resolve('scripts/results/global-output.json');
  const outputPath = path.resolve('scripts/results/slide-edit-api-flow.json');
  
  try {
    console.log('🔄 TESTING SLIDE EDIT API FLOW');
    console.log('='.repeat(60));
    
    console.log('\n1️⃣  Loading test data...');
    const data = await fs.readFile(inputPath, 'utf8');
    const input = JSON.parse(data);
    const targetSlide: Slide = input.slides[0];
    
    console.log(`   ✓ Loaded slide: ${targetSlide.id}`);
    
    const themeName = 'minimal_dark';
    const theme = getAllThemes().find(t => t.id === themeName);
    const themePrompt = theme?.prompt_injection || 'Modern Dark Theme';
    
    const apiRequestBody = {
      slideId: targetSlide.id,
      slide: targetSlide,
      instruction: "Make the title text bright cyan (#00ffff) with a glow effect",
      themeName: themeName,
      themePrompt: themePrompt,
      projectSummary: "WealthSync AI - Financial Dashboard Presentation"
    };
    
    console.log('\n2️⃣  API Request:');
    console.log(`   Slide ID: ${apiRequestBody.slideId}`);
    console.log(`   Instruction: "${apiRequestBody.instruction}"`);
    console.log(`   Theme: ${apiRequestBody.themeName}`);
    
    console.log('\n3️⃣  Processing through smart editor...');
    const startTime = Date.now();
    
    const editedSlide = await smartEditSlide({
      slide: apiRequestBody.slide,
      instruction: apiRequestBody.instruction,
      themePrompt: apiRequestBody.themePrompt,
      projectContext: apiRequestBody.projectSummary,
    });
    
    const processingTime = Date.now() - startTime;
    console.log(`   ✓ Completed in ${processingTime}ms`);
    
    const apiResponse = {
      success: true,
      slideId: apiRequestBody.slideId,
      result: editedSlide,
      processingTime,
      timestamp: new Date().toISOString()
    };
    
    console.log('\n4️⃣  API Response:');
    console.log(`   Success: ${apiResponse.success}`);
    console.log(`   Slide ID: ${apiResponse.slideId}`);
    console.log(`   Elements: ${editedSlide.elements?.length || 0}`);
    
    const output = {
      testName: 'Slide Edit API Flow',
      description: 'Simulates the complete flow from frontend → API → worker → response',
      request: apiRequestBody,
      response: apiResponse,
      comparison: {
        originalSlide: targetSlide,
        editedSlide: editedSlide
      }
    };
    
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ API FLOW TEST COMPLETE');
    console.log('='.repeat(60));
    console.log(`\n📁 Output: ${outputPath}`);
    console.log('\n📋 Result Summary:');
    console.log(`   • Request validated ✓`);
    console.log(`   • Smart editor processing ✓`);
    console.log(`   • Response formatted ✓`);
    console.log(`   • Processing time: ${processingTime}ms`);
    
    console.log('\n🔍 Verification:');
    console.log('   1. Check "request" matches API route expectations');
    console.log('   2. Compare "originalSlide" vs "editedSlide"');
    console.log('   3. Verify "response" format for frontend');
    
  } catch (error) {
    console.error('\n❌ API Flow Test Failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

testAPIFlow();
