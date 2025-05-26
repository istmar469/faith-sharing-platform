
import React from 'react';
import { usePageBuilderLogic } from './pagebuilder/hooks/usePageBuilderLogic';
import PageBuilderLoadingState from './pagebuilder/components/PageBuilderLoadingState';
import PageBuilderErrorState from './pagebuilder/components/PageBuilderErrorState';
import PageBuilderWrapper from './pagebuilder/components/PageBuilderWrapper';
import OrganizationSelector from './pagebuilder/components/OrganizationSelector';
import RouteProtection from '@/components/routing/RouteProtection';

const PageBuilderPage: React.FC = () => {
  const {
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
    isPublishing,
    showMobileSettings,
    setTitle,
    setPublished,
    setIsHomepage,
    setContent,
    setShowMobileSettings,
    handleSavePage,
    handlePublish,
    handleUnpublish,
    handlePreview,
    handleBackToDashboard
  } = usePageBuilderLogic();

  if (loading) {
    return <PageBuilderLoadingState />;
  }

  // Handle organization selection requirement for root domain
  if (error === 'organization_selection_required') {
    return (
      <OrganizationSelector 
        onBackToDashboard={handleBackToDashboard}
      />
    );
  }

  if (error) {
    return (
      <PageBuilderErrorState 
        error={error} 
        onBackToDashboard={handleBackToDashboard} 
      />
    );
  }

  return (
    <RouteProtection requiredContext="organization" fallbackRoute="/dashboard">
      <PageBuilderWrapper
        organizationId={organizationId}
        isSubdomainAccess={isSubdomainAccess}
        title={title}
        published={published}
        isHomepage={isHomepage}
        content={content}
        pageData={pageData}
        isSaving={isSaving}
        isPublishing={isPublishing}
        showMobileSettings={showMobileSettings}
        onTitleChange={setTitle}
        onPublishedChange={setPublished}
        onHomepageChange={setIsHomepage}
        onContentChange={setContent}
        onSave={handleSavePage}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onPreview={handlePreview}
        onBackToDashboard={handleBackToDashboard}
        onMobileSettingsChange={setShowMobileSettings}
      />
    </RouteProtection>
  );
};

export default PageBuilderPage;
