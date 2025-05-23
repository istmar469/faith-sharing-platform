
import { useState, useCallback } from 'react';
import { PageElement } from '@/services/pages';
import { 
  addElement as addElementHelper, 
  updateElement as updateElementHelper, 
  removeElement as removeElementHelper,
  reorderElements as reorderElementsHelper,
  getChildrenIds
} from './elementHelpers';

export const usePageBuilderElements = (initialElements: PageElement[] = []) => {
  const [pageElements, setPageElements] = useState<PageElement[]>(initialElements);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const handleAddElement = useCallback((element: Omit<PageElement, 'id'>) => {
    console.log("SiteBuilder: Adding element:", element);
    setPageElements(currentElements => addElementHelper(currentElements, element));
  }, []);

  const handleUpdateElement = useCallback((id: string, updates: Partial<PageElement>) => {
    console.log(`SiteBuilder: Updating element ${id} with:`, updates);
    setPageElements(currentElements => updateElementHelper(currentElements, id, updates));
  }, []);

  const handleRemoveElement = useCallback((id: string) => {
    console.log(`SiteBuilder: Removing element ${id}`);
    const childrenIds = getChildrenIds(pageElements, id);
    setPageElements(currentElements => removeElementHelper(currentElements, id));
    
    if (selectedElementId === id || childrenIds.includes(selectedElementId || '')) {
      setSelectedElementId(null);
    }
  }, [pageElements, selectedElementId]);

  const handleReorderElements = useCallback((startIndex: number, endIndex: number) => {
    console.log(`SiteBuilder: Reordering elements ${startIndex} to ${endIndex}`);
    setPageElements(currentElements => reorderElementsHelper(currentElements, startIndex, endIndex));
  }, []);

  return {
    pageElements,
    setPageElements,
    selectedElementId,
    setSelectedElementId,
    addElement: handleAddElement,
    updateElement: handleUpdateElement,
    removeElement: handleRemoveElement,
    reorderElements: handleReorderElements
  };
};
