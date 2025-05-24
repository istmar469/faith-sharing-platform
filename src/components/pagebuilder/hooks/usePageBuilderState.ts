
import { useState, useEffect, useCallback } from 'react';
import { PageData } from '../context/types';
import { loadPageData } from '../utils/loadPageData';
import { supabase } from "@/integrations/supabase/client";

interface UsePageBuilderStateProps {
  pageId: string | null;
  organizationId: string | null;
  isAuthenticated: boolean | null;
}

export const usePageBuilderState = ({ pageId, organizationId, isAuthenticated }: UsePageBuilderStateProps) => {
  const [initialPageData, setInitialPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageLoadError, setPageLoadError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showTemplatePrompt, setShowTemplatePrompt] = useState(false);

  // Load page data when authenticated
  useEffect(() => {
    if (isAuthenticated && organizationId) {
      const loadData = async () => {
        try {
          console.log("PageBuilder: Loading page data...");
          const pageDataStart = Date.now();
          const actualPageId = pageId && pageId !== ':pageId' ? pageId : null;
          
          const { pageData, error, showTemplatePrompt: showTemplate } = await loadPageData(actualPageId, organizationId);
          
          const pageDataTime = Date.now() - pageDataStart;
          console.log(`PageBuilder: Page data loaded in ${pageDataTime}ms`);
          
          if (error) {
            console.error("PageBuilder: Page data error:", error);
            setPageLoadError(error);
          } else {
            console.log("PageBuilder: Page data loaded successfully");
            setInitialPageData(pageData);
            setShowTemplatePrompt(showTemplate);
          }
          
          // Quick super admin check (non-blocking)
          setTimeout(async () => {
            try {
              const { data: isAdmin } = await Promise.race([
                supabase.rpc('direct_super_admin_check'),
                new Promise((resolve) => setTimeout(() => resolve({ data: false }), 1000))
              ]) as any;
              setIsSuperAdmin(!!isAdmin);
            } catch (err) {
              console.log("PageBuilder: Super admin check failed, defaulting to false");
              setIsSuperAdmin(false);
            }
          }, 0);
          
        } catch (err) {
          console.error("PageBuilder: Error loading page data:", err);
          setPageLoadError(`Error loading page data: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    }
  }, [isAuthenticated, organizationId, pageId]);

  const resetState = useCallback(() => {
    setInitialPageData(null);
    setIsLoading(true);
    setPageLoadError(null);
    setShowTemplatePrompt(false);
  }, []);

  return {
    initialPageData,
    isLoading,
    pageLoadError,
    isSuperAdmin,
    showTemplatePrompt,
    resetState
  };
};
