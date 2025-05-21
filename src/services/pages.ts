
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
  
  return data as Page[];
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
  
  return data as Page;
}

export async function savePage(page: Page) {
  if (page.id) {
    // Update existing page
    const { data, error } = await supabase
      .from('pages')
      .update({
        title: page.title,
        slug: page.slug,
        content: page.content,
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
    
    return data as Page;
  } else {
    // Create new page
    const { data, error } = await supabase
      .from('pages')
      .insert({
        title: page.title,
        slug: page.slug,
        content: page.content,
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
    
    return data as Page;
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
