
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
  savePage: () => Promise<boolean>;
  loadPage: (pageId: string) => Promise<void>;
  createNewPage: () => void;
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

  const savePage = useCallback(async (): Promise<boolean> => {
    if (!state.organizationId) {
      toast.error('Organization ID is required to save page');
      return false;
    }

    setState(prev => ({ ...prev, isSaving: true }));

    try {
      const pageData = {
        title: state.pageTitle,
        content: state.pageElements,
        published: state.isPublished,
        organization_id: state.organizationId,
        show_in_navigation: true,
        is_homepage: false,
        slug: state.pageTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
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
        pageData: result.data,
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
  }, [state.pageTitle, state.pageElements, state.isPublished, state.organizationId, state.pageId]);

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
        pageData: data,
        pageElements: puckContent,
        pageTitle: data.title,
        pageId: data.id,
        isPublished: data.published
      }));
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
  }, []);

  const contextValue: PageBuilderContextType = {
    ...state,
    setPageElements,
    setPageTitle,
    setIsPublished,
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
