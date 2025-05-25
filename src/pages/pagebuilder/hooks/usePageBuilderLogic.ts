
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import { usePageData } from '@/components/pagebuilder/hooks/usePageData';
import { usePageSave } from '@/hooks/usePageSave';
import { PageData } from '@/services/pageService';

export function usePageBuilderLogic() {
  const { pageId } = useParams<{ pageId?: string }>();
  const navigate = useNavigate();
  const { organizationId, isSubdomainAccess } = useTenantContext();
  const { pageData, setPageData, loading, error } = usePageData(pageId);
  const { handleSave, isSaving } = usePageSave();

  const [title, setTitle] = useState('');
  const [published, setPublished] = useState(false);
  const [isHomepage, setIsHomepage] = useState(false);
  const [content, setContent] = useState<any>(null);
  const [showMobileSettings, setShowMobileSettings] = useState(false);

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

  const handleSavePage = async () => {
    console.log('usePageBuilderLogic: Save triggered', {
      organizationId,
      title,
      hasContent: !!content,
      pageId
    });

    if (!organizationId) {
      console.error('usePageBuilderLogic: No organization ID available');
      return;
    }

    if (!title.trim()) {
      console.error('usePageBuilderLogic: Title is empty');
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
          navigate(`/page-builder/${savedPage.id}`, { replace: true });
        }
      }
    } catch (error) {
      console.error('usePageBuilderLogic: Save failed', error);
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
      return;
    }
    
    const baseUrl = window.location.origin;
    let previewUrl;
    
    if (isSubdomainAccess) {
      previewUrl = baseUrl;
    } else {
      previewUrl = baseUrl;
    }
    
    console.log('usePageBuilderLogic: Opening preview URL:', previewUrl);
    window.open(previewUrl, '_blank');
  };

  const handleBackToDashboard = () => {
    console.log('usePageBuilderLogic: Back to dashboard triggered', {
      organizationId,
      isSubdomainAccess
    });

    if (isSubdomainAccess) {
      window.location.href = '/';
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
