import { createVertex } from '@ai-sdk/google-vertex';
import { generateText, generateObject, experimental_generateImage } from 'ai';
import { z } from 'zod';
import { AI_MODELS, AI_TEMPERATURES, AI_MAX_TOKENS, AI_IMAGE_CONFIG, ModelAlias } from './config';
import { getTelemetryConfig } from './tracing';
import { logAICall, AICallRecord } from '../db/ai-calls';
import { logger } from './logger';

let _vertexDefault: any = null;
const getVertexDefault = () => {
  if (!_vertexDefault) {
    const project = process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    logger.adapter.init(project || 'not set', location);
    _vertexDefault = createVertex({ project, location });
  }
  return _vertexDefault;
};

let _vertexGlobal: any = null;
const getVertexGlobal = () => {
  if (!_vertexGlobal) {
    _vertexGlobal = createVertex({ project: process.env.GOOGLE_CLOUD_PROJECT, location: 'global' });
  }
  return _vertexGlobal;
};

const getModel = (modelId: string) => {
  return (modelId.includes('gemini-3') ? getVertexGlobal() : getVertexDefault())(modelId);
};

let currentJobId: string | undefined;
let currentTraceId: string | undefined;

export const setJobContext = (jobId?: string, traceId?: string) => { currentJobId = jobId; currentTraceId = traceId; };
export const clearJobContext = () => { currentJobId = undefined; currentTraceId = undefined; };

async function logCall(record: Omit<AICallRecord, 'jobId' | 'traceId'>) {
  try {
    await logAICall({ ...record, jobId: currentJobId, traceId: currentTraceId });
    } catch (e) {
        // Silently fail logging to avoid cluttering test output
    }
}

const resolveModel = (m: ModelAlias) => AI_MODELS[m];
const getTemperature = (t: keyof typeof AI_TEMPERATURES) => AI_TEMPERATURES[t];
const cleanJSON = (text: string) => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  return cleaned.trim();
};

export interface GenerateTextOptions {
  model: ModelAlias;
  systemPrompt?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  agentType?: keyof typeof AI_TEMPERATURES;
}

export async function aiGenerateText(options: GenerateTextOptions): Promise<string> {
  const { model, systemPrompt, prompt, temperature, maxTokens, agentType } = options;
  const modelId = resolveModel(model);
  const startTime = Date.now();
  
  try {
    const result = await generateText({
      model: getModel(modelId),
      system: systemPrompt,
      prompt,
      temperature: temperature ?? (agentType ? getTemperature(agentType) : 0.5),
      maxOutputTokens: maxTokens ?? (agentType ? AI_MAX_TOKENS[agentType].output : 4000),
      experimental_telemetry: getTelemetryConfig(`${agentType || 'text'}-generate`),
    });

    await logCall({
      agentType: agentType || 'text',
      model: modelId,
      operation: 'generate_text',
      inputTokens: (result.usage as any)?.promptTokens,
      outputTokens: (result.usage as any)?.completionTokens,
      totalTokens: (result.usage as any)?.totalTokens,
      latencyMs: Date.now() - startTime,
      status: 'success',
    });
    
    return result.text;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    await logCall({
      agentType: agentType || 'text',
      model: modelId,
      operation: 'generate_text',
      latencyMs: Date.now() - startTime,
      status: 'error',
      error: errorMsg,
    });
    throw err;
  }
}

export interface GenerateStructuredOptions<T> {
  model: ModelAlias;
  schema: z.ZodType<T>;
  schemaName?: string;
  schemaDescription?: string;
  systemPrompt?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  agentType?: keyof typeof AI_TEMPERATURES;
}

export async function aiGenerateStructured<T>(options: GenerateStructuredOptions<T>): Promise<T> {
  const { model, schema, schemaName, schemaDescription, systemPrompt, prompt, temperature, maxTokens, agentType } = options;
  const modelId = resolveModel(model);
  const startTime = Date.now();
  // console.log(`[Adapter] Generating structured object with model: ${modelId}`);

  try {
    const result = await generateObject({
      model: getModel(modelId),
      schema,
      schemaName,
      schemaDescription,
      system: systemPrompt,
      prompt,
      temperature: temperature ?? (agentType ? getTemperature(agentType) : 0.5),
      maxTokens: maxTokens ?? (agentType ? AI_MAX_TOKENS[agentType].output : 4000),
      experimental_telemetry: getTelemetryConfig(`${agentType || 'structured'}-generate`),
      providerOptions: {
        google: {
          structuredOutputs: false,
        },
      },
    });
    
    await logCall({
      agentType: agentType || 'structured',
      model: modelId,
      operation: 'generate_structured',
      inputTokens: (result.usage as any)?.promptTokens,
      outputTokens: (result.usage as any)?.completionTokens,
      totalTokens: (result.usage as any)?.totalTokens,
      latencyMs: Date.now() - startTime,
      status: 'success',
    });
    
    return result.object;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    await logCall({
      agentType: agentType || 'structured',
      model: modelId,
      operation: 'generate_structured',
      latencyMs: Date.now() - startTime,
      status: 'error',
      error: errorMsg,
    });
    throw err;
  }
}

export interface GenerateJSONOptions {
  model: ModelAlias;
  systemPrompt?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  agentType?: keyof typeof AI_TEMPERATURES;
}

export async function aiGenerateJSON(options: GenerateJSONOptions): Promise<unknown> {
  const { systemPrompt, ...rest } = options;
  const text = await aiGenerateText({
    ...rest,
    systemPrompt: (systemPrompt ? `${systemPrompt}\n\n` : '') + 'Output ONLY valid JSON. No markdown.',
  });
  
  try {
    return JSON.parse(cleanJSON(text));
  } catch (error) {
    throw new Error(`Failed to parse AI JSON response: ${error instanceof Error ? error.message : 'Unknown error'}\n\nRaw response:\n${text.slice(0, 500)}`);
  }
}

export interface GenerateImageOptions {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  agentType?: string;
}

export async function aiGenerateImage(options: GenerateImageOptions): Promise<string | null> {
  if (!AI_IMAGE_CONFIG.enabled()) return null;

  const { prompt, aspectRatio, agentType } = options;
  const startTime = Date.now();

  try {
    const result = await experimental_generateImage({
      model: getVertexDefault().image(AI_IMAGE_CONFIG.model),
      prompt,
      providerOptions: { vertex: { aspectRatio: aspectRatio || '16:9' } },
    });

    await logAICall({
      agentType: agentType || 'image',
      model: AI_IMAGE_CONFIG.model,
      operation: 'generate_image',
      latencyMs: Date.now() - startTime,
      status: 'success',
      metadata: { prompt: prompt.slice(0, 200), aspectRatio },
    });

    return result.image?.base64 ? `data:image/png;base64,${result.image.base64}` : null;
  } catch (err) {
    await logAICall({
      agentType: agentType || 'image',
      model: AI_IMAGE_CONFIG.model,
      operation: 'generate_image',
      latencyMs: Date.now() - startTime,
      status: 'error',
      error: err instanceof Error ? err.message : 'Unknown error',
      metadata: { prompt: prompt.slice(0, 200) },
    });
    return null;
  }
}

export const isVertexConfigured = () => !!(process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_APPLICATION_CREDENTIALS);
export const getVertexConfig = () => ({ project: process.env.GOOGLE_CLOUD_PROJECT, location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1' });
export const estimateTokens = (text: string) => Math.ceil(text.length / 4);
export const exceedsTokenLimit = (text: string, type: keyof typeof AI_MAX_TOKENS) => estimateTokens(text) > AI_MAX_TOKENS[type].input;
