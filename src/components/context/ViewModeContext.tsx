
import React, { createContext, useState, useContext, useEffect } from 'react';

type ViewMode = 'super_admin' | 'regular_admin';

interface ViewModeContextType {
  viewMode: ViewMode;
  toggleViewMode: () => void;
  setViewMode: (mode: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  // Initialize from localStorage or default to 'regular_admin' when on a subdomain
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedMode = localStorage.getItem('churchos-view-mode');
    
    // If accessing via subdomain, default to regular_admin mode
    const isSubdomain = window.location.hostname !== 'localhost' && 
                        window.location.hostname.split('.').length > 2;
    
    if (isSubdomain) {
      return 'regular_admin';
    }
    
    return (savedMode as ViewMode) || 'super_admin';
  });

  useEffect(() => {
    // Save view mode preference to localStorage when it changes
    localStorage.setItem('churchos-view-mode', viewMode);
  }, [viewMode]);

  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === 'super_admin' ? 'regular_admin' : 'super_admin');
  };

  const value = {
    viewMode,
    toggleViewMode,
    setViewMode
  };

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
}
