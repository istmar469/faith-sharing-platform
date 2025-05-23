
import { supabase } from "@/integrations/supabase/client";
import { PageData } from "../context/types";
import { PageElement } from '@/services/pages';

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
      
      // Properly cast the content from Json to PageElement[]
      // Use a type assertion with a runtime check for better safety
      let pageElements: PageElement[] = [];
      
      if (Array.isArray(data.content)) {
        // First convert to unknown, then to PageElement[] with validation
        const contentArray = data.content as unknown[];
        
        // Validate that each item has the required PageElement properties
        pageElements = contentArray.filter((item): item is PageElement => 
          typeof item === 'object' && 
          item !== null && 
          'id' in item && 
          'type' in item && 
          'component' in item
        );
      }
      
      const pageData: PageData = {
        ...data,
        content: pageElements,
        is_homepage: !!data.is_homepage, // Ensure boolean type
        published: !!data.published,
        show_in_navigation: !!data.show_in_navigation
      };
      
      return {
        pageData,
        error: null,
        showTemplatePrompt: pageElements.length === 0
      };
    } else {
      // Create a new page template
      console.log("Creating new page for organization:", orgId);
      const newPage: PageData = {
        title: 'New Page',
        slug: 'new-page',
        content: [],
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
