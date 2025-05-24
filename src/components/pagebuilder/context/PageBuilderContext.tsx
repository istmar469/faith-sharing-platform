
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { PageBuilderContextType, PageBuilderProviderProps, EditorJSData } from './pageBuilderTypes';
import { usePageMetadata } from './usePageMetadata';
import { useTenantContext } from '@/components/context/TenantContext';
import { usePageSave } from '../hooks/usePageSave';
import { usePageInitialization } from '../hooks/usePageInitialization';

// Create the context with an undefined default value
const PageBuilderContext = createContext<PageBuilderContextType | undefined>(undefined);

// Custom hook to use the site builder context
export const usePageBuilder = () => {
  const context = useContext(PageBuilderContext);
  if (context === undefined) {
    throw new Error('usePageBuilder must be used within a PageBuilderProvider');
  }
  return context;
};

export const PageBuilderProvider: React.FC<PageBuilderProviderProps> = ({ children, initialPageData }) => {
  // Use tenant context for organization ID
  const { organizationId: tenantOrgId, subdomain } = useTenantContext();
  
  // Use custom hooks for different aspects of the page builder
  const metadata = usePageMetadata(initialPageData);
  const { 
    pageId, setPageId,
    pageTitle, setPageTitle,
    pageSlug, setPageSlug,
    metaTitle, setMetaTitle,
    metaDescription, setMetaDescription,
    parentId, setParentId,
    showInNavigation, setShowInNavigation,
    isPublished, setIsPublished,
    isHomepage, setIsHomepage
  } = metadata;
  
  // Editor.js content management
  const [pageElements, setPageElements] = useState<EditorJSData | null>(null);
  
  // State for UI and organization
  const [activeTab, setActiveTab] = useState<string>("general");
  const [organizationId, setOrganizationId] = useState<string | null>(
    initialPageData?.organization_id || tenantOrgId
  );

  // Page save functionality with EditorJSData
  const saveHook = usePageSave({
    pageId,
    setPageId,
    setPageSlug,
    organizationId,
    pageTitle,
    pageSlug,
    pageElements,
    metaTitle,
    metaDescription,
    parentId,
    showInNavigation,
    isHomepage,
    isPublished
  });

  const { handleSavePage, isSaving, lastSaveTime } = saveHook;

  // Preview functionality
  const openPreviewInNewWindow = useCallback(() => {
    if (pageId && organizationId) {
      const previewUrl = `/preview/${organizationId}/page/${pageId}?preview=true`;
      window.open(previewUrl, '_blank', 'width=1024,height=768');
    } else {
      console.error("Cannot preview page: Save page first");
    }
  }, [pageId, organizationId]);

  // Initialize page data with EditorJS format
  usePageInitialization({
    initialPageData,
    pageId,
    setPageId,
    setPageTitle,
    setPageSlug,
    setMetaTitle,
    setMetaDescription,
    setParentId,
    setShowInNavigation,
    setIsPublished,
    setIsHomepage,
    setPageElements,
    setOrganizationId
  });

  // Memoized context value with EditorJS types only
  const value = useMemo(() => ({
    pageId,
    setPageId,
    pageTitle,
    setPageTitle,
    pageSlug,
    setPageSlug,
    metaTitle,
    setMetaTitle,
    metaDescription,
    setMetaDescription,
    parentId,
    setParentId,
    showInNavigation,
    setShowInNavigation,
    isPublished,
    setIsPublished,
    isHomepage,
    setIsHomepage,
    pageElements,
    setPageElements,
    activeTab,
    setActiveTab,
    organizationId,
    setOrganizationId,
    savePage: handleSavePage,
    isSaving,
    isOrgLoading: false,
    lastSaveTime,
    subdomain,
    openPreviewInNewWindow
  }), [
    pageId, setPageId, pageTitle, setPageTitle, pageSlug, setPageSlug,
    metaTitle, setMetaTitle, metaDescription, setMetaDescription,
    parentId, setParentId, showInNavigation, setShowInNavigation,
    isPublished, setIsPublished, isHomepage, setIsHomepage,
    pageElements, setPageElements,
    activeTab, setActiveTab, 
    organizationId, setOrganizationId, handleSavePage, isSaving, lastSaveTime, 
    subdomain, openPreviewInNewWindow
  ]);

  return (
    <PageBuilderContext.Provider value={value}>
      {children}
    </PageBuilderContext.Provider>
  );
};
