import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PageBuilderContextType } from './types';
import { Page, PageElement } from '@/services/pages';
import { 
  addElement as addElementHelper, 
  updateElement as updateElementHelper, 
  removeElement as removeElementHelper,
  reorderElements as reorderElementsHelper,
  getChildrenIds
} from './elementHelpers';
import { useSavePage } from './savePageHelpers';
import { useOrganizationId } from './useOrganizationId';
import { toast } from 'sonner';
import { useTenantContext } from '@/components/context/TenantContext';

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

interface PageBuilderProviderProps {
  children: ReactNode;
  initialPageData?: Page | null;
}

export const PageBuilderProvider: React.FC<PageBuilderProviderProps> = ({ children, initialPageData }) => {
  // Use tenant context for organization ID
  const { organizationId: tenantOrgId, subdomain } = useTenantContext();
  
  // State for page metadata
  const [pageId, setPageId] = useState<string | null>(initialPageData?.id || null);
  const [pageTitle, setPageTitle] = useState<string>(initialPageData?.title || "New Page");
  const [pageSlug, setPageSlug] = useState<string>(initialPageData?.slug || "");
  const [metaTitle, setMetaTitle] = useState<string>(initialPageData?.meta_title || "");
  const [metaDescription, setMetaDescription] = useState<string>(initialPageData?.meta_description || "");
  const [parentId, setParentId] = useState<string | null>(initialPageData?.parent_id || null);
  const [showInNavigation, setShowInNavigation] = useState<boolean>(initialPageData?.show_in_navigation || true);
  const [isPublished, setIsPublished] = useState<boolean>(initialPageData?.published || false);
  const [isHomepage, setIsHomepage] = useState<boolean>(initialPageData?.is_homepage || false);
  
  // State for page elements
  const [pageElements, setPageElements] = useState<PageElement[]>(initialPageData?.content || []);
  
  // State for UI
  const [activeTab, setActiveTab] = useState<string>("elements");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  
  // Use our custom hooks
  const { 
    organizationId, 
    setOrganizationId, 
    isLoading: isOrgLoading 
  } = useOrganizationId(initialPageData?.organization_id || tenantOrgId);

  const { savePage, isSaving } = useSavePage({
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

  // Element manipulation functions
  const handleAddElement = (element: Omit<PageElement, 'id'>) => {
    console.log("SiteBuilder: Adding element:", element);
    setPageElements(currentElements => addElementHelper(currentElements, element));
  };

  const handleUpdateElement = (id: string, updates: Partial<PageElement>) => {
    console.log(`SiteBuilder: Updating element ${id} with:`, updates);
    setPageElements(currentElements => updateElementHelper(currentElements, id, updates));
  };

  const handleRemoveElement = (id: string) => {
    console.log(`SiteBuilder: Removing element ${id}`);
    const childrenIds = getChildrenIds(pageElements, id);
    setPageElements(currentElements => removeElementHelper(currentElements, id));
    
    if (selectedElementId === id || childrenIds.includes(selectedElementId || '')) {
      setSelectedElementId(null);
    }
  };

  const handleReorderElements = (startIndex: number, endIndex: number) => {
    console.log(`SiteBuilder: Reordering elements ${startIndex} to ${endIndex}`);
    setPageElements(currentElements => reorderElementsHelper(currentElements, startIndex, endIndex));
  };

  // Open preview in new window
  const openPreviewInNewWindow = () => {
    if (!organizationId) {
      toast.error("Cannot preview: No organization ID available");
      return;
    }
    
    if (!pageId) {
      toast.warning("Please save the page first before previewing");
      return;
    }
    
    // Open preview in a new tab
    window.open(`/preview-domain/id-preview--${organizationId}?pageId=${pageId}&preview=true`, '_blank', 'width=1024,height=768');
  };

  // Handle save with additional state updates and debugging
  const handleSavePage = async () => {
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
      const savedPage = await savePage();
      
      if (savedPage) {
        console.log("SiteBuilder: Page saved successfully:", {
          id: savedPage.id,
          title: savedPage.title,
          elementCount: savedPage.content.length
        });
        
        toast.success("Page saved successfully!");
        setPageId(savedPage.id);
        setPageSlug(savedPage.slug);
        setLastSaveTime(new Date());
        return savedPage;
      } else {
        console.error("SiteBuilder: Save operation returned no result");
        toast.error("Failed to save page. Please try again.");
        return null;
      }
    } catch (error) {
      console.error("SiteBuilder: Error in handleSavePage:", error);
      toast.error("Error saving page: " + (error instanceof Error ? error.message : "Unknown error"));
      return null;
    }
  };

  // Effect to handle initialPageData changes
  useEffect(() => {
    if (initialPageData) {
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
  }, [initialPageData, setOrganizationId]);

  // Effect to use tenant context if available
  useEffect(() => {
    if (tenantOrgId && !organizationId && !initialPageData?.organization_id) {
      console.log("SiteBuilder: Setting organization ID from tenant context:", tenantOrgId);
      setOrganizationId(tenantOrgId);
    }
  }, [tenantOrgId, organizationId, initialPageData, setOrganizationId]);

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
    addElement: handleAddElement,
    updateElement: handleUpdateElement,
    removeElement: handleRemoveElement,
    reorderElements: handleReorderElements,
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
