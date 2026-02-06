
import { minioStorageAdapter } from '../object-storage/minio-adapter';

export const PLACEHOLDER_IMAGES = {
  default: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1080',
  tech: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1080',
  nature: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1080',
  business: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1080',
};

export function getPlaceholderUrl(keyword?: string): string {
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

export function detectAspectRatio(): "1:1" | "16:9" | "9:16" | "4:3" | "3:4" {
  return "16:9"; 
}

export async function uploadToMinIO(base64Data: string, key: string): Promise<string> {
   if (!base64Data || !base64Data.startsWith('data:image')) {
       return base64Data;
   }
   
   const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
   if (!matches || matches.length !== 3) {
       throw new Error('Invalid base64 string');
   }
   
   const buffer = Buffer.from(matches[2], 'base64');
   const contentType = matches[1];

   try {
        return await minioStorageAdapter.uploadFile('assets', key, buffer, contentType);
   } catch (e) {
       console.error('Failed to upload to MinIO:', e);
       throw e;
   }
}
