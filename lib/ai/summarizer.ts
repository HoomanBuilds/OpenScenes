import { z } from 'zod';
import { aiGenerateStructured, estimateTokens } from './adapter';
import { AI_LIMITS } from './config';
import { logger } from './logger';
import type { SummarizerInput, SummarizerOutput } from './types';

const SummarizerOutputSchema = z.object({
  topic: z.string().describe('Main topic in 5 words or less'),
  intent: z.enum([
    'product_launch', 
    'educational', 
    'pitch_deck', 
    'report', 
    'showcase', 
    'explainer',
    'general'
  ]).describe('Detected presentation intent'),
  summary: z.string().describe('Condensed summary of the content'),
  keyPoints: z.array(z.object({
    priority: z.number().min(1).max(10),
    point: z.string(),
    details: z.string().optional(),
  })).describe('Prioritized key points'),
  entities: z.object({
    productName: z.string().optional(),
    companyName: z.string().optional(),
    tagline: z.string().optional(),
    metrics: z.array(z.object({
      label: z.string(),
      value: z.string(),
    })).optional(),
    features: z.array(z.string()).optional(),
    cta: z.string().optional(),
    urls: z.array(z.string()).optional(),
  }).describe('Extracted entities'),
  tone: z.enum(['professional', 'playful', 'bold', 'minimal', 'corporate']),
  suggestedSlideCount: z.number().min(1).max(12),
  contentDensity: z.enum(['sparse', 'balanced', 'dense']),
});

const SUMMARIZER_SYSTEM_PROMPT = `You are the CONTENT ANALYST for OpenScenes, an AI video presentation generator.

## YOUR ROLE
You receive raw user content and extract ONLY the information relevant for creating a video presentation. You are ruthless about removing fluff, boilerplate, and noise.

## INPUT TYPES YOU WILL RECEIVE
- <user_text_context>: Raw text prompt from user
- <user_file_context>: Content from uploaded files (markdown, PDF text, etc.)
- <user_url_context>: Scraped content from URLs

## RULES
1. Extract ONLY factual, usable content. No opinions or interpretations.
2. Prioritize: Headlines > Stats > Features > Details > Filler
3. If content is vague, mark content_density: "sparse" and reduce suggestedSlideCount.
4. Never fabricate information. If something is missing, omit the field.
5. Keep keyPoints to max 8 items, ordered by priority.
6. The summary should be 2-4 sentences max.
7. suggestedSlideCount should be between 4-12 based on content density.`;


export function needsSummarization(input: SummarizerInput): boolean {
  const totalContent = [
    input.userQuery || '',
    input.fileContent || '',
    input.urlContent || '',
  ].join(' ');
  
  return totalContent.length > AI_LIMITS.SUMMARIZE_THRESHOLD_CHARS;
}

function buildSummarizerPrompt(input: SummarizerInput): string {
  const parts: string[] = [];
  
  parts.push('Analyze the following content and extract presentation-ready information.');
  parts.push('');
  
  if (input.userQuery) {
    parts.push('### USER TEXT PROMPT ###');
    parts.push(input.userQuery);
    parts.push('### END USER TEXT PROMPT ###');
    parts.push('');
  }
  
  if (input.fileContent) {
    parts.push('### UPLOADED FILE CONTENT ###');
    parts.push(input.fileContent);
    parts.push('### END UPLOADED FILE CONTENT ###');
    parts.push('');
  }
  
  if (input.urlContent) {
    parts.push('### URL SCRAPED CONTENT ###');
    parts.push(input.urlContent);
    parts.push('### END URL SCRAPED CONTENT ###');
    parts.push('');
  }
  
  parts.push('Extract the key information now.');
  
  return parts.join('\n');
}

export function createMinimalSummary(input: SummarizerInput): SummarizerOutput {
  const query = input.userQuery || 'Presentation';
  
  const words = query.split(/\s+/);
  const topic = words.slice(0, 20).join(' '); // Increased from 10 to 20
  
  const slideCountMatch = query.match(/(\d+)\s+slide[s]?/i);
  const suggestedSlideCount = slideCountMatch ? Math.min(parseInt(slideCountMatch[1]), AI_LIMITS.MAX_SLIDES) : 6;
  
  return {
    topic,
    intent: 'general',
    summary: query,
    keyPoints: [{
      priority: 1,
      point: query,
    }],
    entities: {},
    tone: 'professional',
    suggestedSlideCount,
    contentDensity: 'sparse',
  };
}

export async function summarizeContent(
  input: SummarizerInput,
  forceRun: boolean = false
): Promise<SummarizerOutput> {
  if (!forceRun && !needsSummarization(input)) {
    console.log('[Summarizer] Content below threshold, using minimal summary');
    return createMinimalSummary(input);
  }
  
  console.log('[Summarizer] Running content summarization...');
  
  const prompt = buildSummarizerPrompt(input);
  
  const estimatedTokens = estimateTokens(prompt);
  console.log(`[Summarizer] Input tokens (est): ${estimatedTokens}`);
  
  if (input.jobId) {
    await logger.debug.prompt(input.jobId, '1-summarizer', prompt);
  }
  
  try {
    const result = await aiGenerateStructured({
      model: 'cheap',
      schema: SummarizerOutputSchema,
      schemaName: 'SummarizerOutput',
      schemaDescription: 'Structured summary of presentation content',
      systemPrompt: SUMMARIZER_SYSTEM_PROMPT,
      prompt,
      agentType: 'summarizer',
    });
    
    console.log(`[Summarizer] Extracted topic: "${result.topic}", intent: ${result.intent}`);
    console.log(`[Summarizer] Key points: ${result.keyPoints.length}, suggested slides: ${result.suggestedSlideCount}`);
    
    return result;
  } catch (error) {
    console.error('[Summarizer] Error during summarization:', error);
    return createMinimalSummary(input);
  }
}

export function formatSummaryForPrompt(summary: SummarizerOutput): string {
  const parts: string[] = [];
  
  parts.push(`Topic: ${summary.topic}`);
  parts.push(`Intent: ${summary.intent}`);
  parts.push(`Tone: ${summary.tone}`);
  parts.push(`Content Density: ${summary.contentDensity}`);
  parts.push('');
  parts.push(`Summary: ${summary.summary}`);
  parts.push('');
  parts.push('Key Points:');
  
  for (const kp of summary.keyPoints) {
    parts.push(`  ${kp.priority}. ${kp.point}`);
    if (kp.details) {
      parts.push(`     Details: ${kp.details}`);
    }
  }
  
  if (summary.entities.productName || summary.entities.companyName) {
    parts.push('');
    parts.push('Entities:');
    if (summary.entities.productName) {
      parts.push(`  Product: ${summary.entities.productName}`);
    }
    if (summary.entities.companyName) {
      parts.push(`  Company: ${summary.entities.companyName}`);
    }
    if (summary.entities.tagline) {
      parts.push(`  Tagline: ${summary.entities.tagline}`);
    }
  }
  
  if (summary.entities.metrics && summary.entities.metrics.length > 0) {
    parts.push('');
    parts.push('Metrics:');
    for (const m of summary.entities.metrics) {
      parts.push(`  - ${m.label}: ${m.value}`);
    }
  }
  
  if (summary.entities.features && summary.entities.features.length > 0) {
    parts.push('');
    parts.push('Features:');
    for (const f of summary.entities.features) {
      parts.push(`  - ${f}`);
    }
  }
  
  return parts.join('\n');
}
