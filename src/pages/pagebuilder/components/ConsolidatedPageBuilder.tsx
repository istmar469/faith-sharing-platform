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
    handleSave,
    handleContentChange,
    handleTitleChange,
    handlePublishToggle,
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

  const handlePublish = () => {
    if (!isPublished) {
      handlePublishToggle();
    }
    handleSave();
  };

  const handleUnpublish = () => {
    if (isPublished) {
      handlePublishToggle();
    }
    handleSave();
  };

  const handlePreview = (live: boolean = false) => {
    if (live) {
      // Live preview logic
      const livePreviewData = {
        title: pageTitle,
        content: pageContent.content, 
        root: pageContent.root,
      };
      localStorage.setItem('livePreviewData', JSON.stringify(livePreviewData));
      window.open('/preview/live?preview=true', '_blank');
    } else {
      // Preview saved page
      if (pageData?.id) {
        window.open(`/preview/${pageData.id}`, '_blank');
      } else {
        // For new pages, use live preview
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
      pageContent={pageContent}
      isPublished={isPublished}
      isHomepage={isHomepage}
      organizationId={organizationId!}
      isSaving={isSaving}
      isDirty={isDirty}
      isMobile={isMobile}
      isSubdomainAccess={isSubdomainAccess}
      onContentChange={handleContentChange}
      onTitleChange={handleTitleChange}
      onHomepageChange={handleHomepageToggle}
      onSave={handleSave}
      onPublish={handlePublish}
      onUnpublish={handleUnpublish}
      onBackToDashboard={handleBackToDashboard}
      onPreview={handlePreview}
    />
  );
};

export default ConsolidatedPageBuilder;
