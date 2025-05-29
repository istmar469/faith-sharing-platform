import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import { toast } from 'sonner';
import { PageData, savePage, getPage } from '@/services/pageService';
import { safeCastToPuckData, createDefaultPuckData } from '@/components/pagebuilder/utils/puckDataHelpers';

export function useConsolidatedPageBuilder() {
  const { pageId } = useParams<{ pageId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { organizationId: contextOrgId, isSubdomainAccess, isContextReady } = useTenantContext();
  
  const urlOrgId = searchParams.get('organization_id');
  const organizationId = contextOrgId || urlOrgId;
  
  // Core page state
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

  console.log('useConsolidatedPageBuilder: Initializing', {
    pageId,
    organizationId,
    isContextReady,
    isSubdomainAccess
  });

  // Load page data
  useEffect(() => {
    const loadPageData = async () => {
      if (!isContextReady) return;
      
      if (!organizationId && !isSubdomainAccess) {
        setError('organization_selection_required');
        setIsLoading(false);
        return;
      }

      if (pageId && pageId !== 'new') {
        try {
          console.log('Loading page data for ID:', pageId);
          const data = await getPage(pageId);
          if (data) {
            setPageData(data);
            setPageTitle(data.title);
            setPageContent(safeCastToPuckData(data.content));
            setIsPublished(data.published);
            setIsHomepage(data.is_homepage);
            setIsDirty(false);
            console.log('Page data loaded successfully');
          } else {
            setError('Page not found');
          }
        } catch (err) {
          console.error('Error loading page:', err);
          setError('Failed to load page');
        }
      } else {
        // New page
        const defaultContent = createDefaultPuckData();
        setPageContent(defaultContent);
        setIsDirty(false);
      }
      
      setIsLoading(false);
    };

    loadPageData();
  }, [pageId, organizationId, isContextReady, isSubdomainAccess]);

  // Handle content changes from Puck editor
  const handleContentChange = useCallback((newContent: any) => {
    console.log('Content changed from Puck editor');
    setPageContent(newContent);
    setIsDirty(true);
  }, []);

  // Handle title changes
  const handleTitleChange = useCallback((newTitle: string) => {
    setPageTitle(newTitle);
    setIsDirty(true);
  }, []);

  // Save functionality
  const handleSave = useCallback(async (shouldPublish?: boolean) => {
    if (!organizationId) {
      toast.error('Organization ID is required');
      return false;
    }

    if (!pageTitle.trim()) {
      toast.error('Page title is required');
      return false;
    }

    setIsSaving(true);
    
    try {
      const finalPublished = shouldPublish !== undefined ? shouldPublish : isPublished;
      
      const dataToSave: PageData = {
        id: pageData?.id,
        title: pageTitle,
        slug: pageData?.slug || pageTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        content: pageContent,
        organization_id: organizationId,
        published: finalPublished,
        show_in_navigation: true,
        is_homepage: isHomepage
      };

      console.log('Saving page data:', dataToSave);
      const savedPage = await savePage(dataToSave);
      
      if (savedPage) {
        setPageData(savedPage);
        setIsPublished(savedPage.published);
        setIsDirty(false);
        
        // Navigate to saved page URL if it's new
        if (!pageId || pageId === 'new') {
          const newUrl = isSubdomainAccess 
            ? `/page-builder/${savedPage.id}`
            : `/page-builder/${savedPage.id}${organizationId !== contextOrgId ? `?organization_id=${organizationId}` : ''}`;
          navigate(newUrl, { replace: true });
        }
        
        if (shouldPublish !== undefined) {
          toast.success(finalPublished ? 'Page published successfully!' : 'Page unpublished successfully!');
        } else {
          toast.success('Page saved successfully!');
        }
        
        return true;
      }
    } catch (err) {
      console.error('Error saving page:', err);
      toast.error('Failed to save page');
    } finally {
      setIsSaving(false);
    }
    
    return false;
  }, [organizationId, pageTitle, pageContent, pageData, isPublished, isHomepage, pageId, isSubdomainAccess, contextOrgId, navigate]);

  // Publish/Unpublish
  const handlePublish = useCallback(() => handleSave(true), [handleSave]);
  const handleUnpublish = useCallback(() => handleSave(false), [handleSave]);

  // Navigation
  const handleBackToDashboard = useCallback(() => {
    if (isSubdomainAccess) {
      navigate('/');
    } else if (organizationId) {
      navigate(`/dashboard/${organizationId}`);
    } else {
      navigate('/dashboard');
    }
  }, [isSubdomainAccess, organizationId, navigate]);

  // Preview
  const handlePreview = useCallback((live: boolean = false) => {
    if (live) {
      // Live preview for unsaved changes
      if (!pageContent || !pageTitle) {
        toast.error('Cannot generate live preview: Page content or title is missing.');
        return;
      }
      const livePreviewData = {
        title: pageTitle,
        content: pageContent.content, 
        root: pageContent.root,
      };
      localStorage.setItem('livePreviewData', JSON.stringify(livePreviewData));
      window.open('/preview/live?preview=true', '_blank');
    } else {
      // Preview for saved content
      if (!pageId || pageId === 'new') {
        toast.info('Please save the page first to enable preview of saved content. Alternatively, use Live Preview.');
        return;
      }
      window.open(`/preview/${pageId}`, '_blank');
    }
  }, [pageContent, pageTitle, pageId]);

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
    isSubdomainAccess,
    
    // Handlers
    handleContentChange,
    handleTitleChange,
    setIsHomepage,
    handleSave,
    handlePublish,
    handleUnpublish,
    handleBackToDashboard,
    handlePreview
  };
}
