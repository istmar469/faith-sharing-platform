
import { useState, useCallback } from 'react';
import { savePage } from '@/services/pages';
import { toast } from 'sonner';
import { PageData, EditorJSData } from '../context/pageBuilderTypes';

interface UsePageSaveProps {
  pageId: string | null;
  setPageId: (id: string | null) => void;
  setPageSlug: (slug: string) => void;
  organizationId: string | null;
  pageTitle: string;
  pageSlug: string;
  pageElements: EditorJSData | null;
  metaTitle: string;
  metaDescription: string;
  parentId: string | null;
  showInNavigation: boolean;
  isHomepage: boolean;
  isPublished: boolean;
}

export const usePageSave = ({
  pageId,
  setPageId,
  setPageSlug,
  organizationId,
  pageTitle,
  pageSlug,
  pageElements,
  metaTitle,
  metaDescription,
  parentId,
  showInNavigation,
  isHomepage,
  isPublished
}: UsePageSaveProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

  const handleSavePage = useCallback(async (): Promise<PageData | null> => {
    if (!organizationId) {
      console.error("PageBuilder: Cannot save page: No organization ID");
      toast.error("Cannot save page: Missing organization ID");
      return null;
    }
    
    if (isSaving) {
      console.log("PageBuilder: Save operation already in progress, skipping");
      return null;
    }
    
    console.log("PageBuilder: Starting page save operation");
    setIsSaving(true);
    
    try {
      // Ensure we have valid EditorJS content structure
      const contentToSave = pageElements || {
        time: Date.now(),
        blocks: [],
        version: "2.30.8"
      };
      
      // Create the page data object with EditorJS content
      const pageData = {
        id: pageId,
        title: pageTitle,
        slug: pageSlug || pageTitle.toLowerCase().replace(/\s+/g, '-'),
        content: contentToSave,
        meta_title: metaTitle,
        meta_description: metaDescription,
        parent_id: parentId,
        show_in_navigation: showInNavigation,
        is_homepage: isHomepage,
        published: isPublished,
        organization_id: organizationId,
      };
      
      console.log("PageBuilder: Saving page with EditorJS content structure", {
        id: pageId || 'new',
        title: pageTitle,
        blocksCount: contentToSave.blocks?.length || 0
      });
      
      // Save the page
      const savedPage = await savePage(pageData);
      
      if (savedPage) {
        console.log("PageBuilder: Page saved successfully");
        setPageId(savedPage.id);
        setPageSlug(savedPage.slug);
        setLastSaveTime(new Date());
        toast.success("Page saved successfully");
        return savedPage;
      }
      
      return null;
    } catch (error) {
      console.error("PageBuilder: Error saving page:", error);
      toast.error("Error saving page: " + (error instanceof Error ? error.message : "Unknown error"));
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [
    organizationId, isSaving, pageId, pageTitle, pageSlug, 
    pageElements, metaTitle, metaDescription, parentId, 
    showInNavigation, isHomepage, isPublished, setPageId, setPageSlug
  ]);

  return {
    handleSavePage,
    isSaving,
    lastSaveTime
  };
};
