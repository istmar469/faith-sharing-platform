
import { Page } from '@/services/pages';

// EditorJS data format interface
export interface EditorJSData {
  time?: number;
  blocks: Array<{
    id?: string;
    type: string;
    data: any;
  }>;
  version?: string;
}

// Types for the page builder context
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
  pageElements: EditorJSData | null;
  setPageElements: (elements: EditorJSData | null) => void;
  addElement: (element: any) => void;
  updateElement: (id: string, updates: any) => void;
  removeElement: (id: string) => void;
  reorderElements: (startIndex: number, endIndex: number) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  organizationId: string | null;
  setOrganizationId: (id: string) => void;
  savePage: () => Promise<PageData | null>;
  isSaving: boolean;
  isOrgLoading: boolean;
  lastSaveTime: Date | null;
  subdomain: string | null;
  openPreviewInNewWindow: () => void;
}

// Page data type with EditorJS content
export type PageData = {
  id?: string;
  title: string;
  slug: string;
  content: EditorJSData;
  meta_title?: string;
  meta_description?: string;
  parent_id?: string | null;
  organization_id: string;
  is_homepage: boolean;
  published: boolean;
  show_in_navigation: boolean;
  created_at?: string;
  updated_at?: string;
};

// Props for the PageBuilderProvider
export interface PageBuilderProviderProps {
  children: React.ReactNode;
  initialPageData?: Page | null;
}
