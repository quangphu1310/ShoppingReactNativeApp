import { resolvedApiBaseUrl } from '../services/api-service';

const FALLBACK_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop';

/**
 * Resolve a product image URL that may be absolute, protocol-relative,
 * root-relative, or a bare path into a fully-qualified URL.
 *
 * @param rawImageUrl - The raw image path/URL from the API
 * @param baseUrl     - API base URL to prepend for relative paths (defaults to resolvedApiBaseUrl)
 */
export const resolveProductImageUrl = (
  rawImageUrl: string,
  baseUrl: string = resolvedApiBaseUrl,
): string => {
  const normalized = rawImageUrl.trim();

  if (!normalized) {
    return FALLBACK_PRODUCT_IMAGE;
  }

  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized;
  }

  if (normalized.startsWith('//')) {
    return `https:${normalized}`;
  }

  if (normalized.startsWith('/')) {
    return `${baseUrl}${normalized}`;
  }

  return `${baseUrl}/${normalized}`;
};
