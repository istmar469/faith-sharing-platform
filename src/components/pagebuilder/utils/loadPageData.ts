
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
      const pageData = await queryPageById(pageId, organizationId);
      
      const loadTime = Date.now() - startTime;
      console.log(`loadPageData: Specific page loaded in ${loadTime}ms`);
      
      return {
        pageData,
        error: null,
        showTemplatePrompt: false
      };
    }

    // Check for existing pages and homepage
    const existingPages = await queryExistingPages(organizationId);

    // If no pages exist, create lightweight default homepage
    if (!existingPages || existingPages.length === 0) {
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
        return {
          pageData: null,
          error: "Failed to create default homepage",
          showTemplatePrompt: true
        };
      }
    }

    // Find homepage from existing pages
    const homepage = findHomepage(existingPages);
    if (homepage) {
      console.log("loadPageData: Found existing homepage:", homepage.id);
      
      const pageData = convertToPageData(homepage);
      
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
    return {
      pageData: null,
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      showTemplatePrompt: false
    };
  }
};
