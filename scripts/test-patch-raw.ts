import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { generatePatches } from '../lib/ai/smartEditor';
import { Slide } from '../lib/schemas/template';

async function testRawPatchOutput() {
  console.log('--- SMART PATCHER OUTPUT DEMO ---');

  const bigSlide: Slide = {
    id: "demo-slide",
    type: "custom",
    duration: 5000,
    background: { type: "color", value: "#000000" },
    elements: [
      {
        id: "hero-section",
        type: "custom",
        x: 0, y: 0, width: 1000, height: 562, zIndex: 10,
        content: {
          layout: {
            tag: "div",
            className: "p-8",
            children: [
              { tag: "h1", id: "title", text: "Old Heading XYZ" },
              { tag: "p", id: "body", text: "Some description text." }
            ]
          }
        } as any
      }
    ]
  };

  const instruction = "Change the title element 'Old Heading XYZ' to 'New Hero ZYX' and set the background to dark blue.";

  console.log(`\nInstruction: "${instruction}"`);
  console.log('Generating patches...');

  try {
    const result = await generatePatches(bigSlide, instruction, 'content');

    console.log('\n--- RAW AI OUTPUT (What the "Smart Patcher" generates) ---');
    console.log(JSON.stringify(result, null, 2));

    console.log('\n--- ANALYSIS ---');
    console.log('Notice how it uses dot-notation like:');
    console.log('1. "background.value" for top-level changes.');
    console.log('2. "elements.0.content.layout.children.0.text" for deep nested custom component changes.');

  } catch (error) {
    console.error('Patch generation failed:', error);
  }
}

testRawPatchOutput();
