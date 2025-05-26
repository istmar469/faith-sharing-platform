
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { PageData, PageBuilderState, PuckData } from './pageBuilderTypes';
import { useTenantContext } from '@/components/context/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { safeCastToPuckData, createDefaultPuckData } from '../utils/puckDataHelpers';
import { toast } from 'sonner';

interface PageBuilderContextType extends PageBuilderState {
  setPageElements: (elements: PuckData) => void;
  setPageTitle: (title: string) => void;
  setIsPublished: (published: boolean) => void;
  setPageId: (id: string | null) => void;
  setPageSlug: (slug: string) => void;
  setMetaTitle: (title: string) => void;
  setMetaDescription: (description: string) => void;
  setParentId: (id: string | null) => void;
  setShowInNavigation: (show: boolean) => void;
  setIsHomepage: (isHomepage: boolean) => void;
  savePage: () => Promise<boolean>;
  loadPage: (pageId: string) => Promise<void>;
  createNewPage: () => void;
  pageSlug: string;
  metaTitle: string;
  metaDescription: string;
  showInNavigation: boolean;
  isHomepage: boolean;
  parentId: string | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const PageBuilderContext = createContext<PageBuilderContextType | undefined>(undefined);

interface PageBuilderProviderProps {
  children: React.ReactNode;
  initialPageData?: PageData | null;
}

export const PageBuilderProvider: React.FC<PageBuilderProviderProps> = ({
  children,
  initialPageData
}) => {
  const { organizationId } = useTenantContext();
  
  const [state, setState] = useState<PageBuilderState>({
    pageData: initialPageData || null,
    pageElements: initialPageData?.content || createDefaultPuckData(),
    pageTitle: initialPageData?.title || 'New Page',
    pageId: initialPageData?.id || null,
    organizationId: organizationId || null,
    isPublished: initialPageData?.published || false,
    isSaving: false
  });

  // Additional state properties
  const [pageSlug, setPageSlug] = useState(initialPageData?.slug || '');
  const [metaTitle, setMetaTitle] = useState(initialPageData?.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(initialPageData?.meta_description || '');
  const [showInNavigation, setShowInNavigation] = useState(initialPageData?.show_in_navigation ?? true);
  const [isHomepage, setIsHomepage] = useState(initialPageData?.is_homepage || false);
  const [parentId, setParentId] = useState<string | null>(initialPageData?.parent_id || null);
  const [activeTab, setActiveTab] = useState('pages');

  useEffect(() => {
    if (organizationId && !state.organizationId) {
      setState(prev => ({ ...prev, organizationId }));
    }
  }, [organizationId, state.organizationId]);

  const setPageElements = useCallback((elements: PuckData) => {
    setState(prev => ({ ...prev, pageElements: elements }));
  }, []);

  const setPageTitle = useCallback((title: string) => {
    setState(prev => ({ ...prev, pageTitle: title }));
  }, []);

  const setIsPublished = useCallback((published: boolean) => {
    setState(prev => ({ ...prev, isPublished: published }));
  }, []);

  const setPageId = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, pageId: id }));
  }, []);

  const savePage = useCallback(async (): Promise<boolean> => {
    if (!state.organizationId) {
      toast.error('Organization ID is required to save page');
      return false;
    }

    setState(prev => ({ ...prev, isSaving: true }));

    try {
      const pageData = {
        title: state.pageTitle,
        content: state.pageElements as any, // Cast to Json for database compatibility
        published: state.isPublished,
        organization_id: state.organizationId,
        show_in_navigation: showInNavigation,
        is_homepage: isHomepage,
        slug: pageSlug || state.pageTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
        meta_title: metaTitle || undefined,
        meta_description: metaDescription || undefined,
        parent_id: parentId
      };

      let result;
      if (state.pageId) {
        // Update existing page
        result = await supabase
          .from('pages')
          .update(pageData)
          .eq('id', state.pageId)
          .select()
          .single();
      } else {
        // Create new page
        result = await supabase
          .from('pages')
          .insert(pageData)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      setState(prev => ({
        ...prev,
        pageData: {
          ...result.data,
          content: safeCastToPuckData(result.data.content)
        } as PageData,
        pageId: result.data.id
      }));

      return true;
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Failed to save page');
      return false;
    } finally {
      setState(prev => ({ ...prev, isSaving: false }));
    }
  }, [state.pageTitle, state.pageElements, state.isPublished, state.organizationId, state.pageId, pageSlug, metaTitle, metaDescription, showInNavigation, isHomepage, parentId]);

  const loadPage = useCallback(async (pageId: string) => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('id', pageId)
        .single();

      if (error) throw error;

      const puckContent = safeCastToPuckData(data.content);
      
      setState(prev => ({
        ...prev,
        pageData: { ...data, content: puckContent } as PageData,
        pageElements: puckContent,
        pageTitle: data.title,
        pageId: data.id,
        isPublished: data.published
      }));

      setPageSlug(data.slug || '');
      setMetaTitle(data.meta_title || '');
      setMetaDescription(data.meta_description || '');
      setShowInNavigation(data.show_in_navigation ?? true);
      setIsHomepage(data.is_homepage || false);
      setParentId(data.parent_id || null);
    } catch (error) {
      console.error('Error loading page:', error);
      toast.error('Failed to load page');
    }
  }, []);

  const createNewPage = useCallback(() => {
    const defaultContent = createDefaultPuckData();
    setState(prev => ({
      ...prev,
      pageData: null,
      pageElements: defaultContent,
      pageTitle: 'New Page',
      pageId: null,
      isPublished: false
    }));

    setPageSlug('');
    setMetaTitle('');
    setMetaDescription('');
    setShowInNavigation(true);
    setIsHomepage(false);
    setParentId(null);
  }, []);

  const contextValue: PageBuilderContextType = {
    ...state,
    pageSlug,
    metaTitle,
    metaDescription,
    showInNavigation,
    isHomepage,
    parentId,
    activeTab,
    setPageElements,
    setPageTitle,
    setIsPublished,
    setPageId,
    setPageSlug,
    setMetaTitle,
    setMetaDescription,
    setParentId,
    setShowInNavigation,
    setIsHomepage,
    setActiveTab,
    savePage,
    loadPage,
    createNewPage
  };

  return (
    <PageBuilderContext.Provider value={contextValue}>
      {children}
    </PageBuilderContext.Provider>
  );
};

export const usePageBuilder = () => {
  const context = useContext(PageBuilderContext);
  if (!context) {
    throw new Error('usePageBuilder must be used within PageBuilderProvider');
  }
  return context;
};
