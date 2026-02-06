import { AI_LIMITS } from './config';
import { aiGenerateImage, isVertexConfigured } from './adapter';
import type { 
  AssetDirective, 
  AssetGeneratorInput, 
  AssetGeneratorOutput,
  GeneratedAsset,
} from './types';

const PLACEHOLDER_IMAGES = {
  product: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800',
  person: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
  office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
  technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
  nature: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
  abstract: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800',
  chart: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
  team: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
  default: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
};

const KEYWORD_MAPPING: Record<string, keyof typeof PLACEHOLDER_IMAGES> = {
  product: 'product',
  app: 'product',
  software: 'product',
  device: 'product',

  person: 'person',
  user: 'person',
  customer: 'person',
  people: 'person',
  portrait: 'person',
  
  office: 'office',
  workplace: 'office',
  meeting: 'office',
  business: 'office',
  
  tech: 'technology',
  technology: 'technology',
  computer: 'technology',
  code: 'technology',
  digital: 'technology',
  
  nature: 'nature',
  landscape: 'nature',
  outdoor: 'nature',
  forest: 'nature',
  
  abstract: 'abstract',
  pattern: 'abstract',
  background: 'abstract',
  gradient: 'abstract',
  
  chart: 'chart',
  graph: 'chart',
  data: 'chart',
  analytics: 'chart',
  
  team: 'team',
  group: 'team',
  collaboration: 'team',
};

function categorizePrompt(prompt: string): keyof typeof PLACEHOLDER_IMAGES {
  const lowerPrompt = prompt.toLowerCase();
  
  for (const [keyword, category] of Object.entries(KEYWORD_MAPPING)) {
    if (lowerPrompt.includes(keyword)) {
      return category;
    }
  }
  
  return 'default';
}

function getPlaceholderUrl(prompt: string): string {
  const category = categorizePrompt(prompt);
  return PLACEHOLDER_IMAGES[category];
}

function detectAspectRatio(width?: number, height?: number): '1:1' | '16:9' | '9:16' | '4:3' | '3:4' {
  if (!width || !height) return '16:9';
  
  const ratio = width / height;
  
  if (ratio > 1.5) return '16:9';
  if (ratio < 0.7) return '9:16';
  if (ratio > 1.2) return '4:3';
  if (ratio < 0.9) return '3:4';
  return '1:1';
}

async function generateWithImagen(directive: AssetDirective): Promise<GeneratedAsset> {
  const aspectRatio = detectAspectRatio();
  
  console.log(`[AssetGenerator] Generating with Imagen: "${directive.prompt.slice(0, 50)}..."`);
  
  const imageUrl = await aiGenerateImage({
    prompt: directive.prompt,
    negativePrompt: 'blurry, low quality, pixelated, distorted, watermark, text overlay',
    aspectRatio,
    agentType: 'asset',
  });
  
  if (imageUrl) {
    return {
      directive,
      url: imageUrl,
      success: true,
    };
  }
  
  // Fallback to placeholder on failure
  console.log(`[AssetGenerator] Imagen failed, using placeholder for: "${directive.prompt.slice(0, 30)}..."`);
  return {
    directive,
    url: getPlaceholderUrl(directive.prompt),
    success: false,
    error: 'Image generation failed, using placeholder',
  };
}

async function generateWithPlaceholder(directive: AssetDirective): Promise<GeneratedAsset> {
  await new Promise(resolve => setTimeout(resolve, 50));
  
  return {
    directive,
    url: getPlaceholderUrl(directive.prompt),
    success: true,
  };
}

export async function generateAssets(
  input: AssetGeneratorInput
): Promise<AssetGeneratorOutput> {
  const { directives } = input;
  
  const limitedDirectives = directives.slice(0, AI_LIMITS.MAX_ASSETS_PER_RENDER);
  
  if (limitedDirectives.length < directives.length) {
    console.warn(
      `[AssetGenerator] Capped assets from ${directives.length} to ${AI_LIMITS.MAX_ASSETS_PER_RENDER}`
    );
  }
  
  console.log(`[AssetGenerator] Generating ${limitedDirectives.length} assets...`);
  
  const useImagen = isVertexConfigured() && isRealImageGenerationEnabled();
  
  if (useImagen) {
    console.log('[AssetGenerator] Using Vertex AI Imagen for generation');
  } else {
    console.log('[AssetGenerator] Using placeholders (Imagen not configured or disabled)');
  }
  
  const results: GeneratedAsset[] = [];
  const assets = new Map<string, string>();
  
  for (const directive of limitedDirectives) {
    try {
      const result = useImagen 
        ? await generateWithImagen(directive)
        : await generateWithPlaceholder(directive);
      
      results.push(result);
      
      const key = directive.targetElementId || directive.prompt.slice(0, 50);
      assets.set(key, result.url);
      
      console.log(`[AssetGenerator] Generated: ${key.slice(0, 30)}... (${result.success ? 'OK' : 'fallback'})`);
    } catch (error) {
      console.error(`[AssetGenerator] Failed: ${directive.prompt.slice(0, 30)}...`, error);
      
      const fallbackUrl = getPlaceholderUrl(directive.prompt);
      results.push({
        directive,
        url: fallbackUrl,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      const key = directive.targetElementId || directive.prompt.slice(0, 50);
      assets.set(key, fallbackUrl);
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  console.log(`[AssetGenerator] Completed: ${successCount} successful, ${results.length - successCount} fallback`);
  
  return {
    assets,
    results,
  };
}

export async function generateSingleAsset(
  prompt: string,
  options?: {
    targetSlideId?: string;
    targetElementId?: string;
  }
): Promise<string> {
  const directive: AssetDirective = {
    type: 'image',
    prompt,
    targetSlideId: options?.targetSlideId,
    targetElementId: options?.targetElementId,
  };
  
  const result = await generateAssets({ directives: [directive] });
  
  return result.results[0]?.url || PLACEHOLDER_IMAGES.default;
}

export function collectAssetDirectives(
  batches: Array<{ assets?: AssetDirective[] }>
): AssetDirective[] {
  const directives: AssetDirective[] = [];
  
  for (const batch of batches) {
    if (batch.assets && Array.isArray(batch.assets)) {
      directives.push(...batch.assets);
    }
  }
  
  return directives;
}

export function isRealImageGenerationEnabled(): boolean {
  return process.env.ENABLE_IMAGEN === 'true';
}

export function isUsingRealImageGeneration(): boolean {
  return isVertexConfigured() && isRealImageGenerationEnabled();
}
