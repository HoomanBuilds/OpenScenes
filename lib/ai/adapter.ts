import { createVertex } from '@ai-sdk/google-vertex';
import { generateText, generateObject, experimental_generateImage } from 'ai';
import { z } from 'zod';
import { AI_MODELS, AI_TEMPERATURES, AI_MAX_TOKENS, AI_IMAGE_CONFIG, ModelAlias } from './config';
import { getTelemetryConfig } from './tracing';
import { logAICall, AICallRecord } from '../db/ai-calls';
import { logger } from './logger';

let _vertex: ReturnType<typeof createVertex> | null = null;

function getVertex() {
  if (!_vertex) {
    const project = process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    
    logger.adapter.init(project || 'not set', location);
    
    _vertex = createVertex({ project, location });
  }
  return _vertex;
}

let currentJobId: string | undefined;
let currentTraceId: string | undefined;

export function setJobContext(jobId?: string, traceId?: string): void {
  currentJobId = jobId;
  currentTraceId = traceId;
}

export function clearJobContext(): void {
  currentJobId = undefined;
  currentTraceId = undefined;
}

function resolveModel(modelAlias: ModelAlias): string {
  return AI_MODELS[modelAlias];
}

function getTemperature(agentType: keyof typeof AI_TEMPERATURES): number {
  return AI_TEMPERATURES[agentType];
}

function cleanJSONResponse(text: string): string {
  let cleaned = text.trim();
  
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  
  return cleaned.trim();
}

async function logCall(record: Omit<AICallRecord, 'jobId' | 'traceId'>): Promise<void> {
  try {
    await logAICall({
      ...record,
      jobId: currentJobId,
      traceId: currentTraceId,
    });
  } catch (error) {
    console.warn('[Adapter] Failed to log AI call:', error);
  }
}

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
  const temp = temperature ?? (agentType ? getTemperature(agentType) : 0.5);
  const tokens = maxTokens ?? (agentType ? AI_MAX_TOKENS[agentType].output : 4000);
  
  const startTime = Date.now();
  let status: 'success' | 'error' = 'success';
  let error: string | undefined;
  
  try {
    const result = await generateText({
      model: getVertex()(modelId),
      system: systemPrompt,
      prompt: prompt,
      temperature: temp,
      maxOutputTokens: tokens,
      experimental_telemetry: getTelemetryConfig(`${agentType || 'text'}-generate`),
    });
    
    const latencyMs = Date.now() - startTime;
    
    await logCall({
      agentType: agentType || 'text',
      model: modelId,
      operation: 'generate_text',
      inputTokens: (result.usage as unknown as { promptTokens?: number })?.promptTokens,
      outputTokens: (result.usage as unknown as { completionTokens?: number })?.completionTokens,
      totalTokens: result.usage?.totalTokens,
      latencyMs,
      status: 'success',
    });
    
    return result.text;
  } catch (err) {
    status = 'error';
    error = err instanceof Error ? err.message : 'Unknown error';
    
    await logCall({
      agentType: agentType || 'text',
      model: modelId,
      operation: 'generate_text',
      latencyMs: Date.now() - startTime,
      status: 'error',
      error,
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

export async function aiGenerateStructured<T>(
  options: GenerateStructuredOptions<T>
): Promise<T> {
  const { 
    model, 
    schema, 
    schemaName,
    schemaDescription,
    systemPrompt, 
    prompt, 
    temperature, 
    maxTokens, 
    agentType 
  } = options;
  
  const modelId = resolveModel(model);
  const temp = temperature ?? (agentType ? getTemperature(agentType) : 0.5);
  const tokens = maxTokens ?? (agentType ? AI_MAX_TOKENS[agentType].output : 4000);
  
  const startTime = Date.now();
  
  try {
    const result = await generateObject({
      model: getVertex()(modelId),
      schema: schema,
      schemaName: schemaName,
      schemaDescription: schemaDescription,
      system: systemPrompt,
      prompt: prompt,
      temperature: temp,
      maxTokens: tokens,
      experimental_telemetry: getTelemetryConfig(`${agentType || 'structured'}-generate`),
    });
    
    await logCall({
      agentType: agentType || 'structured',
      model: modelId,
      operation: 'generate_structured',
      inputTokens: (result.usage as unknown as { promptTokens?: number })?.promptTokens,
      outputTokens: (result.usage as unknown as { completionTokens?: number })?.completionTokens,
      totalTokens: result.usage?.totalTokens,
      latencyMs: Date.now() - startTime,
      status: 'success',
    });
    
    return result.object;
  } catch (err) {
    await logCall({
      agentType: agentType || 'structured',
      model: modelId,
      operation: 'generate_structured',
      latencyMs: Date.now() - startTime,
      status: 'error',
      error: err instanceof Error ? err.message : 'Unknown error',
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
  const { model, systemPrompt, prompt, temperature, maxTokens, agentType } = options;
  
  const jsonSystemPrompt = systemPrompt 
    ? `${systemPrompt}\n\nIMPORTANT: Output ONLY valid JSON. No markdown, no explanations.`
    : 'Output ONLY valid JSON. No markdown, no explanations.';
  
  const text = await aiGenerateText({
    model,
    systemPrompt: jsonSystemPrompt,
    prompt,
    temperature,
    maxTokens,
    agentType,
  });
  
  const cleaned = cleanJSONResponse(text);
  
  try {
    return JSON.parse(cleaned);
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
  if (!AI_IMAGE_CONFIG.enabled()) {
    return null;
  }

  const { prompt, aspectRatio } = options;
  const startTime = Date.now();

  try {
    const vertex = getVertex();
    const result = await experimental_generateImage({
      model: vertex.image(AI_IMAGE_CONFIG.model),
      prompt,
      providerOptions: {
        vertex: {
          aspectRatio: aspectRatio || '16:9',
        },
      },
    });

    await logAICall({
      agentType: options.agentType || 'image',
      model: AI_IMAGE_CONFIG.model,
      operation: 'generate_image',
      latencyMs: Date.now() - startTime,
      status: 'success',
      metadata: { prompt: prompt.slice(0, 200), aspectRatio },
    });

    if (result.image?.base64) {
      return `data:image/png;base64,${result.image.base64}`;
    }

    return null;
  } catch (err) {
    await logAICall({
      agentType: options.agentType || 'image',
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

export function isVertexConfigured(): boolean {
  return !!(process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_APPLICATION_CREDENTIALS);
}

export function getVertexConfig(): { project: string | undefined; location: string } {
  return {
    project: process.env.GOOGLE_CLOUD_PROJECT,
    location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
  };
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function exceedsTokenLimit(
  text: string, 
  agentType: keyof typeof AI_MAX_TOKENS
): boolean {
  const estimated = estimateTokens(text);
  return estimated > AI_MAX_TOKENS[agentType].input;
}
