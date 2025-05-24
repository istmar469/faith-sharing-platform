
import { supabase } from "@/integrations/supabase/client";
import { PageData } from "../context/types";
import { createDefaultHomepage } from "@/services/defaultHomepageTemplate";
import { safeCastToEditorJSData } from "./editorDataHelpers";

// Simple in-memory cache for organization data
const orgDataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedOrgData = async (organizationId: string) => {
  const cached = orgDataCache.get(organizationId);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    console.log("loadPageData: Using cached organization data");
    return cached.data;
  }
  
  const { data, error } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', organizationId)
    .single();
    
  if (!error && data) {
    orgDataCache.set(organizationId, { data, timestamp: now });
  }
  
  return data;
};

export const loadPageData = async (
  pageId: string | null,
  organizationId: string | null
): Promise<{
  pageData: PageData | null;
  error: string | null;
  showTemplatePrompt: boolean;
}> => {
  console.log("=== loadPageData: Starting optimized page data load ===");
  const startTime = Date.now();
  
  if (!organizationId) {
    console.error("loadPageData: No organization ID provided");
    return {
      pageData: null,
      error: "No organization ID provided",
      showTemplatePrompt: false
    };
  }

  try {
    // If we have a specific page ID, load that page
    if (pageId) {
      console.log("loadPageData: Loading specific page:", pageId);
      
      const { data, error } = await Promise.race([
        supabase
          .from('pages')
          .select('*')
          .eq('id', pageId)
          .eq('organization_id', organizationId)
          .single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Page query timeout')), 3000)
        )
      ]) as any;

      if (error) {
        console.error("loadPageData: Error loading specific page:", error);
        return {
          pageData: null,
          error: `Failed to load page: ${error.message}`,
          showTemplatePrompt: false
        };
      }

      const pageData: PageData = {
        ...data,
        content: safeCastToEditorJSData(data.content)
      };
      
      const loadTime = Date.now() - startTime;
      console.log(`loadPageData: Specific page loaded in ${loadTime}ms`);
      
      return {
        pageData,
        error: null,
        showTemplatePrompt: false
      };
    }

    // Optimized: Check for existing pages and homepage in a single query
    console.log("loadPageData: Checking for existing pages and homepage");
    
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
      console.error("loadPageData: Error checking existing pages:", pagesError);
      return {
        pageData: null,
        error: `Failed to check existing pages: ${pagesError.message}`,
        showTemplatePrompt: false
      };
    }

    // If no pages exist, create lightweight default homepage
    if (!existingPages || existingPages.length === 0) {
      console.log("loadPageData: No pages found, creating lightweight homepage");
      
      try {
        const orgData = await getCachedOrgData(organizationId);
        
        if (!orgData) {
          return {
            pageData: null,
            error: "Failed to load organization data",
            showTemplatePrompt: true
          };
        }

        const newHomepage = await createDefaultHomepage(organizationId, orgData.name);
        
        const pageData: PageData = {
          ...newHomepage,
          content: safeCastToEditorJSData(newHomepage.content)
        };
        
        const loadTime = Date.now() - startTime;
        console.log(`loadPageData: Default homepage created in ${loadTime}ms`);
        
        return {
          pageData,
          error: null,
          showTemplatePrompt: false
        };
      } catch (createError) {
        console.error("loadPageData: Error creating default homepage:", createError);
        return {
          pageData: null,
          error: "Failed to create default homepage",
          showTemplatePrompt: true
        };
      }
    }

    // Find homepage from existing pages (already loaded)
    const homepage = existingPages.find(page => page.is_homepage);
    if (homepage) {
      console.log("loadPageData: Found existing homepage:", homepage.id);
      
      const pageData: PageData = {
        ...homepage,
        content: safeCastToEditorJSData(homepage.content)
      };
      
      const loadTime = Date.now() - startTime;
      console.log(`loadPageData: Homepage loaded in ${loadTime}ms`);
      
      return {
        pageData,
        error: null,
        showTemplatePrompt: false
      };
    }

    // Return the first available page as fallback
    if (existingPages.length > 0) {
      const fallbackPage = existingPages[0];
      console.log("loadPageData: Using first available page as fallback:", fallbackPage.id);
      
      const pageData: PageData = {
        ...fallbackPage,
        content: safeCastToEditorJSData(fallbackPage.content)
      };
      
      const loadTime = Date.now() - startTime;
      console.log(`loadPageData: Fallback page loaded in ${loadTime}ms`);
      
      return {
        pageData,
        error: null,
        showTemplatePrompt: false
      };
    }

    // Return a new blank page for editing
    console.log("loadPageData: Creating new blank page");
    const blankPageData: PageData = {
      title: 'New Page',
      slug: '',
      content: safeCastToEditorJSData(null),
      published: false,
      show_in_navigation: true,
      is_homepage: false,
      organization_id: organizationId
    } as PageData;
    
    const loadTime = Date.now() - startTime;
    console.log(`loadPageData: Blank page created in ${loadTime}ms`);
    
    return {
      pageData: blankPageData,
      error: null,
      showTemplatePrompt: false
    };

  } catch (error) {
    const loadTime = Date.now() - startTime;
    console.error(`loadPageData: Unexpected error after ${loadTime}ms:`, error);
    return {
      pageData: null,
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      showTemplatePrompt: false
    };
  }
};
