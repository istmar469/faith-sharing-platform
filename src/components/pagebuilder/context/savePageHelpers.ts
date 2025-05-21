
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
    if (!organizationId) {
      toast({
        title: "Error",
        description: "Organization ID is missing. Please log in again or refresh the page.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Generate slug if empty
      const slug = pageSlug || pageTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      // If setting this as homepage, unset any existing homepage
      if (isHomepage) {
        // Find the current homepage
        const { data: currentHomepage } = await supabase
          .from('pages')
          .select('id')
          .eq('organization_id', organizationId)
          .eq('is_homepage', true)
          .neq('id', pageId || 'none'); // Exclude current page
          
        // Unset existing homepage if one exists
        if (currentHomepage && currentHomepage.length > 0) {
          await supabase
            .from('pages')
            .update({ is_homepage: false })
            .eq('id', currentHomepage[0].id);
        }
      }
      
      // Create page object - fixed to match Page interface exactly
      const page: Page = {
        id: pageId || undefined,
        title: pageTitle,
        slug: slug,
        content: pageElements as any, // Type assertion to match what the service expects
        published: isPublished,
        show_in_navigation: showInNavigation,
        is_homepage: isHomepage,
        meta_title: metaTitle || pageTitle,
        meta_description: metaDescription,
        parent_id: parentId,
        organization_id: organizationId
      };

      console.log("Saving page with organizationId:", organizationId);
      
      // Save to database using the service function
      const savedPage = await savePageService(page);
      
      toast({
        title: "Page Saved",
        description: "Your page has been saved successfully",
      });

      return savedPage;
    } catch (error) {
      console.error("Error saving page:", error);
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
