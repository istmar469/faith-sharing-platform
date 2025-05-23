
import { supabase } from "@/integrations/supabase/client";
import { PageData } from "../context/types";
import { createDefaultHomepage } from "@/services/defaultHomepageTemplate";
import { safeCastToEditorJSData } from "./editorDataHelpers";

export const loadPageData = async (
  pageId: string | null,
  organizationId: string | null
): Promise<{
  pageData: PageData | null;
  error: string | null;
  showTemplatePrompt: boolean;
}> => {
  console.log("=== loadPageData: Starting page data load ===");
  console.log("loadPageData: Input params", { pageId, organizationId });
  
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
      
      const startTime = Date.now();
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('id', pageId)
        .eq('organization_id', organizationId)
        .single();
      
      const loadTime = Date.now() - startTime;
      console.log(`loadPageData: Page query completed in ${loadTime}ms`, { data, error });

      if (error) {
        console.error("loadPageData: Error loading specific page:", error);
        return {
          pageData: null,
          error: `Failed to load page: ${error.message}`,
          showTemplatePrompt: false
        };
      }

      console.log("loadPageData: Successfully loaded specific page");
      const pageData: PageData = {
        ...data,
        content: safeCastToEditorJSData(data.content)
      };
      
      return {
        pageData,
        error: null,
        showTemplatePrompt: false
      };
    }

    // If no page ID, check if we have any pages at all
    console.log("loadPageData: No page ID provided, checking for existing pages");
    
    const startTime = Date.now();
    const { data: existingPages, error: pagesError } = await supabase
      .from('pages')
      .select('id, title, is_homepage')
      .eq('organization_id', organizationId)
      .limit(5);
      
    const queryTime = Date.now() - startTime;
    console.log(`loadPageData: Pages query completed in ${queryTime}ms`, { 
      existingPages, 
      pagesError,
      pageCount: existingPages?.length || 0 
    });

    if (pagesError) {
      console.error("loadPageData: Error checking existing pages:", pagesError);
      return {
        pageData: null,
        error: `Failed to check existing pages: ${pagesError.message}`,
        showTemplatePrompt: false
      };
    }

    // If no pages exist, create default homepage
    if (!existingPages || existingPages.length === 0) {
      console.log("loadPageData: No pages found, creating default homepage");
      
      // Get organization name for the homepage
      const orgStartTime = Date.now();
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', organizationId)
        .single();
        
      const orgQueryTime = Date.now() - orgStartTime;
      console.log(`loadPageData: Organization query completed in ${orgQueryTime}ms`, { orgData, orgError });

      if (orgError) {
        console.error("loadPageData: Error getting org data:", orgError);
        return {
          pageData: null,
          error: "Failed to load organization data",
          showTemplatePrompt: true
        };
      }

      try {
        console.log("loadPageData: Creating default homepage for:", orgData.name);
        const createStartTime = Date.now();
        
        const newHomepage = await createDefaultHomepage(organizationId, orgData.name);
        
        const createTime = Date.now() - createStartTime;
        console.log(`loadPageData: Default homepage created in ${createTime}ms`, { 
          homepageId: newHomepage.id 
        });
        
        const pageData: PageData = {
          ...newHomepage,
          content: safeCastToEditorJSData(newHomepage.content)
        };
        
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

    // If pages exist, check if there's a homepage
    const homepage = existingPages.find(page => page.is_homepage);
    if (homepage) {
      console.log("loadPageData: Found existing homepage, loading it:", homepage.id);
      
      const homepageStartTime = Date.now();
      const { data: homepageData, error: homepageError } = await supabase
        .from('pages')
        .select('*')
        .eq('id', homepage.id)
        .single();
        
      const homepageQueryTime = Date.now() - homepageStartTime;
      console.log(`loadPageData: Homepage query completed in ${homepageQueryTime}ms`, { 
        homepageData, 
        homepageError 
      });
        
      if (homepageError) {
        console.error("loadPageData: Error loading homepage:", homepageError);
        return {
          pageData: null,
          error: "Failed to load homepage",
          showTemplatePrompt: false
        };
      }
      
      console.log("loadPageData: Successfully loaded homepage data");
      const pageData: PageData = {
        ...homepageData,
        content: safeCastToEditorJSData(homepageData.content)
      };
      
      return {
        pageData,
        error: null,
        showTemplatePrompt: false
      };
    }

    // Return a new blank page for editing
    console.log("loadPageData: No homepage found, creating new blank page");
    const blankPageData: PageData = {
      title: 'New Page',
      slug: '',
      content: safeCastToEditorJSData(null),
      published: false,
      show_in_navigation: true,
      is_homepage: false,
      organization_id: organizationId
    } as PageData;
    
    console.log("loadPageData: Returning blank page data");
    return {
      pageData: blankPageData,
      error: null,
      showTemplatePrompt: false
    };

  } catch (error) {
    console.error("loadPageData: Unexpected error:", error);
    return {
      pageData: null,
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      showTemplatePrompt: false
    };
  }
};
