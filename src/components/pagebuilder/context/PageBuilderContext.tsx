
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

// Create the context with an undefined default value
const PageBuilderContext = createContext<PageBuilderContextType | undefined>(undefined);

// Custom hook to use the page builder context
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
  
  // Use our custom hooks
  const { 
    organizationId, 
    setOrganizationId, 
    isLoading: isOrgLoading 
  } = useOrganizationId(initialPageData?.organization_id);

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
    console.log("PageBuilderContext: Adding element:", element);
    setPageElements(currentElements => addElementHelper(currentElements, element));
  };

  const handleUpdateElement = (id: string, updates: Partial<PageElement>) => {
    console.log(`PageBuilderContext: Updating element ${id} with:`, updates);
    setPageElements(currentElements => updateElementHelper(currentElements, id, updates));
  };

  const handleRemoveElement = (id: string) => {
    console.log(`PageBuilderContext: Removing element ${id}`);
    const childrenIds = getChildrenIds(pageElements, id);
    setPageElements(currentElements => removeElementHelper(currentElements, id));
    
    if (selectedElementId === id || childrenIds.includes(selectedElementId || '')) {
      setSelectedElementId(null);
    }
  };

  const handleReorderElements = (startIndex: number, endIndex: number) => {
    console.log(`PageBuilderContext: Reordering elements ${startIndex} to ${endIndex}`);
    setPageElements(currentElements => reorderElementsHelper(currentElements, startIndex, endIndex));
  };

  // Handle save with additional state updates and debugging
  const handleSavePage = async () => {
    if (!organizationId) {
      console.error("PageBuilderContext: Cannot save page: No organization ID");
      return null;
    }
    
    console.log("PageBuilderContext: Starting page save operation with:", {
      pageId,
      organizationId,
      pageTitle,
      elementCount: pageElements.length
    });
    
    try {
      const savedPage = await savePage();
      
      if (savedPage) {
        console.log("PageBuilderContext: Page saved successfully:", {
          id: savedPage.id,
          title: savedPage.title,
          elementCount: savedPage.content.length
        });
        
        setPageId(savedPage.id);
        setPageSlug(savedPage.slug);
        return savedPage;
      } else {
        console.error("PageBuilderContext: Save operation returned no result");
        return null;
      }
    } catch (error) {
      console.error("PageBuilderContext: Error in handleSavePage:", error);
      return null;
    }
  };

  // Effect to handle initialPageData changes
  useEffect(() => {
    if (initialPageData) {
      console.log("PageBuilderContext: Initializing with page data:", initialPageData);
      
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
    isOrgLoading
  };

  return (
    <PageBuilderContext.Provider value={value}>
      {children}
    </PageBuilderContext.Provider>
  );
};
