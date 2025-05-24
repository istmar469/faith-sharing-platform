
import { useState, useEffect, useCallback, useRef } from 'react';
import { PageManager, PageManagerState } from '../managers/PageManager';

interface UsePageManagerProps {
  pageId: string | null;
  organizationId: string | null;
  isContextReady: boolean;
}

export const usePageManager = ({ pageId, organizationId, isContextReady }: UsePageManagerProps) => {
  const pageManagerRef = useRef<PageManager>();
  const [state, setState] = useState<PageManagerState>({
    isLoading: false,
    isAuthenticated: null,
    organizationId: null,
    pageData: null,
    error: null,
    isEditorReady: false,
    retryCount: 0
  });

  // Initialize PageManager
  useEffect(() => {
    if (!pageManagerRef.current) {
      pageManagerRef.current = new PageManager({
        maxRetries: 3,
        timeoutMs: 10000,
        retryDelayMs: 1000
      });

      // Subscribe to state changes
      const unsubscribe = pageManagerRef.current.subscribe((newState) => {
        setState(newState);
      });

      return () => {
        unsubscribe();
      };
    }
  }, []);

  // Initialize page when context is ready
  useEffect(() => {
    if (isContextReady && pageManagerRef.current && organizationId) {
      console.log("usePageManager: Context ready, initializing page");
      pageManagerRef.current.initializePage(pageId, organizationId);
    }
  }, [isContextReady, pageId, organizationId]);

  const handleEditorReady = useCallback(() => {
    if (pageManagerRef.current) {
      pageManagerRef.current.onEditorReady();
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (pageManagerRef.current) {
      return pageManagerRef.current.retry(pageId, organizationId);
    }
  }, [pageId, organizationId]);

  const reset = useCallback(() => {
    if (pageManagerRef.current) {
      pageManagerRef.current.reset();
    }
  }, []);

  return {
    ...state,
    handleEditorReady,
    handleRetry,
    reset,
    pageManager: pageManagerRef.current
  };
};
