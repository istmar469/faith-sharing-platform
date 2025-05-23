
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
    if (initialPageData && !pageId) {
      console.log("PageBuilder: Initializing with page data");
      
      setPageId(initialPageData.id || null);
      setPageTitle(initialPageData.title || "New Page");
      setPageSlug(initialPageData.slug || "");
      setMetaTitle(initialPageData.meta_title || "");
      setMetaDescription(initialPageData.meta_description || "");
      setParentId(initialPageData.parent_id || null);
      setShowInNavigation(initialPageData.show_in_navigation || true);
      setIsPublished(initialPageData.published || false);
      setIsHomepage(initialPageData.is_homepage || false);
      
      // Handle Editor.js content format
      if (initialPageData.content) {
        if (Array.isArray(initialPageData.content)) {
          // Old format - array of elements, convert to Editor.js blocks
          setPageElements(initialPageData.content);
        } else if (initialPageData.content.blocks && Array.isArray(initialPageData.content.blocks)) {
          // Editor.js format - object with blocks array
          setPageElements(initialPageData.content.blocks);
        } else {
          // Empty content
          setPageElements([]);
        }
      } else {
        setPageElements([]);
      }
      
      if (initialPageData.organization_id) {
        setOrganizationId(initialPageData.organization_id);
      }
    }
  }, [
    initialPageData, pageId, setPageElements, setPageId, 
    setPageTitle, setPageSlug, setMetaTitle, setMetaDescription, setParentId, 
    setShowInNavigation, setIsPublished, setIsHomepage, setOrganizationId
  ]);
};
