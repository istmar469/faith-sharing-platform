import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

// EditorJS data format interface
export interface EditorJSData {
  time?: number;
  blocks: Array<{
    id?: string;
    type: string;
    data: any;
  }>;
  version?: string;
}

export interface Page {
  id?: string;
  title: string;
  slug: string;
  content: EditorJSData | any; // Support both EditorJS and legacy formats
  published: boolean;
  show_in_navigation: boolean;
  is_homepage: boolean;
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
  is_homepage: boolean;
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
    content: dbPage.content,
    published: dbPage.published,
    show_in_navigation: dbPage.show_in_navigation,
    is_homepage: dbPage.is_homepage,
    meta_title: dbPage.meta_title || undefined,
    meta_description: dbPage.meta_description || undefined,
    parent_id: dbPage.parent_id,
    organization_id: dbPage.organization_id,
    created_at: dbPage.created_at,
    updated_at: dbPage.updated_at
  };
}

export async function getPages(organizationId: string) {
  console.log("PagesService: Fetching pages for organization:", organizationId);
  
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('organization_id', organizationId)
      .order('title');
    
    if (error) {
      console.error("PagesService: Error fetching pages:", error);
      throw error;
    }
    
    console.log(`PagesService: Successfully fetched ${data.length} pages`);
    return (data as PageFromDB[]).map(mapDbPageToPage);
  } catch (err) {
    console.error("PagesService: Exception fetching pages:", err);
    throw err;
  }
}

export async function getPageById(id: string) {
  console.log("PagesService: Fetching page by ID:", id);
  
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error("PagesService: Error fetching page:", error);
      throw error;
    }
    
    if (!data) {
      console.log("PagesService: Page not found with ID:", id);
      return null;
    }
    
    console.log("PagesService: Successfully fetched page:", data.id);
    return mapDbPageToPage(data as PageFromDB);
  } catch (err) {
    console.error("PagesService: Exception fetching page:", err);
    throw err;
  }
}

export async function savePage(page: Page) {
  console.log("PagesService: Saving page", { 
    id: page.id || 'new', 
    title: page.title, 
    org: page.organization_id,
    contentStructure: page.content?.blocks ? 'EditorJS' : 'Legacy'
  });
  
  // Ensure content is in proper EditorJS format if it has blocks
  let contentToSave = page.content;
  if (page.content && typeof page.content === 'object') {
    if (page.content.blocks && Array.isArray(page.content.blocks)) {
      // Already in EditorJS format
      contentToSave = page.content;
    } else if (Array.isArray(page.content)) {
      // Legacy format - convert to EditorJS
      contentToSave = {
        time: Date.now(),
        blocks: [],
        version: "2.30.8"
      };
    }
  } else {
    // No content or invalid format - create empty EditorJS structure
    contentToSave = {
      time: Date.now(),
      blocks: [],
      version: "2.30.8"
    };
  }
  
  // Create a simple object for database operations
  const pageData = {
    title: page.title,
    slug: page.slug,
    content: contentToSave as unknown as Json,
    published: page.published,
    show_in_navigation: page.show_in_navigation,
    is_homepage: page.is_homepage,
    meta_title: page.meta_title,
    meta_description: page.meta_description,
    parent_id: page.parent_id,
    organization_id: page.organization_id
  };
  
  try {
    if (page.id) {
      // Update existing page
      console.log(`PagesService: Updating existing page with ID: ${page.id}`);
      const { data, error } = await supabase
        .from('pages')
        .update({
          ...pageData,
          updated_at: new Date().toISOString()
        })
        .eq('id', page.id)
        .select()
        .single();
        
      if (error) {
        console.error("PagesService: Error updating page:", error);
        throw error;
      }
      
      console.log("PagesService: Page updated successfully:", data);
      return mapDbPageToPage(data as PageFromDB);
    } else {
      // Create new page
      console.log("PagesService: Creating new page");
      const { data, error } = await supabase
        .from('pages')
        .insert(pageData)
        .select()
        .single();
      
      if (error) {
        console.error("PagesService: Error creating page:", error);
        throw error;
      }
      
      console.log("PagesService: New page created successfully:", data);
      return mapDbPageToPage(data as PageFromDB);
    }
  } catch (err) {
    console.error("PagesService: Exception during page save:", err);
    throw err;
  }
}

export async function deletePage(id: string) {
  console.log("PagesService: Deleting page:", id);
  
  try {
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("PagesService: Error deleting page:", error);
      throw error;
    }
    
    console.log("PagesService: Page deleted successfully");
    return true;
  } catch (err) {
    console.error("PagesService: Exception during page deletion:", err);
    throw err;
  }
}

export async function getPageByDomain(domain: string): Promise<Page | null> {
  console.log("PagesService: Fetching page by domain:", domain);
  
  try {
    // Find the organization with this domain by checking the subdomain field
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('subdomain', domain)
      .maybeSingle();
      
    if (orgError || !orgData) {
      console.error("PagesService: Domain not found:", orgError);
      return null;
    }
    
    console.log("PagesService: Found organization for domain:", orgData.id);
    
    // Then get the homepage for this organization
    const { data: pageData, error: pageError } = await supabase
      .from('pages')
      .select('*')
      .eq('organization_id', orgData.id)
      .eq('is_homepage', true)
      .eq('published', true)
      .maybeSingle();
      
    if (pageError || !pageData) {
      console.error("PagesService: Homepage not found:", pageError);
      return null;
    }
    
    console.log("PagesService: Found homepage:", pageData.id);
    return mapDbPageToPage(pageData as PageFromDB);
  } catch (error) {
    console.error("PagesService: Error getting page by domain:", error);
    return null;
  }
}
