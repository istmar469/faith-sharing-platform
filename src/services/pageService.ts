
import { supabase } from '@/integrations/supabase/client';

export interface PageData {
  id?: string;
  title: string;
  slug: string;
  content: any;
  meta_title?: string;
  meta_description?: string;
  parent_id?: string | null;
  organization_id: string;
  published: boolean;
  show_in_navigation: boolean;
  is_homepage: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function savePage(pageData: PageData): Promise<PageData> {
  console.log('Saving page:', pageData);
  
  // Generate slug from title if not provided
  if (!pageData.slug) {
    pageData.slug = pageData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  const dataToSave = {
    title: pageData.title,
    slug: pageData.slug,
    content: pageData.content,
    meta_title: pageData.meta_title,
    meta_description: pageData.meta_description,
    parent_id: pageData.parent_id,
    organization_id: pageData.organization_id,
    published: pageData.published,
    show_in_navigation: pageData.show_in_navigation,
    is_homepage: pageData.is_homepage
  };

  if (pageData.id) {
    // Update existing page
    const { data, error } = await supabase
      .from('pages')
      .update(dataToSave)
      .eq('id', pageData.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Create new page
    const { data, error } = await supabase
      .from('pages')
      .insert(dataToSave)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export async function getPage(id: string): Promise<PageData | null> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

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
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return data;
}

export async function getOrganizationPages(organizationId: string): Promise<PageData[]> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('organization_id', organizationId)
    .order('title');

  if (error) throw error;
  return data || [];
}

export async function getHomepage(organizationId: string): Promise<PageData | null> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_homepage', true)
    .eq('published', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return data;
}
