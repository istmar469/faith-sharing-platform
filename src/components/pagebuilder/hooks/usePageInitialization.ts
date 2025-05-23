
import { useEffect } from 'react';
import { Page } from '@/services/pages';

interface UsePageInitializationProps {
  initialPageData: Page | null;
  pageId: string | null;
  setPageId: (id: string | null) => void;
  setPageTitle: (title: string) => void;
  setPageSlug: (slug: string) => void;
  setMetaTitle: (metaTitle: string) => void;
  setMetaDescription: (metaDescription: string) => void;
  setParentId: (id: string | null) => void;
  setShowInNavigation: (show: boolean) => void;
  setIsPublished: (published: boolean) => void;
  setIsHomepage: (isHomepage: boolean) => void;
  setPageElements: (elements: any[]) => void;
  setOrganizationId: (id: string) => void;
}

export const usePageInitialization = ({
  initialPageData,
  pageId,
  setPageId,
  setPageTitle,
  setPageSlug,
  setMetaTitle,
  setMetaDescription,
  setParentId,
  setShowInNavigation,
  setIsPublished,
  setIsHomepage,
  setPageElements,
  setOrganizationId
}: UsePageInitializationProps) => {
  useEffect(() => {
    if (initialPageData) {
      console.log("PageBuilder: Initializing with page data", initialPageData);
      
      // Always set the page ID, whether it's null or not
      setPageId(initialPageData.id || null);
      setPageTitle(initialPageData.title || "New Page");
      setPageSlug(initialPageData.slug || "");
      setMetaTitle(initialPageData.meta_title || "");
      setMetaDescription(initialPageData.meta_description || "");
      setParentId(initialPageData.parent_id || null);
      setShowInNavigation(initialPageData.show_in_navigation || true);
      setIsPublished(initialPageData.published || false);
      setIsHomepage(initialPageData.is_homepage || false);
      
      // Handle Editor.js content format with careful type checking
      if (initialPageData.content) {
        console.log("PageBuilder: Processing page content", initialPageData.content);
        
        if (Array.isArray(initialPageData.content)) {
          // Old format - array of elements, convert to Editor.js blocks
          setPageElements(initialPageData.content);
        } else if (typeof initialPageData.content === 'object' && initialPageData.content !== null) {
          // Editor.js format - object with blocks array
          const editorContent = initialPageData.content as any;
          if (editorContent.blocks && Array.isArray(editorContent.blocks)) {
            setPageElements(editorContent.blocks);
          } else {
            // Fallback for malformed content
            console.warn("PageBuilder: Content is an object but doesn't have blocks array");
            setPageElements([]);
          }
        } else {
          // Empty or invalid content
          console.warn("PageBuilder: Unknown content format", initialPageData.content);
          setPageElements([]);
        }
      } else {
        // No content at all
        console.log("PageBuilder: No content in page data");
        setPageElements([]);
      }
      
      if (initialPageData.organization_id) {
        console.log("PageBuilder: Setting organization ID from page data:", initialPageData.organization_id);
        setOrganizationId(initialPageData.organization_id);
      }
    }
  }, [
    initialPageData,
    setPageElements, setPageId, 
    setPageTitle, setPageSlug, setMetaTitle, setMetaDescription, setParentId, 
    setShowInNavigation, setIsPublished, setIsHomepage, setOrganizationId
  ]);
};
