
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PageBuilderContextType } from './types';
import { PageElement } from '@/services/pages';
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
}

export const PageBuilderProvider: React.FC<PageBuilderProviderProps> = ({ children }) => {
  // State for page metadata
  const [pageId, setPageId] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState<string>("New Page");
  const [pageSlug, setPageSlug] = useState<string>("");
  const [metaTitle, setMetaTitle] = useState<string>("");
  const [metaDescription, setMetaDescription] = useState<string>("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [showInNavigation, setShowInNavigation] = useState<boolean>(true);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [isHomepage, setIsHomepage] = useState<boolean>(false);
  
  // State for page elements
  const [pageElements, setPageElements] = useState<PageElement[]>([]);
  
  // State for UI
  const [activeTab, setActiveTab] = useState<string>("elements");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  
  // Use our custom hooks
  const { organizationId, setOrganizationId, isLoading: isOrgLoading } = useOrganizationId();
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
    setPageElements(currentElements => addElementHelper(currentElements, element));
  };

  const handleUpdateElement = (id: string, updates: Partial<PageElement>) => {
    setPageElements(currentElements => updateElementHelper(currentElements, id, updates));
  };

  const handleRemoveElement = (id: string) => {
    const childrenIds = getChildrenIds(pageElements, id);
    setPageElements(currentElements => removeElementHelper(currentElements, id));
    
    if (selectedElementId === id || childrenIds.includes(selectedElementId || '')) {
      setSelectedElementId(null);
    }
  };

  const handleReorderElements = (startIndex: number, endIndex: number) => {
    setPageElements(currentElements => reorderElementsHelper(currentElements, startIndex, endIndex));
  };

  // Handle save with additional state updates
  const handleSavePage = async () => {
    if (!organizationId) {
      console.error("Cannot save page: No organization ID");
      return;
    }
    
    const savedPage = await savePage();
    if (savedPage) {
      setPageId(savedPage.id);
      setPageSlug(savedPage.slug);
    }
  };

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
