
import { PageElement } from '@/services/pages';

// Add a new element to the page
export const addElement = (
  pageElements: PageElement[],
  element: Omit<PageElement, 'id'>
): PageElement[] => {
  const newElement = {
    ...element,
    id: Date.now().toString(), // Simple ID generation
  };
  return [...pageElements, newElement];
};

// Update an existing element
export const updateElement = (
  pageElements: PageElement[],
  id: string,
  updates: Partial<PageElement>
): PageElement[] => {
  return pageElements.map((element) =>
    element.id === id ? { ...element, ...updates } : element
  );
};

// Get all children IDs recursively
export const getChildrenIds = (
  pageElements: PageElement[],
  parentId: string
): string[] => {
  const directChildren = pageElements
    .filter(element => element.parentId === parentId)
    .map(element => element.id);
    
  const nestedChildren = directChildren.flatMap(childId => 
    getChildrenIds(pageElements, childId)
  );
  
  return [...directChildren, ...nestedChildren];
};

// Remove an element and all its children
export const removeElement = (
  pageElements: PageElement[],
  id: string
): PageElement[] => {
  // Find all children of this element
  const childrenIds = getChildrenIds(pageElements, id);
  
  // Remove the element and all its children
  return pageElements.filter((element) => 
    element.id !== id && !childrenIds.includes(element.id)
  );
};

// Reorder elements (for drag and drop functionality)
export const reorderElements = (
  pageElements: PageElement[],
  startIndex: number,
  endIndex: number
): PageElement[] => {
  const result = Array.from(pageElements);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};
