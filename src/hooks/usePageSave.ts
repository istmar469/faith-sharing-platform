
import { useState } from 'react';
import { toast } from 'sonner';
import { PageData, savePage } from '@/services/pageService';

export function usePageSave() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (pageData: PageData): Promise<PageData | null> => {
    if (isSaving) {
      console.log('usePageSave: Already saving, skipping duplicate request');
      return null;
    }

    console.log('usePageSave: Starting save operation', {
      pageId: pageData.id || 'new',
      title: pageData.title,
      organizationId: pageData.organization_id,
      hasContent: !!pageData.content
    });

    setIsSaving(true);
    try {
      // Validate required fields before saving
      if (!pageData.organization_id) {
        throw new Error('Organization ID is required');
      }
      
      if (!pageData.title || !pageData.title.trim()) {
        throw new Error('Page title is required');
      }

      // Ensure content is properly formatted
      const contentToSave = pageData.content || { content: [], root: {} };
      
      const dataToSave = {
        ...pageData,
        content: contentToSave,
        // Generate slug if not provided
        slug: pageData.slug || pageData.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()
      };

      console.log('usePageSave: Saving page data', {
        id: dataToSave.id || 'new',
        title: dataToSave.title,
        slug: dataToSave.slug,
        published: dataToSave.published,
        organizationId: dataToSave.organization_id
      });

      const savedPage = await savePage(dataToSave);
      
      console.log('usePageSave: Page saved successfully', {
        id: savedPage.id,
        title: savedPage.title,
        slug: savedPage.slug
      });
      
      toast.success('Page saved successfully!');
      return savedPage;
    } catch (error: any) {
      console.error('usePageSave: Error saving page:', error);
      
      if (error.code === '23505') {
        toast.error('A page with this slug already exists in your organization.');
      } else if (error.message) {
        toast.error(`Failed to save page: ${error.message}`);
      } else {
        toast.error('Failed to save page. Please try again.');
      }
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return { handleSave, isSaving };
}
