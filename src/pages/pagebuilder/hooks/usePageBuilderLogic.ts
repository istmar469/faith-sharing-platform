import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import { usePageData } from '@/components/pagebuilder/hooks/usePageData';
import { usePageSave } from '@/hooks/usePageSave';
import { PageData } from '@/services/pageService';

export function usePageBuilderLogic() {
  const { pageId } = useParams<{ pageId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { organizationId: contextOrgId, isSubdomainAccess, isContextReady } = useTenantContext();
  
  // Get organization ID from URL params if not available from context
  const urlOrgId = searchParams.get('organization_id');
  const organizationId = contextOrgId || urlOrgId;
  
  const { pageData, setPageData, loading: pageLoading, error: pageError } = usePageData(pageId);
  const { handleSave, isSaving } = usePageSave();

  const [title, setTitle] = useState('');
  const [published, setPublished] = useState(false);
  const [isHomepage, setIsHomepage] = useState(false);
  const [content, setContent] = useState<any>(null);
  const [showMobileSettings, setShowMobileSettings] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);

  // Determine loading and error states
  const loading = !isContextReady || (organizationId && pageLoading);
  
  let error: string | null = null;
  if (isContextReady && !organizationId && !isSubdomainAccess) {
    // Root domain access without organization - need organization selection
    error = 'organization_selection_required';
  } else if (pageError) {
    error = pageError;
  } else if (contextError) {
    error = contextError;
  }

  console.log('usePageBuilderLogic: Context state', {
    isContextReady,
    contextOrgId,
    urlOrgId,
    organizationId,
    isSubdomainAccess,
    loading,
    error,
    pageId
  });

  // Update local state when pageData loads
  useEffect(() => {
    if (pageData) {
      console.log('usePageBuilderLogic: Page data loaded', {
        id: pageData.id,
        title: pageData.title,
        published: pageData.published
      });
      setTitle(pageData.title);
      setPublished(pageData.published);
      setIsHomepage(pageData.is_homepage);
      setContent(pageData.content);
    }
  }, [pageData]);

  // Validate organization access when context is ready
  useEffect(() => {
    if (isContextReady && organizationId) {
      // Clear any previous context errors
      setContextError(null);
    }
  }, [isContextReady, organizationId]);

  const handleSavePage = async () => {
    console.log('usePageBuilderLogic: Save triggered', {
      organizationId,
      title,
      hasContent: !!content,
      pageId
    });

    if (!organizationId) {
      console.error('usePageBuilderLogic: No organization ID available');
      setContextError('Organization context is required to save pages');
      return;
    }

    if (!title.trim()) {
      console.error('usePageBuilderLogic: Title is empty');
      setContextError('Page title is required');
      return;
    }

    const pageDataToSave: PageData = {
      id: pageData?.id,
      title,
      slug: pageData?.slug || title.toLowerCase().replace(/\s+/g, '-'),
      content: content || { content: [], root: {} },
      organization_id: organizationId,
      published,
      show_in_navigation: true,
      is_homepage: isHomepage
    };

    console.log('usePageBuilderLogic: Saving page data', pageDataToSave);

    try {
      const savedPage = await handleSave(pageDataToSave);
      if (savedPage) {
        console.log('usePageBuilderLogic: Save successful', savedPage);
        setPageData(savedPage);
        
        // Navigate to the saved page with page ID if it's new
        if (!pageId && savedPage.id) {
          console.log('usePageBuilderLogic: Navigating to new page URL with ID', savedPage.id);
          // For subdomain access, keep the URL simple
          const newUrl = isSubdomainAccess 
            ? `/page-builder/${savedPage.id}`
            : organizationId === contextOrgId 
              ? `/page-builder/${savedPage.id}`
              : `/page-builder/${savedPage.id}?organization_id=${organizationId}`;
          navigate(newUrl, { replace: true });
        }
      }
    } catch (error) {
      console.error('usePageBuilderLogic: Save failed', error);
      setContextError('Failed to save page. Please try again.');
    }
  };

  const handlePreview = () => {
    console.log('usePageBuilderLogic: Preview triggered', {
      organizationId,
      isSubdomainAccess,
      published
    });

    if (!organizationId) {
      console.error('usePageBuilderLogic: No organization ID for preview');
      setContextError('Organization context is required for preview');
      return;
    }
    
    // For subdomain access, preview on the current domain
    // For root domain, open the organization's subdomain if available
    const baseUrl = window.location.origin;
    let previewUrl = baseUrl;
    
    console.log('usePageBuilderLogic: Opening preview URL:', previewUrl);
    window.open(previewUrl, '_blank');
  };

  const handleBackToDashboard = () => {
    console.log('usePageBuilderLogic: Back to dashboard triggered', {
      organizationId,
      isSubdomainAccess
    });

    if (isSubdomainAccess) {
      // For subdomain access, go back to the subdomain root
      navigate('/');
    } else if (organizationId) {
      navigate(`/dashboard/${organizationId}`);
    } else {
      navigate('/dashboard');
    }
  };

  return {
    // State
    pageId,
    organizationId,
    isSubdomainAccess,
    loading,
    error,
    title,
    published,
    isHomepage,
    content,
    pageData,
    isSaving,
    showMobileSettings,
    
    // Handlers
    setTitle,
    setPublished,
    setIsHomepage,
    setContent,
    setShowMobileSettings,
    handleSavePage,
    handlePreview,
    handleBackToDashboard
  };
}
