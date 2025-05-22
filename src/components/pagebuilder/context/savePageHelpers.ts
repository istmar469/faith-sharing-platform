
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Page, savePage as savePageService } from '@/services/pages';
import { PageElement } from '@/services/pages';
import { toast } from 'sonner';
import { useTenantContext } from '@/components/context/TenantContext';

interface UseSavePageProps {
  pageId: string | null;
  pageTitle: string;
  pageSlug: string;
  metaTitle: string;
  metaDescription: string;
  parentId: string | null;
  showInNavigation: boolean;
  isPublished: boolean;
  isHomepage: boolean;
  pageElements: PageElement[];
  organizationId: string | null;
}

export const useSavePage = ({
  pageId,
  pageTitle,
  pageSlug,
  metaTitle,
  metaDescription,
  parentId,
  showInNavigation,
  isPublished,
  isHomepage,
  pageElements,
  organizationId,
}: UseSavePageProps) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { toast: uiToast } = useToast();
  // Use tenant context as fallback
  const { organizationId: tenantOrgId } = useTenantContext();

  const handleSavePage = async () => {
    // Use organization ID from props or fall back to tenant context
    const effectiveOrgId = organizationId || tenantOrgId;
    
    console.log("SavePageHelper: Starting save operation with:", { 
      pageId: pageId || 'new', 
      title: pageTitle, 
      orgId: effectiveOrgId,
      contentLength: pageElements.length 
    });
    
    if (!effectiveOrgId) {
      console.error("SavePageHelper: Error - Organization ID is missing");
      toast.error("Organization ID is missing. Please log in again or refresh the page.");
      return null;
    }
    
    // Don't allow empty titles
    if (!pageTitle.trim()) {
      console.error("SavePageHelper: Error - Page title is empty");
      toast.error("Page title cannot be empty");
      return null;
    }

    // Check if we're already in the process of saving
    if (isSaving) {
      console.log("SavePageHelper: Already saving, skipping duplicate request");
      return null;
    }

    setIsSaving(true);
    
    try {
      // Generate slug if empty - ensure it's URL safe
      const slug = pageSlug || pageTitle.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-') // Replace multiple hyphens with a single one
        .replace(/^-|-$/g, ''); // Remove leading and trailing hyphens
      
      // If setting this as homepage, unset any existing homepage
      if (isHomepage) {
        try {
          // Find the current homepage
          const { data: currentHomepage, error: homepageError } = await supabase
            .from('pages')
            .select('id')
            .eq('organization_id', effectiveOrgId)
            .eq('is_homepage', true)
            .neq('id', pageId || 'none'); // Exclude current page
            
          if (homepageError) {
            console.error("SavePageHelper: Error checking current homepage:", homepageError);
          } else {
            console.log("SavePageHelper: Current homepage check result:", currentHomepage);
          }
            
          // Unset existing homepage if one exists
          if (currentHomepage && currentHomepage.length > 0) {
            const { error: updateError } = await supabase
              .from('pages')
              .update({ is_homepage: false })
              .eq('id', currentHomepage[0].id);
            
            if (updateError) {
              console.error("SavePageHelper: Error updating previous homepage:", updateError);
            } else {
              console.log("SavePageHelper: Previous homepage unset successfully");
            }
          }
        } catch (err) {
          console.error("SavePageHelper: Error handling homepage update:", err);
          // Continue with the save even if this fails
        }
      }
      
      // Create page object with proper typing
      const page: Page = {
        id: pageId || undefined,
        title: pageTitle,
        slug: slug,
        content: pageElements,
        published: isPublished,
        show_in_navigation: showInNavigation,
        is_homepage: isHomepage,
        meta_title: metaTitle || undefined,
        meta_description: metaDescription || undefined,
        parent_id: parentId,
        organization_id: effectiveOrgId
      };

      console.log("SavePageHelper: Preparing to save page with details:", {
        id: pageId || 'New Page',
        title: pageTitle,
        slug: slug,
        elements: pageElements.length,
        published: isPublished,
        organizationId: effectiveOrgId
      });
      
      // Save to database using the service function
      const savedPage = await savePageService(page);
      
      if (savedPage) {
        console.log("SavePageHelper: Page saved successfully:", savedPage);
        return savedPage;
      } else {
        console.error("SavePageHelper: Page save returned undefined or null");
        toast.error("There was an error saving your page. Please try again.");
        return null;
      }
    } catch (error: any) {
      console.error("SavePageHelper: Error saving page:", error);
      
      // More detailed error messages based on the error type
      if (error.code === '23505') {
        // Duplicate key error
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
  };

  return {
    savePage: handleSavePage,
    isSaving
  };
};
