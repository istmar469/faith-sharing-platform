
import { useEffect } from 'react';
import { Page } from '@/services/pages';
import { EditorJSData } from '../context/pageBuilderTypes';

interface UsePageInitializationProps {
  initialPageData?: Page | null;
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
  setPageElements: (elements: EditorJSData | null) => void;
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
      console.log("Initializing page with data:", initialPageData);
      
      setPageId(initialPageData.id || null);
      setPageTitle(initialPageData.title);
      setPageSlug(initialPageData.slug);
      setMetaTitle(initialPageData.meta_title || '');
      setMetaDescription(initialPageData.meta_description || '');
      setParentId(initialPageData.parent_id || null);
      setShowInNavigation(initialPageData.show_in_navigation);
      setIsPublished(initialPageData.published);
      setIsHomepage(initialPageData.is_homepage);
      setOrganizationId(initialPageData.organization_id);
      
      // Convert content to EditorJSData format if needed
      let editorData: EditorJSData | null = null;
      if (initialPageData.content) {
        // If content is already in EditorJS format, use it directly
        if (typeof initialPageData.content === 'object' && 'blocks' in initialPageData.content) {
          editorData = initialPageData.content as EditorJSData;
        } else {
          // Convert legacy format to EditorJS format
          editorData = { blocks: [] };
        }
      }
      
      setPageElements(editorData);
    }
  }, [initialPageData, pageId, setPageId, setPageTitle, setPageSlug, setMetaTitle, setMetaDescription, setParentId, setShowInNavigation, setIsPublished, setIsHomepage, setPageElements, setOrganizationId]);
};
