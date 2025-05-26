
import { supabase } from "@/integrations/supabase/client";
import { PageData } from "../context/pageBuilderTypes";
import { safeCastToPuckData } from "./puckDataHelpers";

export const queryPageById = async (pageId: string, organizationId: string): Promise<PageData | null> => {
  console.log("pageQueries: Loading specific page:", pageId);
  
  const { data, error } = await Promise.race([
    supabase
      .from('pages')
      .select('*')
      .eq('id', pageId)
      .eq('organization_id', organizationId)
      .maybeSingle(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Page query timeout')), 3000)
    )
  ]) as any;

  if (error) {
    console.error("pageQueries: Error loading specific page:", error);
    throw new Error(`Failed to load page: ${error.message}`);
  }

  if (!data) {
    console.log("pageQueries: Page not found:", pageId);
    return null;
  }

  return {
    ...data,
    content: safeCastToPuckData(data.content)
  };
};

export const queryExistingPages = async (organizationId: string) => {
  console.log("pageQueries: Checking for existing pages and homepage");
  
  const { data: existingPages, error: pagesError } = await Promise.race([
    supabase
      .from('pages')
      .select('id, title, is_homepage, content, slug, published, show_in_navigation, meta_title, meta_description, parent_id, organization_id, created_at, updated_at')
      .eq('organization_id', organizationId)
      .order('is_homepage', { ascending: false })
      .limit(10),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Pages query timeout')), 3000)
    )
  ]) as any;

  if (pagesError) {
    console.error("pageQueries: Error checking existing pages:", pagesError);
    throw new Error(`Failed to check existing pages: ${pagesError.message}`);
  }

  return existingPages || [];
};
