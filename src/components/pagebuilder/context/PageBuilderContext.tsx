
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define our page element type
export interface PageElement {
  id: string;
  type: string;
  component: string;
  props?: Record<string, any>;
}

// Define the context state and handlers
interface PageBuilderContextType {
  pageTitle: string;
  setPageTitle: (title: string) => void;
  pageElements: PageElement[];
  addElement: (element: Omit<PageElement, 'id'>) => void;
  updateElement: (id: string, updates: Partial<PageElement>) => void;
  removeElement: (id: string) => void;
  reorderElements: (startIndex: number, endIndex: number) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
}

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
  const [pageTitle, setPageTitle] = useState<string>("New Page");
  const [pageElements, setPageElements] = useState<PageElement[]>([
    { id: '1', type: 'header', component: 'Hero Section' },
    { id: '2', type: 'text', component: 'Text Block' },
    { id: '3', type: 'image', component: 'Image Gallery' }
  ]);
  const [activeTab, setActiveTab] = useState<string>("elements");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Add a new element to the page
  const addElement = (element: Omit<PageElement, 'id'>) => {
    const newElement = {
      ...element,
      id: Date.now().toString(), // Simple ID generation
    };
    setPageElements([...pageElements, newElement]);
  };

  // Update an existing element
  const updateElement = (id: string, updates: Partial<PageElement>) => {
    setPageElements(
      pageElements.map((element) =>
        element.id === id ? { ...element, ...updates } : element
      )
    );
  };

  // Remove an element
  const removeElement = (id: string) => {
    setPageElements(pageElements.filter((element) => element.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  // Reorder elements (for drag and drop functionality)
  const reorderElements = (startIndex: number, endIndex: number) => {
    const result = Array.from(pageElements);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setPageElements(result);
  };

  const value: PageBuilderContextType = {
    pageTitle,
    setPageTitle,
    pageElements,
    addElement,
    updateElement,
    removeElement,
    reorderElements,
    activeTab,
    setActiveTab,
    selectedElementId,
    setSelectedElementId,
  };

  return (
    <PageBuilderContext.Provider value={value}>
      {children}
    </PageBuilderContext.Provider>
  );
};
