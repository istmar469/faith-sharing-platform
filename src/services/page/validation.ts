
import { supabase } from '@/integrations/supabase/client';
import { PageServiceError } from './types';

export async function validateSlugUniqueness(slug: string, organizationId: string, pageId?: string): Promise<void> {
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

export async function validateHomepageUniqueness(organizationId: string, pageId?: string): Promise<void> {
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
