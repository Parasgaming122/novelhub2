// Novel Reader - Image Utilities
import { Novel } from '../types';

export const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x450.png?text=No+Cover';

/**
 * Reconstruct cover image URL from novel ID if possible
 */
export function reconstructCoverImage(novelId: string): string {
  if (!novelId) return '';
  const idMatch = novelId.match(/(\d+)$/);
  if (idMatch) {
    return `https://www.novelhall.com/comic/${idMatch[1]}.jpg`;
  }
  return '';
}

/**
 * Get proxied image URL to bypass CORS and Referer restrictions
 */
export function getProxiedImageUrl(url: string | undefined | null, novelId?: string): string {
  let finalUrl = url;

  // Handle protocol-relative URLs (e.g., //www.example.com)
  if (finalUrl && finalUrl.startsWith('//')) {
    finalUrl = 'https:' + finalUrl;
  }

  // Try to reconstruct from novelId if url is missing or clearly invalid
  if ((!finalUrl || finalUrl.trim() === '' || finalUrl.length < 5) && novelId) {
    finalUrl = reconstructCoverImage(novelId);
  }

  if (!finalUrl || typeof finalUrl !== 'string' || finalUrl.trim() === '' || finalUrl.includes('placeholder')) {
    return PLACEHOLDER_IMAGE;
  }
  
  // Clean URL - remove any existing proxy if present
  const cleanUrl = finalUrl.replace('https://images.weserv.nl/?url=', '');
  // Weserv proxy is great for bypassing hotlinking and handling various image formats
  return `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}&default=${encodeURIComponent(PLACEHOLDER_IMAGE)}`;
}
