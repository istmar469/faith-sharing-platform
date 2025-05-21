import { supabase } from "@/integrations/supabase/client";
import { PageElement } from "@/components/pagebuilder/context/PageBuilderContext";

export interface Page {
  id?: string;
  title: string;
  slug: string;
  content: PageElement[];
  published: boolean;
  show_in_navigation: boolean;
  is_homepage?: boolean;
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
    content: dbPage.content as PageElement[], // Type assertion since we know the structure
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
        is_homepage: page.is_homepage || false,
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
        is_homepage: page.is_homepage || false,
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

export async function getPageByDomain(domain: string): Promise<Page | null> {
  try {
    // First find the organization with this domain
    const { data: domainData, error: domainError } = await supabase
      .from('domain_settings')
      .select('organization_id')
      .or(`subdomain.eq.${domain},custom_domain.eq.${domain}`)
      .single();
      
    if (domainError || !domainData) {
      console.error("Domain not found:", domainError);
      return null;
    }
    
    // Then get the homepage for this organization
    const { data: pageData, error: pageError } = await supabase
      .from('pages')
      .select('*')
      .eq('organization_id', domainData.organization_id)
      .eq('is_homepage', true)
      .eq('published', true)
      .single();
      
    if (pageError || !pageData) {
      console.error("Homepage not found:", pageError);
      return null;
    }
    
    return mapDbPageToPage(pageData as PageFromDB);
  } catch (error) {
    console.error("Error getting page by domain:", error);
    return null;
  }
}

export interface DomainSettings {
  id?: string;
  organization_id: string;
  subdomain?: string | null;
  custom_domain?: string | null;
  created_at?: string;
  updated_at?: string;
}

export async function getDomainSettingsByOrg(organizationId: string): Promise<DomainSettings | null> {
  const { data, error } = await supabase
    .from('domain_settings')
    .select('*')
    .eq('organization_id', organizationId)
    .single();
    
  if (error) {
    console.error("Error getting domain settings:", error);
    return null;
  }
  
  return data as DomainSettings;
}

export async function saveDomainSettings(settings: DomainSettings): Promise<DomainSettings | null> {
  if (settings.id) {
    // Update existing settings
    const { data, error } = await supabase
      .from('domain_settings')
      .update({
        subdomain: settings.subdomain,
        custom_domain: settings.custom_domain,
        updated_at: new Date().toISOString()
      })
      .eq('id', settings.id)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating domain settings:", error);
      throw error;
    }
    
    return data as DomainSettings;
  } else {
    // Create new settings
    const { data, error } = await supabase
      .from('domain_settings')
      .insert({
        organization_id: settings.organization_id,
        subdomain: settings.subdomain,
        custom_domain: settings.custom_domain
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error creating domain settings:", error);
      throw error;
    }
    
    return data as DomainSettings;
  }
}
