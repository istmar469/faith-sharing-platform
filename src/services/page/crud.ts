import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { PageData, PageServiceError, pageDataSchema } from './types';
import { convertJsonToPuckData, convertPuckDataToJson } from './utils';
import { validateSlugUniqueness, validateHomepageUniqueness } from './validation';
import { CACHE_KEYS, CACHE_TTL, invalidatePageCaches } from './cache';
import { cache } from '@/utils/cache';

// Version management interface (for future implementation)
export interface PageVersion {
  version_number: number;
  title: string;
  created_at: string;
  created_by_email: string;
  change_description: string;
  is_major_version: boolean;
  is_published: boolean;
  is_current: boolean;
}

// Function to generate alternative slugs when there's a conflict
async function generateUniqueSlug(baseSlug: string, organizationId: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 0;
  const maxAttempts = 10;
  
  while (counter <= maxAttempts) {
    try {
      // Build query properly
      let query = supabase
        .from('pages')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('slug', slug);
      
      // Only add neq clause if excludeId is provided and not empty
      if (excludeId && excludeId.trim() !== '') {
        query = query.neq('id', excludeId);
      }
      
      const { data: existingPage, error } = await query.maybeSingle();
      
      if (error) {
        console.error('generateUniqueSlug: Query error:', error);
        // If there's a query error, add timestamp to be safe
        const timestamp = Date.now().toString().slice(-6);
        return `${baseSlug}-${timestamp}`;
      }
      
      if (!existingPage) {
        // Slug is available
        return slug;
      }
      
      // Slug is taken, try with counter
      counter++;
      slug = counter === 1 ? `${baseSlug}-1` : `${baseSlug}-${counter}`;
    } catch (error) {
      console.error('generateUniqueSlug: Unexpected error:', error);
      // If there's an unexpected error, add timestamp to be safe
      const timestamp = Date.now().toString().slice(-6);
      return `${baseSlug}-${timestamp}`;
    }
  }
  
  // If we've tried many variations, add a timestamp
  const timestamp = Date.now().toString().slice(-6);
  return `${baseSlug}-${timestamp}`;
}

