
import React from 'react';
import { usePageBuilderLogic } from './pagebuilder/hooks/usePageBuilderLogic';
import PageBuilderLoadingState from './pagebuilder/components/PageBuilderLoadingState';
import PageBuilderErrorState from './pagebuilder/components/PageBuilderErrorState';
import PageBuilderContainer from './pagebuilder/components/PageBuilderContainer';

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
    showMobileSettings,
    setTitle,
    setPublished,
    setIsHomepage,
    setContent,
    setShowMobileSettings,
    handleSavePage,
    handlePreview,
    handleBackToDashboard
  } = usePageBuilderLogic();

  if (loading) {
    return <PageBuilderLoadingState />;
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
    <PageBuilderContainer
      organizationId={organizationId}
      isSubdomainAccess={isSubdomainAccess}
      title={title}
      published={published}
      isHomepage={isHomepage}
      content={content}
      pageData={pageData}
      isSaving={isSaving}
      showMobileSettings={showMobileSettings}
      onTitleChange={setTitle}
      onPublishedChange={setPublished}
      onHomepageChange={setIsHomepage}
      onContentChange={setContent}
      onSave={handleSavePage}
      onPreview={handlePreview}
      onBackToDashboard={handleBackToDashboard}
      onMobileSettingsChange={setShowMobileSettings}
    />
  );
};

export default PageBuilderPage;
