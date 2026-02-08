import { createVertex } from '@ai-sdk/google-vertex';
import { generateText } from 'ai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const logFile = path.join(process.cwd(), 'test-vercel-vertex-results.txt');
fs.writeFileSync(logFile, '');

function log(message: string) {
  console.log(message);
  fs.appendFileSync(logFile, message + '\n');
}

async function testVercelVertex(modelId: string, location: string = 'global') {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  
  log(`\n--- Testing Vercel AI SDK (@ai-sdk/google-vertex) ---`);
  log(`Model: ${modelId}`);
  log(`Location: ${location}`);
  log(`Project: ${project}`);

  try {
    const vertex = createVertex({
      project: project,
      location: location,
    });
    
    const result = await generateText({
      model: vertex(modelId),
      prompt: 'Hello, verify Vercel AI SDK access.',
    });
    
    log('✅ Success!');
    log('Response: ' + result.text);
    return true;
  } catch (error: any) {
    log('❌ Failed.');
    log('Error: ' + error.message);
    if (error.response) {
       log('Full error response: ' + JSON.stringify(error.response, null, 2));
    }
    return false;
  }
}

async function main() {
  log('Starting Vercel AI SDK Vertex Test...');
  
  await testVercelVertex('gemini-3-flash-preview', 'global');

  await testVercelVertex('gemini-3-pro-preview', 'global');
}

main().catch((err) => log(err));
