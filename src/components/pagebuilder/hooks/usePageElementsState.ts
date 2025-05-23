
import { useState, useCallback } from 'react';

export const usePageElementsState = (initialElements: any[] = []) => {
  const [pageElements, setPageElements] = useState<any[]>(initialElements);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Simplified API - no longer need complex element manipulation methods for Editor.js
  const addElement = useCallback(() => {
    // No-op for Editor.js integration
  }, []);

  const updateElement = useCallback(() => {
    // No-op for Editor.js integration
  }, []);

  const removeElement = useCallback(() => {
    // No-op for Editor.js integration
  }, []);

  const reorderElements = useCallback(() => {
    // No-op for Editor.js integration
  }, []);

  return {
    pageElements,
    setPageElements,
    selectedElementId,
    setSelectedElementId,
    addElement,
    updateElement,
    removeElement,
    reorderElements
  };
};
