
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { PageData, PageServiceError, pageDataSchema } from './types';
import { convertJsonToPuckData, convertPuckDataToJson } from './utils';
import { validateSlugUniqueness, validateHomepageUniqueness } from './validation';
import { CACHE_KEYS, CACHE_TTL, invalidatePageCaches } from './cache';
import { cache } from '@/utils/cache';

export async function savePage(pageData: PageData): Promise<PageData> {
  try {
    // Validate input data
    const validatedData = pageDataSchema.parse(pageData);
  
    // Validate slug uniqueness
    await validateSlugUniqueness(validatedData.slug, validatedData.organization_id, validatedData.id);

    // Validate homepage uniqueness if setting as homepage
    if (validatedData.is_homepage) {
      await validateHomepageUniqueness(validatedData.organization_id, validatedData.id);
    }

    const dataToSave = {
      title: validatedData.title,
      slug: validatedData.slug,
      content: convertPuckDataToJson(validatedData.content),
      meta_title: validatedData.meta_title,
      meta_description: validatedData.meta_description,
      parent_id: validatedData.parent_id,
      organization_id: validatedData.organization_id,
      published: validatedData.published,
      show_in_navigation: validatedData.show_in_navigation,
      is_homepage: validatedData.is_homepage,
      updated_at: new Date().toISOString(),
    };

    if (validatedData.id) {
      // Update existing page
      const { data, error } = await supabase
        .from('pages')
        .update(dataToSave)
        .eq('id', validatedData.id)
        .select()
        .single();

      if (error) throw new PageServiceError('Failed to update page', 'UPDATE_ERROR', error);
      
      // Invalidate caches
      invalidatePageCaches(validatedData.organization_id, validatedData.id, dataToSave.is_homepage);
      
      return {
        ...data,
        content: convertJsonToPuckData(data.content)
      } as PageData;
    } else {
      // Create new page
      const { data, error } = await supabase
        .from('pages')
        .insert({
          ...dataToSave,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw new PageServiceError('Failed to create page', 'CREATE_ERROR', error);
      
      // Invalidate organization pages cache
      invalidatePageCaches(validatedData.organization_id, undefined, dataToSave.is_homepage);
      
      return {
        ...data,
        content: convertJsonToPuckData(data.content)
      } as PageData;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new PageServiceError('Invalid page data', 'VALIDATION_ERROR', error.errors);
    }
    throw error;
  }
}

export async function getPage(id: string): Promise<PageData | null> {
  // Try to get from cache first
  const cachedPage = cache.get<PageData>(CACHE_KEYS.page(id));
  if (cachedPage) return cachedPage;

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new PageServiceError('Failed to fetch page', 'FETCH_ERROR', error);
  }

  const pageData = {
    ...data,
    content: convertJsonToPuckData(data.content)
  } as PageData;

  // Cache the result
  cache.set(CACHE_KEYS.page(id), pageData, CACHE_TTL.page);

  return pageData;
}

export async function getPageBySlug(organizationId: string, slug: string): Promise<PageData | null> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new PageServiceError('Failed to fetch page by slug', 'FETCH_ERROR', error);
  }

  return {
    ...data,
    content: convertJsonToPuckData(data.content)
  } as PageData;
}

export async function getOrganizationPages(
  organizationId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: PageData[]; total: number }> {
  // Try to get from cache first
  const cacheKey = `${CACHE_KEYS.organizationPages(organizationId)}:${page}:${pageSize}`;
  const cachedResult = cache.get<{ data: PageData[]; total: number }>(cacheKey);
  if (cachedResult) return cachedResult;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('pages')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .order('title')
    .range(from, to);

  if (error) {
    throw new PageServiceError('Failed to fetch organization pages', 'FETCH_ERROR', error);
  }

  const result = {
    data: (data || []).map(page => ({
      ...page,
      content: convertJsonToPuckData(page.content)
    })) as PageData[],
    total: count || 0,
  };

  // Cache the result
  cache.set(cacheKey, result, CACHE_TTL.organizationPages);

  return result;
}

export async function getHomepage(organizationId: string): Promise<PageData | null> {
  // Try to get from cache first
  const cachedHomepage = cache.get<PageData>(CACHE_KEYS.homepage(organizationId));
  if (cachedHomepage) return cachedHomepage;

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_homepage', true)
    .eq('published', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new PageServiceError('Failed to fetch homepage', 'FETCH_ERROR', error);
  }

  const pageData = {
    ...data,
    content: convertJsonToPuckData(data.content)
  } as PageData;

  // Cache the result
  cache.set(CACHE_KEYS.homepage(organizationId), pageData, CACHE_TTL.homepage);

  return pageData;
}

export async function duplicatePage(pageId: string): Promise<PageData> {
  const page = await getPage(pageId);
  if (!page) {
    throw new PageServiceError('Page not found', 'NOT_FOUND');
  }

  const duplicateData: PageData = {
    ...page,
    id: undefined,
    title: `${page.title} (Copy)`,
    slug: `${page.slug}-copy`,
    published: false,
    is_homepage: false,
    version: 1,
  };

  return savePage(duplicateData);
}
