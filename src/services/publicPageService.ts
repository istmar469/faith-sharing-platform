
import { supabase } from '@/integrations/supabase/client';

export interface PublicPage {
  id: string;
  title: string;
  slug: string;
  content: any;
  published: boolean;
  is_homepage: boolean;
  organization_id: string;
}

export const getPublicPage = async (organizationId: string, slug?: string): Promise<PublicPage | null> => {
  try {
    let query = supabase
      .from('pages')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('published', true);

    // If no slug provided, get homepage
    if (!slug || slug === 'home') {
      query = query.eq('is_homepage', true);
    } else {
      query = query.eq('slug', slug);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error('Error fetching public page:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getPublicPage:', error);
    return null;
  }
};

export const getPublicPages = async (organizationId: string): Promise<PublicPage[]> => {
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('published', true)
      .eq('show_in_navigation', true)
      .order('title');

    if (error) {
      console.error('Error fetching public pages:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPublicPages:', error);
    return [];
  }
};
