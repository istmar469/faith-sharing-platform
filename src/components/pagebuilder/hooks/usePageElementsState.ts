
import { useState, useCallback } from 'react';
import { EditorJSData } from '../context/pageBuilderTypes';

export const usePageElementsState = (initialElements: EditorJSData | null = null) => {
  const [pageElements, setPageElements] = useState<EditorJSData | null>(initialElements);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Updated to match the context interface
  const setPageElementsWrapper = useCallback((elements: EditorJSData | null) => {
    setPageElements(elements);
  }, []);

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
    setPageElements: setPageElementsWrapper,
    selectedElementId,
    setSelectedElementId,
    addElement,
    updateElement,
    removeElement,
    reorderElements
  };
};
