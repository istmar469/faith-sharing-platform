import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { PageBuilderContextType, PageBuilderProviderProps, PageData } from './pageBuilderTypes';
import { usePageMetadata } from './usePageMetadata';
import { usePagePreview } from './usePagePreview';
import { savePage } from '@/services/pages';
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
  
  // Element management - store the Editor.js content
  const [pageElements, setPageElements] = useState<any[]>(initialPageData?.content?.blocks || []);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  
  // State for UI
  const [activeTab, setActiveTab] = useState<string>("general");
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(
    initialPageData?.organization_id || tenantOrgId
  );

  // Simplified page save logic
  const [isSaving, setIsSaving] = useState(false);

  // Handle save with proper Editor.js content format
  const handleSavePage = useCallback(async () => {
    if (!organizationId) {
      console.error("PageBuilder: Cannot save page: No organization ID");
      toast.error("Cannot save page: Missing organization ID");
      return null;
    }
    
    if (isSaving) {
      console.log("PageBuilder: Save operation already in progress, skipping");
      return null;
    }
    
    console.log("PageBuilder: Starting page save operation");
    setIsSaving(true);
    
    try {
      // Format the content to match expected structure
      const contentToSave = {
        blocks: pageElements
      };
      
      // Create the page data object
      const pageData = {
        id: pageId,
        title: pageTitle,
        slug: pageSlug || pageTitle.toLowerCase().replace(/\s+/g, '-'),
        content: contentToSave,
        meta_title: metaTitle,
        meta_description: metaDescription,
        parent_id: parentId,
        show_in_navigation: showInNavigation,
        is_homepage: isHomepage,
        published: isPublished,
        organization_id: organizationId,
      };
      
      // Save the page
      const savedPage = await savePage(pageData);
      
      if (savedPage) {
        console.log("PageBuilder: Page saved successfully");
        setPageId(savedPage.id);
        setPageSlug(savedPage.slug);
        setLastSaveTime(new Date());
        toast.success("Page saved successfully");
        return savedPage;
      }
      
      return null;
    } catch (error) {
      console.error("PageBuilder: Error saving page:", error);
      toast.error("Error saving page: " + (error instanceof Error ? error.message : "Unknown error"));
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [
    organizationId, isSaving, pageId, pageTitle, pageSlug, 
    pageElements, metaTitle, metaDescription, parentId, 
    showInNavigation, isHomepage, isPublished, setPageId, setPageSlug
  ]);

  // Preview functionality
  const openPreviewInNewWindow = useCallback(() => {
    if (pageId && organizationId) {
      const previewUrl = `/preview/${organizationId}/page/${pageId}?preview=true`;
      window.open(previewUrl, '_blank', 'width=1024,height=768');
    } else {
      toast.error("Cannot preview page: Save page first");
    }
  }, [pageId, organizationId]);

  // Effect to handle initialPageData changes
  useEffect(() => {
    if (initialPageData && !pageId) {
      console.log("PageBuilder: Initializing with page data");
      
      setPageId(initialPageData.id || null);
      setPageTitle(initialPageData.title || "New Page");
      setPageSlug(initialPageData.slug || "");
      setMetaTitle(initialPageData.meta_title || "");
      setMetaDescription(initialPageData.meta_description || "");
      setParentId(initialPageData.parent_id || null);
      setShowInNavigation(initialPageData.show_in_navigation || true);
      setIsPublished(initialPageData.published || false);
      setIsHomepage(initialPageData.is_homepage || false);
      
      // Handle Editor.js content format
      if (initialPageData.content) {
        if (Array.isArray(initialPageData.content)) {
          // Old format - array of elements
          setPageElements(initialPageData.content);
        } else if (initialPageData.content.blocks) {
          // Editor.js format - object with blocks array
          setPageElements(initialPageData.content.blocks);
        } else {
          // Empty content
          setPageElements([]);
        }
      } else {
        setPageElements([]);
      }
      
      if (initialPageData.organization_id) {
        setOrganizationId(initialPageData.organization_id);
      }
    }
  }, [initialPageData, pageId, setPageElements, setPageId, 
      setPageTitle, setPageSlug, setMetaTitle, setMetaDescription, setParentId, 
      setShowInNavigation, setIsPublished, setIsHomepage]);

  // Memoized context value
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
    // Simplified API - no longer need element manipulation methods
    addElement: () => {},
    updateElement: () => {},
    removeElement: () => {},
    reorderElements: () => {},
    activeTab,
    setActiveTab,
    selectedElementId,
    setSelectedElementId,
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
    pageElements, setPageElements, activeTab, setActiveTab, 
    selectedElementId, setSelectedElementId, organizationId, 
    setOrganizationId, handleSavePage, isSaving, lastSaveTime, 
    subdomain, openPreviewInNewWindow
  ]);

  return (
    <PageBuilderContext.Provider value={value}>
      {children}
    </PageBuilderContext.Provider>
  );
};
