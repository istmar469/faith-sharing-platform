
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PageBuilderContextType, PageBuilderProviderProps, PageData } from './pageBuilderTypes';
import { usePageBuilderElements } from './usePageBuilderElements';
import { usePageMetadata } from './usePageMetadata';
import { usePagePreview } from './usePagePreview';
import { useSavePage } from './savePageHelpers';
import { useOrganizationId } from './useOrganizationId';
import { useTenantContext } from '@/components/context/TenantContext';
import { toast } from 'sonner';

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
  
  // Element management
  const { 
    pageElements, setPageElements,
    selectedElementId, setSelectedElementId,
    addElement, updateElement, removeElement, reorderElements
  } = usePageBuilderElements(initialPageData?.content || []);
  
  // State for UI
  const [activeTab, setActiveTab] = useState<string>("elements");
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  
  // Use our custom hooks
  const { 
    organizationId, 
    setOrganizationId, 
    isLoading: isOrgLoading 
  } = useOrganizationId(initialPageData?.organization_id || tenantOrgId);

  const { savePage: savePageService, isSaving } = useSavePage({
    pageId,
    pageTitle,
    pageSlug,
    metaTitle,
    metaDescription,
    parentId,
    showInNavigation,
    isPublished,
    isHomepage,
    pageElements,
    organizationId
  });

  const { openPreviewInNewWindow } = usePagePreview(organizationId, pageId);

  // Auto-switch to styles tab when element is selected
  useEffect(() => {
    if (selectedElementId && activeTab === "elements") {
      console.log("Auto-switching to styles tab for selected element:", selectedElementId);
      setActiveTab("styles");
    }
  }, [selectedElementId, activeTab]);

  // Handle save with additional state updates and debugging
  const handleSavePage = useCallback(async () => {
    if (!organizationId) {
      console.error("SiteBuilder: Cannot save page: No organization ID");
      toast.error("Cannot save page: Missing organization ID");
      return null;
    }
    
    if (isSaving) {
      console.log("SiteBuilder: Save operation already in progress, skipping");
      return null;
    }
    
    console.log("SiteBuilder: Starting page save operation with:", {
      pageId,
      organizationId,
      pageTitle,
      elementCount: pageElements.length
    });
    
    try {
      const savedPage = await savePageService();
      
      if (savedPage) {
        console.log("SiteBuilder: Page saved successfully:", {
          id: savedPage.id,
          title: savedPage.title,
          elementCount: savedPage.content.length
        });
        
        setPageId(savedPage.id);
        setPageSlug(savedPage.slug);
        setLastSaveTime(new Date());
        return savedPage;
      } else {
        console.error("SiteBuilder: Save operation returned no result");
        return null;
      }
    } catch (error) {
      console.error("SiteBuilder: Error in handleSavePage:", error);
      toast.error("Error saving page: " + (error instanceof Error ? error.message : "Unknown error"));
      return null;
    }
  }, [organizationId, isSaving, savePageService, pageId, pageTitle, pageElements, setPageId, setPageSlug]);

  // Effect to handle initialPageData changes (only once)
  useEffect(() => {
    if (initialPageData && !pageId) {
      console.log("SiteBuilder: Initializing with page data:", initialPageData);
      
      setPageId(initialPageData.id || null);
      setPageTitle(initialPageData.title || "New Page");
      setPageSlug(initialPageData.slug || "");
      setMetaTitle(initialPageData.meta_title || "");
      setMetaDescription(initialPageData.meta_description || "");
      setParentId(initialPageData.parent_id || null);
      setShowInNavigation(initialPageData.show_in_navigation || true);
      setIsPublished(initialPageData.published || false);
      setIsHomepage(initialPageData.is_homepage || false);
      setPageElements(initialPageData.content || []);
      
      if (initialPageData.organization_id) {
        setOrganizationId(initialPageData.organization_id);
      }
    }
  }, [initialPageData, pageId, setOrganizationId, setPageElements, setPageId, 
      setPageTitle, setPageSlug, setMetaTitle, setMetaDescription, setParentId, 
      setShowInNavigation, setIsPublished, setIsHomepage]);

  const value: PageBuilderContextType = {
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
    addElement,
    updateElement,
    removeElement,
    reorderElements,
    activeTab,
    setActiveTab,
    selectedElementId,
    setSelectedElementId,
    organizationId,
    setOrganizationId,
    savePage: handleSavePage,
    isSaving,
    isOrgLoading,
    lastSaveTime,
    subdomain,
    openPreviewInNewWindow
  };

  return (
    <PageBuilderContext.Provider value={value}>
      {children}
    </PageBuilderContext.Provider>
  );
};
