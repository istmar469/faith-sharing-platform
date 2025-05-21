
import { PageElement, Page } from '@/services/pages';

export interface PageBuilderContextType {
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
  pageElements: PageElement[];
  setPageElements: (elements: PageElement[]) => void;
  addElement: (element: Omit<PageElement, 'id'>) => void;
  updateElement: (id: string, updates: Partial<PageElement>) => void;
  removeElement: (id: string) => void;
  reorderElements: (startIndex: number, endIndex: number) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  organizationId: string | null;
  setOrganizationId: (id: string | null) => void;
  savePage: () => Promise<void>;
  isSaving: boolean;
}
