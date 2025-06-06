import React from 'react';
import { useConsolidatedPageBuilder } from '../hooks/useConsolidatedPageBuilder';
import { useMediaQuery } from '@/hooks/use-media-query';
import PageBuilderLoadingState from './PageBuilderLoadingState';
import PageBuilderErrorState from './PageBuilderErrorState';
import OrganizationSelector from './OrganizationSelector';
import ConsolidatedPageBuilderLayout from './ConsolidatedPageBuilderLayout';

const ConsolidatedPageBuilder: React.FC = () => {
  const {
    pageData,
    pageTitle,
    pageSlug,
    pageContent,
    isPublished,
    isHomepage,
    organizationId,
    isSaving,
    isLoading,
    error,
    isDirty,
    isSubdomainAccess,
    isRootDomain,
    saveStatus,
    lastSaveTime,
    handleSave,
    handleSaveFromPuck,
    handleContentChange,
    handleTitleChange,
    handleSlugChange,
    handleHomepageToggle
  } = useConsolidatedPageBuilder();

  const isMobile = useMediaQuery("(max-width: 768px)");

  // Helper functions to bridge interface
  const handleBackToDashboard = () => {
    if (isRootDomain) {
      window.location.href = '/'; 
    } else if (isSubdomainAccess) {
      window.location.href = '/';
    } else if (organizationId) {
      window.location.href = `/dashboard/${organizationId}`;
    } else {
      window.location.href = '/dashboard';
    }
  };

  const handlePreview = (live: boolean = false) => {
    console.log('ConsolidatedPageBuilder: Preview triggered', {
      live,
      pageTitle,
      pageContent,
      hasPageData: !!pageData,
      pageDataId: pageData?.id,
      pageSlug,
      organizationId
    });

    if (live) {
      // Live preview logic - ensure we have proper data structure
      const livePreviewData = {
        title: pageTitle || 'Untitled Page',
        content: pageContent?.content || [],
        root: pageContent?.root || {},
        organizationId: organizationId
      };
      
      console.log('ConsolidatedPageBuilder: Storing live preview data', livePreviewData);
      
      // Validate the data before storing
      if (!livePreviewData.title || !Array.isArray(livePreviewData.content)) {
        console.error('ConsolidatedPageBuilder: Invalid live preview data structure', livePreviewData);
        alert('Unable to preview: Invalid page data. Please add some content and try again.');
        return;
      }
      
      localStorage.setItem('livePreviewData', JSON.stringify(livePreviewData));
      
      // Add organization ID to preview URL for proper context
      const previewUrl = organizationId 
        ? `/preview/live?preview=true&org=${organizationId}`
        : '/preview/live?preview=true';
      
      console.log('ConsolidatedPageBuilder: Opening preview URL:', previewUrl);
      window.open(previewUrl, '_blank');
    } else {
      // Preview saved page by slug if available
      if (pageSlug && organizationId) {
        const savedPageUrl = `/${pageSlug}?preview=true&org=${organizationId}`;
        console.log('ConsolidatedPageBuilder: Opening saved page preview by slug:', savedPageUrl);
        window.open(savedPageUrl, '_blank');
      } else if (pageData?.id && organizationId) {
        // Fallback to preview by pageId if slug is missing
        const savedPageUrl = `/preview/${pageData.id}?org=${organizationId}`;
        console.log('ConsolidatedPageBuilder: Opening saved page preview by id:', savedPageUrl);
        window.open(savedPageUrl, '_blank');
      } else {
        // For new pages, use live preview
        console.log('ConsolidatedPageBuilder: No saved page, using live preview');
        handlePreview(true);
      }
    }
  };

  // Loading state
  if (isLoading) {
    return <PageBuilderLoadingState />;
  }

  // Organization selection required
  if (error === 'organization_selection_required') {
    return (
      <OrganizationSelector 
        onBackToDashboard={handleBackToDashboard}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <PageBuilderErrorState 
        error={error} 
        onBackToDashboard={handleBackToDashboard} 
      />
    );
  }

      return (
      <ConsolidatedPageBuilderLayout
        pageTitle={pageTitle}
        pageSlug={pageSlug}
        pageContent={pageContent}
        isPublished={isPublished}
        isHomepage={isHomepage}
        organizationId={organizationId!}
        isSaving={isSaving}
        isDirty={isDirty}
        isMobile={isMobile}
        isSubdomainAccess={isSubdomainAccess}
        saveStatus={saveStatus}
        lastSaveTime={lastSaveTime}
        onContentChange={handleContentChange}
        onSave={handleSaveFromPuck}
        onTitleChange={handleTitleChange}
        onSlugChange={handleSlugChange}
        onHomepageChange={handleHomepageToggle}
        onBackToDashboard={handleBackToDashboard}
        onPreview={handlePreview}
      />
    );
};

export default ConsolidatedPageBuilder;
