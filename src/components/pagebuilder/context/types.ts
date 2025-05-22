
// Check if this file exists and create it if it doesn't
// If it does exist, just add the interface for Page if it's not there

import { PageElement } from '@/services/pages';

export interface PageData {
  id?: string;
  title: string;
  slug: string;
  content: PageElement[];
  meta_title?: string;
  meta_description?: string;
  parent_id?: string | null;
  organization_id: string;
  is_homepage?: boolean;
  published?: boolean;
  show_in_navigation?: boolean;
}

export interface PageBuilderContextType {
  // Page metadata
  pageId: string | null;
  setPageId: (id: string | null) => void;
  pageTitle: string;
  setPageTitle: (title: string) => void;
  pageSlug: string;
  setPageSlug: (slug: string) => void;
  metaTitle: string;
  setMetaTitle: (metaTitle: string) => void;
  metaDescription: string;
  setMetaDescription: (metaDescription: string) => void;
  parentId: string | null;
  setParentId: (id: string | null) => void;
  showInNavigation: boolean;
  setShowInNavigation: (show: boolean) => void;
  isPublished: boolean;
  setIsPublished: (published: boolean) => void;
  isHomepage: boolean;
  setIsHomepage: (isHomepage: boolean) => void;
  
  // Page elements
  pageElements: PageElement[];
  setPageElements: (elements: PageElement[]) => void;
  
  // Element manipulation
  addElement: (element: Omit<PageElement, 'id'>) => void;
  updateElement: (id: string, updates: Partial<PageElement>) => void;
  removeElement: (id: string) => void;
  reorderElements: (startIndex: number, endIndex: number) => void;
  
  // UI state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  
  // Organization
  organizationId: string | null;
  setOrganizationId: (id: string | null) => void;
  
  // Save functionality
  savePage: () => Promise<any>;
  isSaving: boolean;
  isOrgLoading: boolean;
}
