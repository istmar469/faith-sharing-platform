
import { PageData } from "../context/types";
import { queryPageById, queryExistingPages } from "./pageQueries";
import { createDefaultPage } from "./defaultPageCreator";
import { createBlankPageData, convertToPageData, findHomepage, getFallbackPage } from "./pageHelpers";

interface LoadPageDataResult {
  pageData: PageData | null;
  error: string | null;
  showTemplatePrompt: boolean;
}

export const loadPageData = async (
  pageId: string | null,
  organizationId: string | null
): Promise<LoadPageDataResult> => {
  console.log("=== loadPageData: Starting fresh page data load ===");
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
    // If we have a specific page ID, try to load that page
    if (pageId) {
      console.log("loadPageData: Attempting to load specific page:", pageId);
      const pageData = await queryPageById(pageId, organizationId);
      
      if (pageData) {
        // Validate the page data format
        if (pageData.content && !isValidEditorJSData(pageData.content)) {
          console.warn("loadPageData: Found page with incompatible format, creating fresh page");
          const freshPageData = createBlankPageData(organizationId);
          freshPageData.id = pageData.id;
          freshPageData.title = pageData.title;
          freshPageData.slug = pageData.slug;
          
          const loadTime = Date.now() - startTime;
          console.log(`loadPageData: Fresh page data created in ${loadTime}ms`);
          
          return {
            pageData: freshPageData,
            error: null,
            showTemplatePrompt: false
          };
        }
        
        const loadTime = Date.now() - startTime;
        console.log(`loadPageData: Specific page loaded in ${loadTime}ms`);
        
        return {
          pageData,
          error: null,
          showTemplatePrompt: false
        };
      }
    }

    // Check for existing pages
    console.log("loadPageData: Checking for existing pages");
    const existingPages = await queryExistingPages(organizationId);

    // If no pages exist, create default homepage
    if (!existingPages || existingPages.length === 0) {
      console.log("loadPageData: No existing pages found, creating default homepage");
      try {
        const pageData = await createDefaultPage(organizationId);
        
        const loadTime = Date.now() - startTime;
        console.log(`loadPageData: Default homepage created in ${loadTime}ms`);
        
        return {
          pageData,
          error: null,
          showTemplatePrompt: false
        };
      } catch (createError) {
        console.error("loadPageData: Error creating default homepage:", createError);
        // Return blank page instead of failing
        const blankPageData = createBlankPageData(organizationId);
        return {
          pageData: blankPageData,
          error: null,
          showTemplatePrompt: false
        };
      }
    }

    // Find homepage from existing pages
    const homepage = findHomepage(existingPages);
    if (homepage) {
      console.log("loadPageData: Found existing homepage:", homepage.id);
      
      const pageData = convertToPageData(homepage);
      
      // Validate homepage data format
      if (pageData.content && !isValidEditorJSData(pageData.content)) {
        console.warn("loadPageData: Homepage has incompatible format, creating fresh content");
        pageData.content = { blocks: [] };
      }
      
      const loadTime = Date.now() - startTime;
      console.log(`loadPageData: Homepage loaded in ${loadTime}ms`);
      
      return {
        pageData,
        error: null,
        showTemplatePrompt: false
      };
    }

    // Return the first available page as fallback
    const fallbackPage = getFallbackPage(existingPages);
    if (fallbackPage) {
      console.log("loadPageData: Using first available page as fallback:", fallbackPage.id);
      
      const pageData = convertToPageData(fallbackPage);
      
      // Validate fallback page data format
      if (pageData.content && !isValidEditorJSData(pageData.content)) {
        console.warn("loadPageData: Fallback page has incompatible format, creating fresh content");
        pageData.content = { blocks: [] };
      }
      
      const loadTime = Date.now() - startTime;
      console.log(`loadPageData: Fallback page loaded in ${loadTime}ms`);
      
      return {
        pageData,
        error: null,
        showTemplatePrompt: false
      };
    }

    // Return a new blank page for editing
    const blankPageData = createBlankPageData(organizationId);
    
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
    
    // Return blank page instead of failing completely
    const blankPageData = createBlankPageData(organizationId);
    return {
      pageData: blankPageData,
      error: null,
      showTemplatePrompt: false
    };
  }
};

// Helper function to validate Editor.js data format
const isValidEditorJSData = (content: any): boolean => {
  if (!content || typeof content !== 'object') {
    return false;
  }
  
  // Check for Editor.js format (has blocks array)
  if (Array.isArray(content.blocks)) {
    return true;
  }
  
  // Check for old page builder format (array of components)
  if (Array.isArray(content) && content.some((item: any) => item.component)) {
    console.log("Detected old page builder format with components:", content);
    return false;
  }
  
  return false;
};
