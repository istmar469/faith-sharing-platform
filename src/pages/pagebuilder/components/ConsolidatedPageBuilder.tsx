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
    handleContentChange,
    handleTitleChange,
    setIsHomepage,
    handleSave,
    handlePublish,
    handleUnpublish,
    handleBackToDashboard,
    handlePreview
  } = useConsolidatedPageBuilder();

  const isMobile = useMediaQuery("(max-width: 768px)");

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
      onHomepageChange={setIsHomepage}
      onSave={handleSave}
      onPublish={handlePublish}
      onUnpublish={handleUnpublish}
      onBackToDashboard={handleBackToDashboard}
      onPreview={handlePreview}
    />
  );
};

export default ConsolidatedPageBuilder;
