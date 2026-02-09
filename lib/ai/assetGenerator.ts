import { AI_LIMITS, AI_IMAGE_CONFIG } from './config';
import { aiGenerateImage, isVertexConfigured } from './adapter';
import { logger } from './logger';
import { saveAssetsBatch } from '../db/ai-assets';
import { 
  uploadToMinIO,
  PLACEHOLDER_IMAGES 
} from './stock-registry';

function getPlaceholderUrl(keyword?: string): string {
  if (!keyword) return PLACEHOLDER_IMAGES.default;
  const lowerKey = keyword.toLowerCase();
  
  if (lowerKey.includes('tech') || lowerKey.includes('code') || lowerKey.includes('digital') || lowerKey.includes('future')) {
    return PLACEHOLDER_IMAGES.tech;
  }
  if (lowerKey.includes('nature') || lowerKey.includes('green') || lowerKey.includes('eco')) {
    return PLACEHOLDER_IMAGES.nature;
  }
  if (lowerKey.includes('business') || lowerKey.includes('office') || lowerKey.includes('team')) {
    return PLACEHOLDER_IMAGES.business;
  }
  return PLACEHOLDER_IMAGES.default;
}

function detectAspectRatio(prompt: string): "1:1" | "16:9" | "9:16" | "4:3" | "3:4" {
  if (!prompt) return "16:9";
  const lower = prompt.toLowerCase();
  
  if (lower.includes('portrait') || lower.includes('vertical') || lower.includes('mobile') || lower.includes('phone') || lower.includes('tall')) {
    return "9:16";
  }
  
  if (lower.includes('square') || lower.includes('icon') || lower.includes('logo') || lower.includes('avatar') || lower.includes('profile')) {
    return "1:1";
  }
  
  return "16:9"; 
}
import type { 
  AssetDirective, 
  AssetGeneratorInput, 
  AssetGeneratorOutput,
  AssetMetadata,
  GeneratedAsset,
} from './types';

async function generateWithImagen(directive: AssetDirective, jobId?: string): Promise<GeneratedAsset> {
  const aspectRatio = detectAspectRatio(directive.prompt);
  
  const imageResult = await aiGenerateImage({
    prompt: directive.prompt,
    negativePrompt: 'blurry, low quality, pixelated, distorted, watermark, text overlay',
    aspectRatio,
    agentType: 'asset',
  });
  
  if (imageResult) {
    try {
      const assetKey = `${jobId || 'unknown'}/${Date.now()}-${directive.prompt.slice(0, 20).replace(/[^a-z0-9]/gi, '_')}`;
      const minioUrl = await uploadToMinIO(imageResult, assetKey);
      
      return {
        directive,
        url: minioUrl,
        success: true,
      };
    } catch {
      return {
        directive,
        url: imageResult,
        success: true,
      };
    }
  }
  
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
  const { directives, jobId } = input;
  
  const limitedDirectives = directives.slice(0, AI_LIMITS.MAX_ASSETS_PER_RENDER);
  
  const useImagen = AI_IMAGE_CONFIG.enabled();
  
  const results: GeneratedAsset[] = [];
  const assets = new Map<string, AssetMetadata>();
  const assetsToSave: Array<{ jobId: string; assetKey: string; prompt: string; url: string }> = [];
  
  let assetIndex = 0;
  for (const directive of limitedDirectives) {
    try {
      const result = useImagen 
        ? await generateWithImagen(directive, jobId)
        : await generateWithPlaceholder(directive);
      
      results.push(result);
      
      const key = directive.targetElementId || `${directive.targetSlideId || 'asset'}-${assetIndex}-${directive.prompt.slice(0, 30).replace(/[^a-z0-9]/gi, '_')}`;
      assets.set(key, { 
        url: result.url, 
        prompt: directive.prompt,
        targetSlideId: directive.targetSlideId,
        targetElementId: directive.targetElementId,
      });
      
      if (jobId) {
        assetsToSave.push({
          jobId,
          assetKey: key,
          prompt: directive.prompt,
          url: result.url,
        });
      }
      
      logger.asset.generated(key, result.success);
      assetIndex++;
    } catch (error) {
      const fallbackUrl = getPlaceholderUrl(directive.prompt);
      results.push({
        directive,
        url: fallbackUrl,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      const key = directive.targetElementId || `${directive.targetSlideId || 'asset'}-${assetIndex}`;
      assets.set(key, { 
        url: fallbackUrl, 
        prompt: directive.prompt,
        targetSlideId: directive.targetSlideId,
        targetElementId: directive.targetElementId,
      });
      
      if (jobId) {
        assetsToSave.push({
          jobId,
          assetKey: key,
          prompt: directive.prompt,
          url: fallbackUrl,
        });
      }
      
      logger.asset.generated(key, false);
      assetIndex++;
    }
  }
  
  if (assetsToSave.length > 0) {
    try {
      await saveAssetsBatch(assetsToSave);
    } catch {
    }
  }
  
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
