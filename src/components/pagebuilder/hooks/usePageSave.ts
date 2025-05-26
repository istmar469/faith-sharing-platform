
import { useState, useCallback } from 'react';
import { Page, savePage as savePageService } from '@/services/pages';
import { PuckData, PageData } from '../context/pageBuilderTypes';
import { toast } from 'sonner';
import { useTenantContext } from '@/components/context/TenantContext';

interface UsePageSaveProps {
  pageId: string | null;
  setPageId: (id: string | null) => void;
  setPageSlug: (slug: string) => void;
  organizationId: string | null;
  pageTitle: string;
  pageSlug: string;
  pageElements: PuckData | null;
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
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const { organizationId: tenantOrgId } = useTenantContext();

  const handleSavePage = useCallback(async (): Promise<PageData | null> => {
    const effectiveOrgId = organizationId || tenantOrgId;
    
    console.log("usePageSave: Starting save operation", { 
      pageId: pageId || 'new', 
      title: pageTitle, 
      orgId: effectiveOrgId,
      hasContent: !!pageElements
    });
    
    if (!effectiveOrgId) {
      console.error("usePageSave: Error - Organization ID is missing");
      toast.error("Organization ID is missing. Please log in again or refresh the page.");
      return null;
    }
    
    if (!pageTitle.trim()) {
      console.error("usePageSave: Error - Page title is empty");
      toast.error("Page title cannot be empty");
      return null;
    }

    if (isSaving) {
      console.log("usePageSave: Already saving, skipping duplicate request");
      return null;
    }

    setIsSaving(true);
    
    try {
      // Generate slug if empty
      const slug = pageSlug || pageTitle.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Ensure content is in proper Puck format
      const contentToSave: PuckData = pageElements || {
        content: [],
        root: {}
      };
      
      // Create page object
      const page: Page = {
        id: pageId || undefined,
        title: pageTitle,
        slug: slug,
        content: contentToSave,
        published: isPublished,
        show_in_navigation: showInNavigation,
        is_homepage: isHomepage,
        meta_title: metaTitle || undefined,
        meta_description: metaDescription || undefined,
        parent_id: parentId,
        organization_id: effectiveOrgId
      };

      console.log("usePageSave: Saving page", {
        id: pageId || 'New Page',
        title: pageTitle,
        slug: slug,
        contentItems: contentToSave.content.length,
        published: isPublished,
        organizationId: effectiveOrgId
      });
      
      const savedPage = await savePageService(page);
      
      if (savedPage) {
        console.log("usePageSave: Page saved successfully:", savedPage.id);
        
        // Update local state if this was a new page
        if (!pageId && savedPage.id) {
          setPageId(savedPage.id);
        }
        
        // Update slug if it changed
        if (savedPage.slug !== pageSlug) {
          setPageSlug(savedPage.slug);
        }
        
        setLastSaveTime(new Date());
        toast.success("Page saved successfully");
        
        // Convert to PageData format
        const pageData: PageData = {
          id: savedPage.id,
          title: savedPage.title,
          slug: savedPage.slug,
          content: savedPage.content as PuckData,
          meta_title: savedPage.meta_title,
          meta_description: savedPage.meta_description,
          parent_id: savedPage.parent_id,
          organization_id: savedPage.organization_id,
          is_homepage: savedPage.is_homepage,
          published: savedPage.published,
          show_in_navigation: savedPage.show_in_navigation,
          created_at: savedPage.created_at,
          updated_at: savedPage.updated_at
        };
        
        return pageData;
      } else {
        console.error("usePageSave: Page save returned null");
        toast.error("Failed to save page. Please try again.");
        return null;
      }
    } catch (error: any) {
      console.error("usePageSave: Error saving page:", error);
      
      if (error.code === '23505') {
        toast.error("A page with this slug already exists. Please use a different title or slug.");
      } else if (error.code && error.message) {
        toast.error(`Save failed: ${error.message} (${error.code})`);
      } else {
        toast.error("There was an error saving your page. Please try again.");
      }
      
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [
    pageId, setPageId, setPageSlug, organizationId, tenantOrgId,
    pageTitle, pageSlug, pageElements, metaTitle, metaDescription,
    parentId, showInNavigation, isHomepage, isPublished, isSaving
  ]);

  return {
    handleSavePage,
    isSaving,
    lastSaveTime
  };
};
