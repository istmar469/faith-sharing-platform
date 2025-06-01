import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import { toast } from 'sonner';
import { PageData, savePage, getPage } from '@/services/pageService';
import { safeCastToPuckData, createDefaultPuckData } from '@/components/pagebuilder/utils/puckDataHelpers';
import { isMainDomain } from '@/utils/domain/domainDetectionUtils';
// import { supabase } from '@/integrations/supabase/client'; // No longer needed for fetching root org

const ROOT_DOMAIN_ORGANIZATION_ID = 'df5b8196-7bc4-44fd-b3cb-e559f67c2f84';

export function useConsolidatedPageBuilder() {
  const { pageId } = useParams<{ pageId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { organizationId: contextOrgId, isSubdomainAccess, isContextReady } = useTenantContext();
  
  const urlOrgId = searchParams.get('organization_id');
  
  const isRootDomain = isMainDomain(window.location.hostname);
  
  const organizationId = isRootDomain 
    ? ROOT_DOMAIN_ORGANIZATION_ID
    : (contextOrgId || urlOrgId);
  
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [pageTitle, setPageTitle] = useState(isRootDomain ? 'Home Page' : 'New Page');
  const [pageContent, setPageContent] = useState<any>(createDefaultPuckData());
  const [isPublished, setIsPublished] = useState(false);
  const [isHomepage, setIsHomepage] = useState(isRootDomain ? true : false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  console.log('useConsolidatedPageBuilder: Initializing', {
    pageId,
    organizationId,
    isContextReady,
    isSubdomainAccess,
    isRootDomain,
    hostname: window.location.hostname
  });

  // Removed useEffect for loadRootOrganization as we use a constant ID now

  useEffect(() => {
    const loadPageData = async () => {
      if (!isContextReady) return;
      
      // This condition should now correctly proceed for root domain as organizationId is set
      if (!organizationId && !isSubdomainAccess) { // Simplified from previous !isRootDomain check
        setError('organization_selection_required');
        setIsLoading(false);
        return;
      }

      if (pageId && pageId !== 'new') {
        try {
          console.log('Loading page data for ID:', pageId, 'Org:', organizationId);
          const data = await getPage(pageId); // Ensure getPage can fetch with the ROOT_DOMAIN_ORGANIZATION_ID if needed
          if (data) {
            // Optional: Add a check here if data.organization_id matches the current organizationId if pageId is for a specific org page accessed via root
            setPageData(data);
            setPageTitle(data.title);
            setPageContent(safeCastToPuckData(data.content));
            setIsPublished(data.published);
            setIsHomepage(data.is_homepage);
            setIsDirty(false);
            console.log('Page data loaded successfully');
          } else {
            // If it's a root domain and pageId is not found, it might be a new root page
            if (isRootDomain && (!pageId || pageId === 'new')) {
              const defaultContent = createDefaultPuckData();
              setPageContent(defaultContent);
              setIsHomepage(true);
              setPageTitle('Home Page');
              setPageData(null); // Explicitly null for new page
              setIsDirty(false);
            } else {
              setError('Page not found');
            }
          }
        } catch (err) {
          console.error('Error loading page:', err);
          setError('Failed to load page');
        }
      } else {
        const defaultContent = createDefaultPuckData();
        setPageContent(defaultContent);
        setIsDirty(false);
        if (isRootDomain) {
          setIsHomepage(true);
          setPageTitle('Home Page');
        }
      }
      
      setIsLoading(false);
    };

    loadPageData();
  }, [pageId, organizationId, isContextReady, isSubdomainAccess, isRootDomain]); // isLoadingRootOrg removed

  const handleContentChange = useCallback((newContent: any) => {
    console.log('Content changed from Puck editor');
    setPageContent(newContent);
    setIsDirty(true);
  }, []);

  const handleTitleChange = useCallback((newTitle: string) => {
    setPageTitle(newTitle);
    setIsDirty(true);
  }, []);

  const handleSave = useCallback(async (shouldPublish?: boolean) => {
    if (!organizationId) {
      toast.error('Organization ID is required'); // This should ideally not hit for root if ROOT_DOMAIN_ORGANIZATION_ID is set
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
        id: pageData?.id, // For root domain new page, this will be undefined
        title: pageTitle,
        slug: pageData?.slug || pageTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        content: pageContent,
        organization_id: organizationId, // This will be ROOT_DOMAIN_ORGANIZATION_ID for root
        published: finalPublished,
        show_in_navigation: !isRootDomain, 
        is_homepage: isHomepage
      };

      console.log('Saving page data:', dataToSave);
      const savedPage = await savePage(dataToSave);
      
      if (savedPage) {
        setPageData(savedPage);
        setIsPublished(savedPage.published);
        setIsDirty(false);
        
        if (!pageId || pageId === 'new') {
          const newUrl = isSubdomainAccess 
            ? `/page-builder/${savedPage.id}`
            : isRootDomain
              ? `/page-builder/${savedPage.id}` // Simple URL for root domain new page
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
  }, [organizationId, pageTitle, pageContent, pageData, isPublished, isHomepage, pageId, isSubdomainAccess, contextOrgId, navigate, isRootDomain]);

  const handlePublish = useCallback(() => handleSave(true), [handleSave]);
  const handleUnpublish = useCallback(() => handleSave(false), [handleSave]);

  const handleBackToDashboard = useCallback(() => {
    if (isRootDomain) {
      navigate('/'); 
    } else if (isSubdomainAccess) {
      navigate('/');
    } else if (organizationId) { // organizationId will be ROOT_DOMAIN_ORGANIZATION_ID on root
      navigate(`/dashboard/${organizationId}`);
    } else {
      navigate('/dashboard');
    }
  }, [isSubdomainAccess, organizationId, navigate, isRootDomain]);

  const handlePreview = useCallback((live: boolean = false) => {
    if (live) {
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
      // For root domain, if pageId is not set (new page), it won't have a preview URL yet
      if ((!pageId || pageId === 'new') && !isRootDomain) { 
        toast.info('Please save the page first to enable preview of saved content. Alternatively, use Live Preview.');
        return;
      }
      // For root, if pageId exists, preview it, otherwise it has to be saved first.
      // If it's a new root page, pageId will be undefined until first save.
      if (pageId && pageId !== 'new') {
        window.open(`/preview/${pageId}`, '_blank');
      } else if (isRootDomain) {
         toast.info('Please save the page first to enable preview. Alternatively, use Live Preview.');
      } else {
        // This case should ideally be caught by the first condition
        toast.info('Page needs an ID for preview.');
      }
    }
  }, [pageContent, pageTitle, pageId, isRootDomain]);

  return {
    pageData,
    pageTitle,
    pageContent,
    isPublished,
    isHomepage,
    organizationId,
    isSaving,
    isLoading,
    error,
    isDirty,
    isSubdomainAccess,
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
