

import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Page, savePage as savePageService } from '@/services/pages';
import { PageElement } from '@/services/pages';

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
  const { toast } = useToast();

  const handleSavePage = async () => {
    console.log("SavePageHelper: Starting save operation with:", { 
      pageId: pageId || 'new', 
      title: pageTitle, 
      orgId: organizationId,
      contentLength: pageElements.length 
    });
    
    if (!organizationId) {
      console.error("SavePageHelper: Error - Organization ID is missing");
      toast({
        title: "Error",
        description: "Organization ID is missing. Please log in again or refresh the page.",
        variant: "destructive"
      });
      return null;
    }

    setIsSaving(true);
    
    try {
      // Generate slug if empty
      const slug = pageSlug || pageTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      // If setting this as homepage, unset any existing homepage
      if (isHomepage) {
        // Find the current homepage
        const { data: currentHomepage, error: homepageError } = await supabase
          .from('pages')
          .select('id')
          .eq('organization_id', organizationId)
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
        organization_id: organizationId
      };

      console.log("SavePageHelper: Preparing to save page with details:", {
        id: pageId || 'New Page',
        title: pageTitle,
        slug: slug,
        elements: pageElements.length,
        published: isPublished,
        organizationId: organizationId
      });
      
      // Save to database using the service function
      const savedPage = await savePageService(page);
      
      if (savedPage) {
        console.log("SavePageHelper: Page saved successfully:", savedPage);
        toast({
          title: "Page Saved",
          description: "Your page has been saved successfully",
        });
      } else {
        console.error("SavePageHelper: Page save returned undefined or null");
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: "There was an error saving your page. Please try again."
        });
      }

      return savedPage;
    } catch (error) {
      console.error("SavePageHelper: Error saving page:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "There was an error saving your page. Please try again."
      });
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
