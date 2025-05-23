
import { supabase } from "@/integrations/supabase/client";
import { PageData } from "../context/types";
import { createDefaultHomepage } from "@/services/defaultHomepageTemplate";

export const loadPageData = async (
  pageId: string | null,
  organizationId: string | null
): Promise<{
  pageData: PageData | null;
  error: string | null;
  showTemplatePrompt: boolean;
}> => {
  console.log("loadPageData: Loading with pageId:", pageId, "orgId:", organizationId);
  
  if (!organizationId) {
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
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('id', pageId)
        .eq('organization_id', organizationId)
        .single();

      if (error) {
        console.error("loadPageData: Error loading specific page:", error);
        return {
          pageData: null,
          error: `Failed to load page: ${error.message}`,
          showTemplatePrompt: false
        };
      }

      console.log("loadPageData: Loaded specific page:", data);
      return {
        pageData: data as PageData,
        error: null,
        showTemplatePrompt: false
      };
    }

    // If no page ID, check if we have any pages at all
    console.log("loadPageData: Checking for existing pages");
    const { data: existingPages, error: pagesError } = await supabase
      .from('pages')
      .select('id, title, is_homepage')
      .eq('organization_id', organizationId)
      .limit(5); // Get a few pages to check

    if (pagesError) {
      console.error("loadPageData: Error checking pages:", pagesError);
      return {
        pageData: null,
        error: `Failed to check existing pages: ${pagesError.message}`,
        showTemplatePrompt: false
      };
    }

    console.log("loadPageData: Found existing pages:", existingPages);

    // If no pages exist, get org info and create default homepage
    if (!existingPages || existingPages.length === 0) {
      console.log("loadPageData: No pages found, creating default homepage");
      
      // Get organization name for the homepage
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', organizationId)
        .single();

      if (orgError) {
        console.error("loadPageData: Error getting org data:", orgError);
        return {
          pageData: null,
          error: "Failed to load organization data",
          showTemplatePrompt: true
        };
      }

      try {
        const newHomepage = await createDefaultHomepage(organizationId, orgData.name);
        console.log("loadPageData: Created default homepage:", newHomepage.id);
        
        return {
          pageData: newHomepage as PageData,
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
      
      const { data: homepageData, error: homepageError } = await supabase
        .from('pages')
        .select('*')
        .eq('id', homepage.id)
        .single();
        
      if (homepageError) {
        console.error("loadPageData: Error loading homepage:", homepageError);
        return {
          pageData: null,
          error: "Failed to load homepage",
          showTemplatePrompt: false
        };
      }
      
      console.log("loadPageData: Loaded homepage data:", homepageData);
      return {
        pageData: homepageData as PageData,
        error: null,
        showTemplatePrompt: false
      };
    }

    // Return a new blank page for editing
    console.log("loadPageData: No homepage found, creating new page");
    return {
      pageData: {
        title: 'New Page',
        slug: '',
        content: { blocks: [], time: Date.now(), version: "2.28.2" },
        published: false,
        show_in_navigation: true,
        is_homepage: false,
        organization_id: organizationId
      } as PageData,
      error: null,
      showTemplatePrompt: false
    };

  } catch (error) {
    console.error("loadPageData: Unexpected error:", error);
    return {
      pageData: null,
      error: "An unexpected error occurred",
      showTemplatePrompt: false
    };
  }
};
