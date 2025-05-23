
import { supabase } from "@/integrations/supabase/client";
import { PageData } from "../context/pageBuilderTypes";

export const loadPageData = async (pageId: string | undefined, orgId: string): Promise<{ 
  pageData: PageData | null; 
  error: string | null;
  showTemplatePrompt: boolean;
}> => {
  try {
    // If pageId is provided, try to load that specific page
    if (pageId && pageId !== orgId) {
      console.log("Loading existing page:", pageId);
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('id', pageId)
        .single();
      
      if (error) {
        console.error('Error loading page:', error);
        return {
          pageData: null,
          error: `Failed to load page: ${error.message}`,
          showTemplatePrompt: false
        };
      }
      
      if (!data) {
        console.error('Page not found:', pageId);
        return {
          pageData: null,
          error: 'Page not found',
          showTemplatePrompt: false
        };
      }
      
      console.log("Page data loaded successfully:", data);
      
      const pageData: PageData = {
        ...data,
        content: data.content || { blocks: [] }, // Ensure Editor.js format
        is_homepage: !!data.is_homepage,
        published: !!data.published,
        show_in_navigation: !!data.show_in_navigation
      };
      
      // Check if content is empty (show template prompt)
      const hasContent = data.content && 
        ((Array.isArray(data.content) && data.content.length > 0) ||
         (data.content.blocks && Array.isArray(data.content.blocks) && data.content.blocks.length > 0));
      
      return {
        pageData,
        error: null,
        showTemplatePrompt: !hasContent
      };
    } else {
      // Create a new page template
      console.log("Creating new page for organization:", orgId);
      const newPage: PageData = {
        title: 'New Page',
        slug: 'new-page',
        content: { blocks: [] }, // Editor.js format
        organization_id: orgId,
        is_homepage: false,
        published: false,
        show_in_navigation: true
      };
      
      return {
        pageData: newPage,
        error: null,
        showTemplatePrompt: true
      };
    }
  } catch (err) {
    console.error('Error in loadPageData:', err);
    return {
      pageData: null,
      error: 'An unexpected error occurred while loading the page',
      showTemplatePrompt: false
    };
  }
};
