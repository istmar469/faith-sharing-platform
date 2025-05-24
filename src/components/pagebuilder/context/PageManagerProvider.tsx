
import React, { createContext, useContext, ReactNode } from 'react';
import { PageManager, PageManagerState } from '../managers/PageManager';
import { usePageManager } from '../hooks/usePageManager';

interface PageManagerContextType extends PageManagerState {
  handleEditorReady: () => void;
  handleRetry: () => Promise<void> | undefined;
  reset: () => void;
  pageManager: PageManager | undefined;
}

const PageManagerContext = createContext<PageManagerContextType | undefined>(undefined);

export const usePageManagerContext = () => {
  const context = useContext(PageManagerContext);
  if (!context) {
    throw new Error('usePageManagerContext must be used within a PageManagerProvider');
  }
  return context;
};

interface PageManagerProviderProps {
  children: ReactNode;
  pageId: string | null;
  organizationId: string | null;
  isContextReady: boolean;
}

export const PageManagerProvider: React.FC<PageManagerProviderProps> = ({
  children,
  pageId,
  organizationId,
  isContextReady
}) => {
  const pageManagerState = usePageManager({
    pageId,
    organizationId,
    isContextReady
  });

  return (
    <PageManagerContext.Provider value={pageManagerState}>
      {children}
    </PageManagerContext.Provider>
  );
};
