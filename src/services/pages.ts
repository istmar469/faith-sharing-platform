
import { supabase } from "@/integrations/supabase/client";
import { PageElement } from "@/components/pagebuilder/context/PageBuilderContext";

export interface Page {
  id?: string;
  title: string;
  slug: string;
  content: PageElement[];
  published: boolean;
  show_in_navigation: boolean;
  meta_title?: string;
  meta_description?: string;
  parent_id?: string | null;
  organization_id: string;
  created_at?: string;
  updated_at?: string;
}

// Type for Supabase database response
interface PageFromDB {
  id: string;
  title: string;
  slug: string;
  content: any; // This will be parsed from JSON
  published: boolean;
  show_in_navigation: boolean;
  meta_title: string | null;
  meta_description: string | null;
  parent_id: string | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

// Convert database response to our Page model
function mapDbPageToPage(dbPage: PageFromDB): Page {
  return {
    id: dbPage.id,
    title: dbPage.title,
    slug: dbPage.slug,
    content: dbPage.content as PageElement[], // Type assertion since we know the structure
    published: dbPage.published,
    show_in_navigation: dbPage.show_in_navigation,
    meta_title: dbPage.meta_title || undefined,
    meta_description: dbPage.meta_description || undefined,
    parent_id: dbPage.parent_id,
    organization_id: dbPage.organization_id,
    created_at: dbPage.created_at,
    updated_at: dbPage.updated_at
  };
}

export async function getPages(organizationId: string) {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('organization_id', organizationId)
    .order('title');
  
  if (error) {
    console.error("Error fetching pages:", error);
    throw error;
  }
  
  return (data as PageFromDB[]).map(mapDbPageToPage);
}

export async function getPageById(id: string) {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error("Error fetching page:", error);
    throw error;
  }
  
  return mapDbPageToPage(data as PageFromDB);
}

export async function savePage(page: Page) {
  if (page.id) {
    // Update existing page
    const { data, error } = await supabase
      .from('pages')
      .update({
        title: page.title,
        slug: page.slug,
        content: page.content as any, // Cast to any to satisfy TypeScript
        published: page.published,
        show_in_navigation: page.show_in_navigation,
        meta_title: page.meta_title,
        meta_description: page.meta_description,
        parent_id: page.parent_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', page.id)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating page:", error);
      throw error;
    }
    
    return mapDbPageToPage(data as PageFromDB);
  } else {
    // Create new page
    const { data, error } = await supabase
      .from('pages')
      .insert({
        title: page.title,
        slug: page.slug,
        content: page.content as any, // Cast to any to satisfy TypeScript
        published: page.published,
        show_in_navigation: page.show_in_navigation,
        meta_title: page.meta_title,
        meta_description: page.meta_description,
        parent_id: page.parent_id,
        organization_id: page.organization_id
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating page:", error);
      throw error;
    }
    
    return mapDbPageToPage(data as PageFromDB);
  }
}

export async function deletePage(id: string) {
  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting page:", error);
    throw error;
  }
  
  return true;
}
