
import { useState } from 'react';
import { toast } from 'sonner';
import { PageData, savePage } from '@/services/pageService';

export function usePageSave() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (pageData: PageData): Promise<PageData | null> => {
    if (isSaving) return null;

    setIsSaving(true);
    try {
      const savedPage = await savePage(pageData);
      toast.success('Page saved successfully!');
      return savedPage;
    } catch (error: any) {
      console.error('Error saving page:', error);
      if (error.code === '23505') {
        toast.error('A page with this slug already exists in your organization.');
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