export async function savePage(pageData: PageData): Promise<PageData> {
  try {
    // Check if user is super admin first - this will help with permission handling
    let isSuperAdmin = false;
    try {
      const { data: adminStatus, error: adminError } = await supabase.rpc('get_my_admin_status');
      if (!adminError && Array.isArray(adminStatus) && adminStatus.length > 0 && adminStatus[0]?.is_super_admin === true) {
        isSuperAdmin = true;
        console.log('savePage: User is super admin, enhanced permissions available');
      }
    } catch (adminCheckError) {
      console.log('savePage: Could not verify super admin status, using regular permissions');
    }

    // Validate input data
    const validatedData = pageDataSchema.parse(pageData);
    
    console.log('savePage: Validation passed, data:', {
      id: validatedData.id,
      title: validatedData.title,
      slug: validatedData.slug,
      organization_id: validatedData.organization_id,
      published: validatedData.published,
      is_homepage: validatedData.is_homepage,
      hasContent: !!validatedData.content,
      isSuperAdmin: isSuperAdmin
    });

    // Ensure content has required properties for conversion
    const contentForSave = {
      content: validatedData.content.content || [],
      root: validatedData.content.root || {}
    };

    if (validatedData.id) {
      // For updates, validate and update
      console.log('savePage: Updating existing page');
      
      // Validate slug uniqueness for updates
      await validateSlugUniqueness(validatedData.slug, validatedData.organization_id, validatedData.id);

      // Handle homepage uniqueness - automatically unset other homepages if setting as homepage
      if (validatedData.is_homepage) {
        console.log('savePage: Setting as homepage, clearing other homepages first');
        // First, unset any existing homepage for this organization (excluding current page)
        const { error: clearHomepageError } = await supabase
          .from('pages')
          .update({ is_homepage: false })
          .eq('organization_id', validatedData.organization_id)
          .eq('is_homepage', true)
          .neq('id', validatedData.id);
        
        if (clearHomepageError) {
          console.error('savePage: Error clearing existing homepage:', clearHomepageError);
          // Don't throw error, just log it - we can still proceed
        } else {
          console.log('savePage: Successfully cleared existing homepages');
        }
      }

      // Update the main page record
      const dataToSave = {
        title: validatedData.title,
        slug: validatedData.slug,
        content: convertPuckDataToJson(contentForSave),
        meta_title: validatedData.meta_title,
        meta_description: validatedData.meta_description,
        parent_id: validatedData.parent_id,
        organization_id: validatedData.organization_id,
        published: validatedData.published,
        show_in_navigation: validatedData.show_in_navigation,
        is_homepage: validatedData.is_homepage,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('pages')
        .update(dataToSave)
        .eq('id', validatedData.id)
        .select()
        .single();

      if (error) {
        console.error('savePage: Update error:', error);
        throw new PageServiceError('Failed to update page', 'UPDATE_ERROR', error);
      }
      
      // Invalidate caches
      invalidatePageCaches(validatedData.organization_id, validatedData.id, dataToSave.is_homepage);
      
      return {
        ...data,
        content: convertJsonToPuckData(data.content)
      } as PageData;

    } else {
      // For new pages, create page
      console.log('savePage: Creating new page');
      
      // Generate unique slug if needed
      let finalSlug = validatedData.slug;
      try {
        await validateSlugUniqueness(finalSlug, validatedData.organization_id);
        console.log('savePage: Slug validation passed for:', finalSlug);
      } catch (slugError) {
        console.log('savePage: Slug conflict detected, generating unique slug...', slugError);
        finalSlug = await generateUniqueSlug(finalSlug, validatedData.organization_id);
        console.log('savePage: Generated unique slug:', finalSlug);
      }

      // Handle homepage uniqueness - automatically unset other homepages if setting as homepage
      if (validatedData.is_homepage) {
        console.log('savePage: Setting new page as homepage, clearing other homepages first');
        // First, unset any existing homepage for this organization
        const { error: clearHomepageError } = await supabase
          .from('pages')
          .update({ is_homepage: false })
          .eq('organization_id', validatedData.organization_id)
          .eq('is_homepage', true);
        
        if (clearHomepageError) {
          console.error('savePage: Error clearing existing homepage:', clearHomepageError);
          // Don't throw error, just log it - we can still proceed
        } else {
          console.log('savePage: Successfully cleared existing homepages');
        }
      }

      // Get the next display order for this organization
      const { data: maxOrderData, error: maxOrderError } = await supabase
        .from('pages')
        .select('display_order')
        .eq('organization_id', validatedData.organization_id)
        .order('display_order', { ascending: false })
        .limit(1);

      // Handle case where organization has no pages (maxOrderData will be empty array)
      const nextDisplayOrder = maxOrderError || !maxOrderData || maxOrderData.length === 0 
        ? 0 
        : (maxOrderData[0].display_order + 1);

      const insertData = {
        title: validatedData.title,
        slug: finalSlug,
        content: convertPuckDataToJson(contentForSave),
        meta_title: validatedData.meta_title,
        meta_description: validatedData.meta_description,
        parent_id: validatedData.parent_id,
        organization_id: validatedData.organization_id,
        published: validatedData.published,
        show_in_navigation: validatedData.show_in_navigation,
        is_homepage: validatedData.is_homepage,
        display_order: nextDisplayOrder,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      console.log('savePage: Insert data prepared:', {
        ...insertData,
        content: 'Content object prepared'
      });
      
      const { data, error } = await supabase
        .from('pages')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('savePage: Create error details:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Handle specific database constraint violations
        if (error.code === '23505') { // Unique constraint violation
          if (error.message?.includes('pages_organization_slug_idx') || error.message?.includes('organization_id_slug')) {
            console.log('savePage: Slug conflict during insert, retrying with unique slug...');
            
            // Try to generate a unique slug and retry the insert
            try {
              const uniqueSlug = await generateUniqueSlug(insertData.slug, insertData.organization_id);
              console.log('savePage: Generated unique slug:', uniqueSlug);
              
              const retryData = { ...insertData, slug: uniqueSlug };
              const { data: retryResult, error: retryError } = await supabase
                .from('pages')
                .insert(retryData)
                .select()
                .single();
              
              if (retryError) {
                console.error('savePage: Retry with unique slug failed:', retryError);
                throw new PageServiceError('Failed to create page with unique slug. Please try again.', 'SLUG_GENERATION_FAILED', retryError);
              }
              
              console.log('savePage: Page created successfully with unique slug:', retryResult.id);
              
              // Invalidate organization pages cache
              invalidatePageCaches(validatedData.organization_id, undefined, insertData.is_homepage);
              
              return {
                ...retryResult,
                content: convertJsonToPuckData(retryResult.content)
              } as PageData;
              
            } catch (slugError) {
              console.error('savePage: Unique slug generation failed:', slugError);
              throw new PageServiceError('A page with this title already exists. Please choose a different title.', 'DUPLICATE_SLUG', error);
            }
          }
          if (error.message?.includes('idx_unique_homepage_per_org') || error.message?.includes('is_homepage')) {
            throw new PageServiceError('A database constraint prevented setting this as homepage. This may indicate a race condition. Please try again.', 'DUPLICATE_HOMEPAGE', error);
          }
          // Generic unique constraint violation
          throw new PageServiceError('This page conflicts with an existing page. Please check the title and slug.', 'DUPLICATE_CONTENT', error);
        }
        
        // Handle foreign key violations
        if (error.code === '23503') {
          if (error.message?.includes('organization_id')) {
            throw new PageServiceError('Invalid organization. Please refresh and try again.', 'INVALID_ORGANIZATION', error);
          }
          throw new PageServiceError('Invalid reference in page data. Please check all fields.', 'INVALID_REFERENCE', error);
        }
        
        // Handle check constraint violations
        if (error.code === '23514') {
          throw new PageServiceError('Invalid data format. Please check all fields and try again.', 'INVALID_DATA_FORMAT', error);
        }
        
        // Generic database error
        throw new PageServiceError('Failed to create page', 'CREATE_ERROR', error);
      }
      
      console.log('savePage: Page created successfully:', data.id);
      
      // Invalidate organization pages cache
      invalidatePageCaches(validatedData.organization_id, undefined, insertData.is_homepage);
      
      return {
        ...data,
        content: convertJsonToPuckData(data.content)
      } as PageData;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('savePage: Validation error:', error.errors);
      throw new PageServiceError('Invalid page data', 'VALIDATION_ERROR', error.errors);
    }
    
    if (error instanceof PageServiceError) {
      // Re-throw PageServiceError as-is
      throw error;
    }
    
    console.error('savePage: Unexpected error:', error);
    throw error;
  }
}

// Placeholder functions for version management (to be implemented when types are ready)
export async function getPageVersionHistory(pageId: string): Promise<PageVersion[]> {
  console.log('Version history not yet implemented for page:', pageId);
  return [];
}

export async function revertToPageVersion(pageId: string, versionNumber: number): Promise<boolean> {
  console.log('Version revert not yet implemented for page:', pageId, 'version:', versionNumber);
  return false;
}

export async function getPageVersion(pageId: string, versionNumber: number): Promise<any> {
  console.log('Get version not yet implemented for page:', pageId, 'version:', versionNumber);
  return null;
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
  };

  return savePage(duplicateData);
} 