import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const logFile = path.join(process.cwd(), 'test-results.txt');
fs.writeFileSync(logFile, ''); // Clear file

function log(message: string) {
  console.log(message);
  fs.appendFileSync(logFile, message + '\n');
}

async function testGoogleGenAI(modelId: string) {
  log(`\n--- Testing @google/genai SDK with model: ${modelId} ---`);
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    log('⚠️ Skipping: GOOGLE_GENERATIVE_AI_API_KEY not found in env.');
    return false;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
    const response = await ai.models.generateContent({
      model: modelId,
      contents: "Hello, check.",
    });
    
    log('✅ Success!');
    log('Response: ' + response.text);
    return true;
  } catch (error: any) {
    log('❌ Failed.');
    log('Error: ' + error.message);
    return false;
  }
}

async function main() {
  const modelsToTest = [
    'gemini-3-flash-preview',
    'gemini-2.0-flash-exp'
  ];

  log('Starting AI Model Availability Test...');
  log(`Project: ${process.env.GOOGLE_CLOUD_PROJECT}`);
  
  for (const model of modelsToTest) {
    await testGoogleGenAI(model);
  }
}

main().catch((err) => log(err));

