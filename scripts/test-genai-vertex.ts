import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

process.env.GOOGLE_CLOUD_LOCATION = "global"; 

dotenv.config();

const logFile = path.join(process.cwd(), 'test-vertex-genai-results.txt');
fs.writeFileSync(logFile, '');

function log(message: string) {
  console.log(message);
  fs.appendFileSync(logFile, message + '\n');
}

async function generateContentFromVertexAI(modelId: string) {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION;
  
  log(`\n--- Testing Vertex AI (${location}) with model: ${modelId} ---`);
  log(`Using credentials: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);

  try {
    const ai = new GoogleGenAI({
      vertexai: true,
      project: project,
      location: location,
    });
    
    const response = await ai.models.generateContent({
      model: modelId,
      contents: 'Hello, verify Vertex AI access.',
    });
    
    log('✅ Success!');
    log('Response: ' + response.text);
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
  log('Starting Vertex AI Test with @google/genai (Global Location)...');
  await generateContentFromVertexAI('gemini-3-flash-preview');

  await generateContentFromVertexAI('gemini-3-pro-preview');
}

main().catch((err) => log(err));
