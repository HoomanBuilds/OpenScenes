import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { smartEditSlide } from '../lib/ai/smartEditor';
import type { Slide } from '../lib/schemas/template';

interface TestScenario {
  name: string;
  instruction: string;
  description: string;
}

const TEST_SCENARIOS: TestScenario[] = [
  {
    name: 'content-edit',
    instruction: 'Change the main title text to "Next-Gen Financial Intelligence"',
    description: 'Simple content/text modification'
  },
  {
    name: 'style-edit',
    instruction: 'Make all text colors bright cyan (#00ffff) with a subtle glow effect',
    description: 'Style changes - colors and visual effects'
  },
  {
    name: 'animation-edit',
    instruction: 'Add a fade-in animation with 0.5s delay to the title',
    description: 'Animation modifications'
  },
  {
    name: 'background-edit',
    instruction: 'Change the background to a dark purple gradient (#1a0033 to #000019)',
    description: 'Background modification'
  },
  {
    name: 'complex-edit',
    instruction: 'Make the title larger, change it to gradient blue-to-purple, add a pulse animation, and increase slide duration to 8 seconds',
    description: 'Multiple changes across different properties'
  }
];

async function testSlideEditScenarios() {
  const inputPath = path.resolve('scripts/results/global-output.json');
  const outputDir = path.resolve('scripts/results/slide-edit-scenarios');
  
  try {
    console.log('='.repeat(60));
    console.log('🧪 SLIDE EDIT PIPELINE - SCENARIO TESTING');
    console.log('='.repeat(60));
    
    console.log('\n--- LOADING INPUT DATA ---');
    const data = await fs.readFile(inputPath, 'utf8');
    const input = JSON.parse(data);
    
    const targetSlide: Slide = input.slides[0];
    console.log(`✓ Loaded test slide: ${targetSlide.id}`);
    console.log(`  Type: ${targetSlide.type}, Duration: ${targetSlide.duration}ms`);
    console.log(`  Elements: ${targetSlide.elements?.length || 0}`);
    
    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });
    
    const results = [];
    
    // Run each scenario
    for (let i = 0; i < TEST_SCENARIOS.length; i++) {
      const scenario = TEST_SCENARIOS[i];
      
      console.log('\n' + '-'.repeat(60));
      console.log(`📝 TEST ${i + 1}/${TEST_SCENARIOS.length}: ${scenario.name.toUpperCase()}`);
      console.log('-'.repeat(60));
      console.log(`Description: ${scenario.description}`);
      console.log(`Instruction: "${scenario.instruction}"`);
      console.log('\n⏳ Processing...');
      
      const startTime = Date.now();
      
      try {
        const request = {
          slide: targetSlide,
          instruction: scenario.instruction,
          themePrompt: "Deep Blue Modern Theme",
          projectContext: "WealthSync AI HUD - Financial Dashboard Presentation"
        };
        
        const result = await smartEditSlide(request);
        const duration = Date.now() - startTime;
        
        console.log(`✅ Success in ${duration}ms`);
        console.log(`   Elements: ${result.elements?.length || 0}`);
        console.log(`   Duration: ${result.duration}ms`);
        
        // Save individual result
        const output = {
          scenario: scenario.name,
          description: scenario.description,
          instruction: scenario.instruction,
          original: targetSlide,
          edited: result,
          processingTime: duration,
          timestamp: new Date().toISOString()
        };
        
        const filename = `${scenario.name}.json`;
        await fs.writeFile(
          path.join(outputDir, filename),
          JSON.stringify(output, null, 2)
        );
        
        results.push({
          scenario: scenario.name,
          success: true,
          duration,
          outputFile: filename
        });
        
      } catch (error) {
        const duration = Date.now() - startTime;
        console.log(`❌ Failed in ${duration}ms`);
        console.error(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        results.push({
          scenario: scenario.name,
          success: false,
          duration,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Create summary report
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / totalCount;
    
    console.log(`\nResults: ${successCount}/${totalCount} passed`);
    console.log(`Average processing time: ${avgDuration.toFixed(0)}ms`);
    console.log('\nDetailed Results:');
    
    results.forEach((result, i) => {
      const icon = result.success ? '✅' : '❌';
      const status = result.success ? 'PASS' : 'FAIL';
      console.log(`  ${icon} ${i + 1}. ${result.scenario.padEnd(20)} ${status.padEnd(8)} ${result.duration}ms`);
      if (!result.success && result.error) {
        console.log(`     Error: ${result.error}`);
      }
    });
    
    // Save summary
    const summary = {
      totalTests: totalCount,
      passed: successCount,
      failed: totalCount - successCount,
      averageDuration: avgDuration,
      results,
      timestamp: new Date().toISOString()
    };
    
    await fs.writeFile(
      path.join(outputDir, '_summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    console.log(`\n📁 Output directory: ${outputDir}`);
    console.log('\nFiles created:');
    console.log('  - _summary.json (test summary)');
    results.filter(r => r.success).forEach(r => {
      console.log(`  - ${r.outputFile}`);
    });
    
    if (successCount === totalCount) {
      console.log('\n🎉 All tests passed!');
    } else {
      console.log(`\n⚠️  ${totalCount - successCount} test(s) failed`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

testSlideEditScenarios();
