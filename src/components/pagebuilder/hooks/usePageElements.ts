
import { useState, useCallback } from 'react';
import { PageElement } from '@/services/pages';
import { 
  addElement as addElementHelper, 
  updateElement as updateElementHelper, 
  removeElement as removeElementHelper,
  reorderElements as reorderElementsHelper,
  getChildrenIds
} from '../context/elementHelpers';

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

  const addElement = useCallback((element: Omit<PageElement, 'id'>) => {
    console.log("Adding element:", element);
    setPageElements(currentElements => addElementHelper(currentElements, element));
  }, []);

  const updateElement = useCallback((id: string, updates: Partial<PageElement>) => {
    console.log(`Updating element ${id} with:`, updates);
    setPageElements(currentElements => updateElementHelper(currentElements, id, updates));
  }, []);

  const removeElement = useCallback((id: string) => {
    console.log(`Removing element ${id}`);
    const childrenIds = getChildrenIds(pageElements, id);
    setPageElements(currentElements => removeElementHelper(currentElements, id));
    
    // If the currently selected element is being removed or is a child of the removed element,
    // clear the selection
    if (selectedElementId === id || childrenIds.includes(selectedElementId || '')) {
      onSelectedElementChange?.(null);
    }
  }, [pageElements, selectedElementId, onSelectedElementChange]);

  const reorderElements = useCallback((startIndex: number, endIndex: number) => {
    console.log(`Reordering elements ${startIndex} to ${endIndex}`);
    setPageElements(currentElements => reorderElementsHelper(currentElements, startIndex, endIndex));
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
