
import { cache } from '@/utils/cache';
import { PageData } from './types';

// Cache keys
export const CACHE_KEYS = {
  page: (id: string) => `page:${id}`,
  organizationPages: (orgId: string) => `org_pages:${orgId}`,
  homepage: (orgId: string) => `homepage:${orgId}`,
};

// Cache TTLs (in seconds)
export const CACHE_TTL = {
  page: 300, // 5 minutes
  organizationPages: 60, // 1 minute
  homepage: 300, // 5 minutes
};

export function invalidatePageCaches(organizationId: string, pageId?: string, isHomepage?: boolean) {
  if (pageId) {
    cache.delete(CACHE_KEYS.page(pageId));
  }
  cache.delete(CACHE_KEYS.organizationPages(organizationId));
  if (isHomepage) {
    cache.delete(CACHE_KEYS.homepage(organizationId));
  }
}
