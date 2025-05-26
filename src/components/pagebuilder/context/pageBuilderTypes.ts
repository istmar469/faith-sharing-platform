
// Updated types to use only Puck data format
export interface PuckData {
  content: Array<{
    type: string;
    props: any;
    readOnly?: boolean;
  }>;
  root: {
    props?: any;
    title?: string;
  };
}

export interface PageData {
  id?: string;
  title: string;
  slug: string;
  content: PuckData;
  published: boolean;
  show_in_navigation: boolean;
  is_homepage: boolean;
  organization_id: string;
  meta_title?: string;
  meta_description?: string;
  parent_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PageBuilderState {
  pageData: PageData | null;
  pageElements: PuckData;
  pageTitle: string;
  pageId: string | null;
  organizationId: string | null;
  isPublished: boolean;
  isSaving: boolean;
}
