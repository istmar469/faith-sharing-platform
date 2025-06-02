
import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import { toast } from 'sonner';
import { PageData, savePage, getPage } from '@/services/pageService';
import { safeCastToPuckData, createDefaultPuckData } from '@/components/pagebuilder/utils/puckDataHelpers';

export function usePageBuilder() {
  const { pageId } = useParams<{ pageId?: string }>();
  const navigate = useNavigate();
  const { organizationId, isContextReady } = useTenantContext();
  
  // Core state
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [pageTitle, setPageTitle] = useState('New Page');
  const [pageContent, setPageContent] = useState<any>(createDefaultPuckData());
  const [isPublished, setIsPublished] = useState(false);
  const [isHomepage, setIsHomepage] = useState(false);
  
  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Load initial data
  useEffect(() => {
    if (!isContextReady) return;
    
    if (!organizationId) {
      setError('No organization selected');
      setIsLoading(false);
      return;
    }

    if (pageId && pageId !== 'new') {
      loadPage(pageId);
    } else {
      // New page
      const defaultContent = createDefaultPuckData();
      setPageContent(defaultContent);
      setPageTitle('New Page');
      setIsPublished(false);
      setIsHomepage(false);
      setPageData(null);
      setIsDirty(false);
      setIsLoading(false);
    }
  }, [pageId, organizationId, isContextReady]);

  const loadPage = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await getPage(id);
      if (data) {
        setPageData(data);
        setPageTitle(data.title);
        setPageContent(safeCastToPuckData(data.content));
        setIsPublished(data.published);
        setIsHomepage(data.is_homepage);
        setIsDirty(false);
      } else {
        setError('Page not found');
      }
    } catch (err) {
      console.error('Error loading page:', err);
      setError('Failed to load page');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = useCallback(async () => {
    if (!organizationId) {
      toast.error('No organization selected');
      return false;
    }

    if (!pageTitle.trim()) {
      toast.error('Page title is required');
      return false;
    }

    setIsSaving(true);
    
    try {
      const dataToSave: PageData = {
        id: pageData?.id,
        title: pageTitle,
        slug: pageData?.slug || pageTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
        content: pageContent,
        organization_id: organizationId,
        published: isPublished,
        is_homepage: isHomepage,
        show_in_navigation: true
      };

      const savedPage = await savePage(dataToSave);
      
      if (savedPage) {
        setPageData(savedPage);
        setIsDirty(false);
        toast.success('Page saved successfully');
        
        // Update URL if this was a new page
        if (!pageId || pageId === 'new') {
          navigate(`/page-builder/${savedPage.id}`, { replace: true });
        }
        
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error saving page:', error);
      toast.error(error.message || 'Failed to save page');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [pageData, pageTitle, pageContent, organizationId, isPublished, isHomepage, pageId, navigate]);

  const handleContentChange = useCallback((newContent: any) => {
    setPageContent(newContent);
    setIsDirty(true);
  }, []);

  const handleTitleChange = useCallback((newTitle: string) => {
    setPageTitle(newTitle);
    setIsDirty(true);
  }, []);

  const handlePublish = useCallback(async () => {
    setIsPublished(true);
    setIsDirty(true);
    const success = await handleSave();
    if (success) {
      toast.success('Page published successfully');
    }
  }, [handleSave]);

  const handleUnpublish = useCallback(async () => {
    setIsPublished(false);
    setIsDirty(true);
    const success = await handleSave();
    if (success) {
      toast.success('Page unpublished successfully');
    }
  }, [handleSave]);

  const handleHomepageToggle = useCallback(() => {
    setIsHomepage(prev => !prev);
    setIsDirty(true);
  }, []);

  return {
    // Data
    pageData,
    pageTitle,
    pageContent,
    isPublished,
    isHomepage,
    organizationId,
    
    // State
    isSaving,
    isLoading,
    error,
    isDirty,
    
    // Actions
    handleSave,
    handleContentChange,
    handleTitleChange,
    handlePublish,
    handleUnpublish,
    handleHomepageToggle,
    setPageTitle,
    setIsPublished,
    setIsHomepage
  };
}
