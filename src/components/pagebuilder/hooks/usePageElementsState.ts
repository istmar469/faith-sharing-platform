
import { useState, useCallback } from 'react';
import { EditorJSData } from '../context/pageBuilderTypes';

export const usePageElementsState = (initialElements: EditorJSData | null = null) => {
  const [pageElements, setPageElements] = useState<EditorJSData | null>(initialElements);

  const setPageElementsWrapper = useCallback((elements: EditorJSData | null) => {
    setPageElements(elements);
  }, []);

  // Simplified API for Editor.js - these are no-ops since Editor.js handles block management
  const addElement = useCallback(() => {
    console.log("addElement: Use Editor.js interface to add blocks");
  }, []);

  const updateElement = useCallback(() => {
    console.log("updateElement: Use Editor.js interface to edit blocks");
  }, []);

  const removeElement = useCallback(() => {
    console.log("removeElement: Use Editor.js interface to delete blocks");
  }, []);

  const reorderElements = useCallback(() => {
    console.log("reorderElements: Use Editor.js interface to drag and reorder blocks");
  }, []);

  return {
    pageElements,
    setPageElements: setPageElementsWrapper,
    selectedElementId: null, // Not applicable for Editor.js
    setSelectedElementId: () => {}, // Not applicable for Editor.js
    addElement,
    updateElement,
    removeElement,
    reorderElements
  };
};
