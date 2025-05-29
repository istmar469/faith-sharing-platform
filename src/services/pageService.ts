import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { cache } from '@/utils/cache';

// Validation schemas
const pageContentSchema = z.object({
  content: z.any(),
  root: z.any(),
});

const pageDataSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  content: pageContentSchema,
  meta_title: z.string().max(255).optional(),
  meta_description: z.string().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  organization_id: z.string().uuid(),
  published: z.boolean(),
  show_in_navigation: z.boolean(),
  is_homepage: z.boolean(),
  version: z.number().int().positive().optional(),
  scheduled_publish_at: z.string().datetime().nullable().optional(),
  template_id: z.string().uuid().optional(),
});

export type PageData = z.infer<typeof pageDataSchema>;

// Cache keys
const CACHE_KEYS = {
  page: (id: string) => `page:${id}`,
  organizationPages: (orgId: string) => `org_pages:${orgId}`,
  homepage: (orgId: string) => `homepage:${orgId}`,
};

// Cache TTLs (in seconds)
const CACHE_TTL = {
  page: 300, // 5 minutes
  organizationPages: 60, // 1 minute
  homepage: 300, // 5 minutes
};

export class PageServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'PageServiceError';
  }
}

async function validateSlugUniqueness(slug: string, organizationId: string, pageId?: string): Promise<void> {
  const query = supabase
    .from('pages')
    .select('id')
    .eq('slug', slug)
    .eq('organization_id', organizationId);

  if (pageId) {
    query.neq('id', pageId);
  }

  const { data, error } = await query;

  if (error) {
    throw new PageServiceError('Failed to validate slug uniqueness', 'VALIDATION_ERROR', error);
  }

  if (data && data.length > 0) {
    throw new PageServiceError('Slug already exists in this organization', 'DUPLICATE_SLUG');
  }
}

async function validateHomepageUniqueness(organizationId: string, pageId?: string): Promise<void> {
  const query = supabase
    .from('pages')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('is_homepage', true);

  if (pageId) {
    query.neq('id', pageId);
  }

  const { data, error } = await query;

  if (error) {
    throw new PageServiceError('Failed to validate homepage uniqueness', 'VALIDATION_ERROR', error);
  }

  if (data && data.length > 0) {
    throw new PageServiceError('Another page is already set as homepage', 'DUPLICATE_HOMEPAGE');
  }
}

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
      ...validatedData,
      updated_by: (await supabase.auth.getUser()).data.user?.id,
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
      
      // Save version history
      await savePageVersion(validatedData.id, dataToSave.content, dataToSave.version || 1);
      
      // Invalidate caches
      cache.delete(CACHE_KEYS.page(validatedData.id));
      cache.delete(CACHE_KEYS.organizationPages(validatedData.organization_id));
      if (dataToSave.is_homepage) {
        cache.delete(CACHE_KEYS.homepage(validatedData.organization_id));
      }
      
    return data;
  } else {
    // Create new page
    const { data, error } = await supabase
      .from('pages')
        .insert({
          ...dataToSave,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
      .select()
      .single();

      if (error) throw new PageServiceError('Failed to create page', 'CREATE_ERROR', error);
      
      // Save initial version
      await savePageVersion(data.id, dataToSave.content, 1);
      
      // Invalidate organization pages cache
      cache.delete(CACHE_KEYS.organizationPages(validatedData.organization_id));
      if (dataToSave.is_homepage) {
        cache.delete(CACHE_KEYS.homepage(validatedData.organization_id));
      }
      
    return data;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new PageServiceError('Invalid page data', 'VALIDATION_ERROR', error.errors);
    }
    throw error;
  }
}

async function savePageVersion(pageId: string, content: any, version: number): Promise<void> {
  const { error } = await supabase
    .from('page_versions')
    .insert({
      page_id: pageId,
      version,
      content,
      created_by: (await supabase.auth.getUser()).data.user?.id,
    });

  if (error) {
    throw new PageServiceError('Failed to save page version', 'VERSION_ERROR', error);
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

  // Cache the result
  cache.set(CACHE_KEYS.page(id), data, CACHE_TTL.page);

  return data;
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

  return data;
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
    data: data || [],
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

  // Cache the result
  cache.set(CACHE_KEYS.homepage(organizationId), data, CACHE_TTL.homepage);

  return data;
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

export async function getPageVersions(pageId: string): Promise<{ version: number; created_at: string; created_by: string }[]> {
  const { data, error } = await supabase
    .from('page_versions')
    .select('version, created_at, created_by')
    .eq('page_id', pageId)
    .order('version', { ascending: false });

  if (error) {
    throw new PageServiceError('Failed to fetch page versions', 'FETCH_ERROR', error);
  }

  return data || [];
}

export async function getPageVersion(pageId: string, version: number): Promise<PageData | null> {
  const { data, error } = await supabase
    .from('page_versions')
    .select('content')
    .eq('page_id', pageId)
    .eq('version', version)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new PageServiceError('Failed to fetch page version', 'FETCH_ERROR', error);
  }

  const page = await getPage(pageId);
  if (!page) return null;

  return {
    ...page,
    content: data.content,
    version,
  };
}

export async function restorePageVersion(pageId: string, version: number): Promise<PageData> {
  const versionData = await getPageVersion(pageId, version);
  if (!versionData) {
    throw new PageServiceError('Version not found', 'NOT_FOUND');
  }

  return savePage(versionData);
}

export async function getPageTemplates(organizationId: string): Promise<{ id: string; name: string; description: string | null }[]> {
  const { data, error } = await supabase
    .from('page_templates')
    .select('id, name, description')
    .or(`organization_id.eq.${organizationId},is_global.eq.true`)
    .order('name');

  if (error) {
    throw new PageServiceError('Failed to fetch page templates', 'FETCH_ERROR', error);
  }

  return data || [];
}

export async function getPageTemplate(templateId: string): Promise<{ content: any } | null> {
  const { data, error } = await supabase
    .from('page_templates')
    .select('content')
    .eq('id', templateId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new PageServiceError('Failed to fetch page template', 'FETCH_ERROR', error);
  }

  return data;
}

export async function createPageFromTemplate(templateId: string, organizationId: string): Promise<PageData> {
  const template = await getPageTemplate(templateId);
  if (!template) {
    throw new PageServiceError('Template not found', 'NOT_FOUND');
  }

  const newPage: PageData = {
    title: 'New Page',
    slug: 'new-page',
    content: template.content,
    organization_id: organizationId,
    published: false,
    show_in_navigation: true,
    is_homepage: false,
    template_id: templateId,
  };

  return savePage(newPage);
}
