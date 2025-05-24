
import { useState, useCallback } from 'react';
import { PageElement } from '@/services/pages';

interface UsePageElementsProps {
  initialElements?: PageElement[];
  onSelectedElementChange?: (id: string | null) => void;
  selectedElementId: string | null;
}

export const usePageElements = ({ 
  initialElements = [], 
  onSelectedElementChange,
  selectedElementId
}: UsePageElementsProps) => {
  const [pageElements, setPageElements] = useState<PageElement[]>(initialElements);

  // Simplified methods for Editor.js integration
  const addElement = useCallback((element: Omit<PageElement, 'id'>) => {
    console.log("addElement: Use Editor.js interface to add blocks");
  }, []);

  const updateElement = useCallback((id: string, updates: Partial<PageElement>) => {
    console.log("updateElement: Use Editor.js interface to edit blocks");
  }, []);

  const removeElement = useCallback((id: string) => {
    console.log("removeElement: Use Editor.js interface to delete blocks");
  }, []);

  const reorderElements = useCallback((startIndex: number, endIndex: number) => {
    console.log("reorderElements: Use Editor.js interface to drag and reorder blocks");
  }, []);

  return {
    pageElements,
    setPageElements,
    addElement,
    updateElement,
    removeElement,
    reorderElements
  };
};
