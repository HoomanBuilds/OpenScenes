import { z } from 'zod';
import { aiGenerateStructured, estimateTokens, truncateToTokens } from './adapter';
import { AI_LIMITS, AI_MAX_TOKENS } from './config';
import { logger } from './logger';
import type { SummarizerInput, SummarizerOutput } from './types';

// ... (schema remains same)

/**
 * Evenly distributes token limits across multiple files.
 * If 4 files are provided and limit is 32k, each gets 8k.
 */
export function truncateFileContent(content: string, maxTokens: number): string {
    if (!content) return '';
    
    const fileMarkers = content.split('=== FILE: ');
    // The first segment might be empty if the string starts with the marker
    const files = fileMarkers.filter(f => f.trim().length > 0).map(f => '=== FILE: ' + f);
    
    if (files.length === 0) return truncateToTokens(content, maxTokens);
    
    const tokensPerFile = Math.floor(maxTokens / files.length);
    console.log(`[Summarizer] Truncating ${files.length} files to ~${tokensPerFile} tokens each (Total Limit: ${maxTokens})`);
    
    return files.map(f => truncateToTokens(f, tokensPerFile)).join('\n\n');
}

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
  detailedContent: z.string().describe('Detailed Markdown structure (500-1000 tokens) containing the core facts, data, and messaging for the presentation.'),
});

const SUMMARIZER_SYSTEM_PROMPT = `You are the DOCUMENT ANALYST for OpenScenes.
Your goal is to extract high-density, presentation-ready information from provides materials.

## YOUR ROLE
1. Identify key messaging, data points, and factual structure.
2. Ignore the user's "intent" (the Director handles that).
3. Extract the "Backbone" of the content.

## OUTPUT REQUIREMENTS
- topic: 5 words or less.
- summary: 2-3 sentence overview.
- detailedContent: This is the MOST IMPORTANT field. Provide a structured Markdown document (500-1000 tokens) containing the core facts, technical details, statistics, and narrative pillars. This will be used as the primary source for building slide content.
- keyPoints: Prioritized list of takeaways.

## RULES
1. Focus ONLY on the <user_file_context> and <user_url_context>.
2. Be concise but detailed where it matters.
3. Remove boilerplate, legal text, and navigation links.`;

export function needsSummarization(input: SummarizerInput): boolean {
  const totalContent = [
    input.fileContent || '',
    input.urlContent || '',
  ].join(' ');
  
  return totalContent.length > AI_LIMITS.SUMMARIZE_THRESHOLD_CHARS;
}

function buildSummarizerPrompt(input: SummarizerInput): string {
  const parts: string[] = [];
  
  parts.push('Extract presentation-ready information from the following reference materials.');
  parts.push('IMPORTANT: Ignore the user prompt intent, only summarize the factual content below.');
  parts.push('');
  
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
  
  parts.push('Summarize these documents now.');
  
  return parts.join('\n');
}

export function createMinimalSummary(input: SummarizerInput): SummarizerOutput {
  const query = input.userQuery || 'Presentation';
  
  const words = query.split(/\s+/);
  const topic = words.slice(0, 20).join(' '); 
  
  const slideCountMatch = query.match(/(\d+)[\s-]*slide[s]?/i);
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
    detailedContent: query,
  };
}

export async function summarizeContent(
  input: SummarizerInput,
  forceRun: boolean = false
): Promise<SummarizerOutput> {
  const hasReference = !!(input.fileContent || input.urlContent);
  
  if (!forceRun && (!hasReference || !needsSummarization(input))) {
    return createMinimalSummary(input);
  }

  // TRUNCATE files if they exceed limits
  const truncatedFiles = input.fileContent ? truncateFileContent(input.fileContent, AI_MAX_TOKENS.summarizer.input / 2) : '';
  const truncatedUrls = input.urlContent ? truncateToTokens(input.urlContent, AI_MAX_TOKENS.summarizer.input / 2) : '';
  
  const prompt = buildSummarizerPrompt({
      ...input,
      fileContent: truncatedFiles,
      urlContent: truncatedUrls
  });
  
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

  parts.push('');
  parts.push(`Requested Slide Count: ${summary.suggestedSlideCount}`);
  
  return parts.join('\n');
}
