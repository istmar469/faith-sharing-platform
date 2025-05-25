
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTenantContext } from '@/components/context/TenantContext';
import { usePageData } from '@/components/pagebuilder/hooks/usePageData';
import { usePageSave } from '@/hooks/usePageSave';
import { Button } from '@/components/ui/button';
import { PageData } from '@/services/pageService';
import { useMediaQuery } from '@/hooks/use-media-query';
import OrgAwareLink from '@/components/routing/OrgAwareLink';
import PageBuilderHeader from './pagebuilder/PageBuilderHeader';
import MobilePageBuilderHeader from '@/components/pagebuilder/components/MobilePageBuilderHeader';
import PageBuilderSidebar from './pagebuilder/PageBuilderSidebar';
import MobilePageSettings from '@/components/pagebuilder/components/MobilePageSettings';
import PageBuilderEditor from './pagebuilder/PageBuilderEditor';

const PageBuilderPage: React.FC = () => {
  const { pageId } = useParams<{ pageId?: string }>();
  const { organizationId, isSubdomainAccess } = useTenantContext();
  const { pageData, setPageData, loading, error } = usePageData(pageId);
  const { handleSave, isSaving } = usePageSave();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [title, setTitle] = useState('');
  const [published, setPublished] = useState(false);
  const [isHomepage, setIsHomepage] = useState(false);
  const [content, setContent] = useState<any>(null);
  const [showMobileSettings, setShowMobileSettings] = useState(false);

  // Update local state when pageData loads
  React.useEffect(() => {
    if (pageData) {
      setTitle(pageData.title);
      setPublished(pageData.published);
      setIsHomepage(pageData.is_homepage);
      setContent(pageData.content);
    }
  }, [pageData]);

  const handleSavePage = async () => {
    if (!organizationId || !title.trim()) return;

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

    const savedPage = await handleSave(pageDataToSave);
    if (savedPage) {
      setPageData(savedPage);
      // Navigate to the saved page if it's new
      if (!pageId && savedPage.id) {
        window.location.href = `/page-builder/${savedPage.id}`;
      }
    }
  };

  const handlePreview = () => {
    if (!organizationId) return;
    
    // Always open the homepage for preview since that's where published content appears
    const baseUrl = window.location.origin;
    let previewUrl;
    
    if (isSubdomainAccess) {
      // If on subdomain, just open the current domain root
      previewUrl = baseUrl;
    } else {
      // If not on subdomain, we need to construct the preview URL
      // For now, just open the current origin as the homepage should be visible there
      previewUrl = baseUrl;
    }
    
    console.log('Opening preview URL:', previewUrl);
    window.open(previewUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading page builder...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <OrgAwareLink to="/">
            <Button>Back to Home</Button>
          </OrgAwareLink>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header - Mobile vs Desktop */}
      {isMobile ? (
        <MobilePageBuilderHeader
          organizationId={organizationId}
          isSubdomainAccess={isSubdomainAccess}
          title={title}
          isSaving={isSaving}
          onSave={handleSavePage}
          onPreview={handlePreview}
          onSettingsOpen={() => setShowMobileSettings(true)}
        />
      ) : (
        <PageBuilderHeader
          organizationId={organizationId}
          isSubdomainAccess={isSubdomainAccess}
          title={title}
          isSaving={isSaving}
          onSave={handleSavePage}
          onPreview={handlePreview}
        />
      )}
      
      {/* Content Layout - Mobile vs Desktop */}
      {isMobile ? (
        // Mobile Layout: Full-width editor with bottom sheet settings
        <div className="h-[calc(100vh-60px)]">
          <PageBuilderEditor
            content={content}
            onContentChange={setContent}
          />
          
          {/* Mobile Settings Panel */}
          <MobilePageSettings
            open={showMobileSettings}
            onOpenChange={setShowMobileSettings}
            title={title}
            published={published}
            isHomepage={isHomepage}
            pageData={pageData}
            onTitleChange={setTitle}
            onPublishedChange={setPublished}
            onHomepageChange={setIsHomepage}
          />
        </div>
      ) : (
        // Desktop Layout: Grid with sidebar
        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <PageBuilderSidebar
            title={title}
            published={published}
            isHomepage={isHomepage}
            pageData={pageData}
            onTitleChange={setTitle}
            onPublishedChange={setPublished}
            onHomepageChange={setIsHomepage}
          />

          <PageBuilderEditor
            content={content}
            onContentChange={setContent}
          />
        </div>
      )}
    </div>
  );
};

export default PageBuilderPage;
