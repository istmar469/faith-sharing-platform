import React from 'react';
import { useConsolidatedPageBuilder } from '../hooks/useConsolidatedPageBuilder';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useNavigationPrompt } from '@/hooks/useNavigationPrompt';
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
    handleHomepageToggle,
    handlePublishToggle
  } = useConsolidatedPageBuilder();

  const isMobile = useMediaQuery("(max-width: 768px)");

  // Navigation prompt for unsaved changes
  const { navigateWithConfirmation } = useNavigationPrompt({
    when: isDirty,
    message: 'You have unsaved changes to your page. Are you sure you want to leave?'
  });

  // Helper functions to bridge interface
  const handleBackToDashboard = () => {
    if (isRootDomain) {
      navigateWithConfirmation('/'); 
    } else if (isSubdomainAccess) {
      navigateWithConfirmation('/');
    } else if (organizationId) {
      navigateWithConfirmation(`/dashboard/${organizationId}`);
    } else {
      navigateWithConfirmation('/dashboard');
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

    // Always use live preview for unsaved changes or when explicitly requested
    if (live || isDirty || !pageData?.id) {
      // Live preview logic - ensure we have proper data structure
      const livePreviewData = {
        title: pageTitle || 'Untitled Page',
        content: pageContent || { content: [], root: {} },
        organizationId: organizationId
      };
      
      console.log('ConsolidatedPageBuilder: Storing live preview data', livePreviewData);
      
      // Validate the data before storing
      if (!livePreviewData.title) {
        console.error('ConsolidatedPageBuilder: Invalid live preview data - no title');
        alert('Unable to preview: Please add a page title and try again.');
        return;
      }
      
      localStorage.setItem('livePreviewData', JSON.stringify(livePreviewData));
      
      // Add organization ID to preview URL for proper context
      const previewUrl = organizationId 
        ? `/preview/live?preview=true&org=${organizationId}`
        : '/preview/live?preview=true';
      
      console.log('ConsolidatedPageBuilder: Opening live preview URL:', previewUrl);
      window.open(previewUrl, '_blank');
    } else {
      // Preview saved page - ensure we save first if there are changes
      if (isDirty) {
        console.log('ConsolidatedPageBuilder: Saving before preview');
        handleSave().then(() => {
          // After save, try preview again
          setTimeout(() => handlePreview(false), 500);
        }).catch((error) => {
          console.error('ConsolidatedPageBuilder: Failed to save before preview', error);
          // Fallback to live preview
          handlePreview(true);
        });
        return;
      }

      // Use the page ID for preview if available
      if (pageData?.id && organizationId) {
        const savedPageUrl = `/preview/${pageData.id}?preview=true&org=${organizationId}`;
        console.log('ConsolidatedPageBuilder: Opening saved page preview by id:', savedPageUrl);
        window.open(savedPageUrl, '_blank');
      } else {
        // Fallback to live preview
        console.log('ConsolidatedPageBuilder: No saved page ID, using live preview');
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
        pageId={pageData?.id}
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
        onPublishToggle={handlePublishToggle}
        onBackToDashboard={handleBackToDashboard}
        onPreview={handlePreview}
      />
    );
};

export default ConsolidatedPageBuilder;
