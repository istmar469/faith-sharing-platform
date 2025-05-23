
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useTenantContext } from './TenantContext';
import { useNavigate } from 'react-router-dom';

type ViewMode = 'super_admin' | 'regular_admin';

interface ViewModeContextType {
  viewMode: ViewMode;
  toggleViewMode: () => void;
  setViewMode: (mode: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const { isSubdomainAccess, organizationId } = useTenantContext();
  const navigate = useNavigate();
  
  // Initialize from localStorage or default to 'regular_admin' when on a subdomain
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedMode = localStorage.getItem('churchos-view-mode');
    
    // If accessing via subdomain, default to regular_admin mode
    if (isSubdomainAccess) {
      return 'regular_admin';
    }
    
    return (savedMode as ViewMode) || 'super_admin';
  });

  useEffect(() => {
    // Enforce regular_admin mode when accessing via subdomain
    if (isSubdomainAccess && viewMode === 'super_admin') {
      console.log("Subdomain access detected, forcing regular_admin mode");
      setViewMode('regular_admin');
    } else {
      // Save view mode preference to localStorage when it changes
      localStorage.setItem('churchos-view-mode', viewMode);
      
      // Handle navigation based on mode change
      if (viewMode === 'super_admin' && organizationId) {
        // If switching to super admin and we have an org ID in context, go to super admin dashboard
        navigate('/dashboard');
      } else if (viewMode === 'regular_admin' && organizationId) {
        // If switching to regular admin and we have an org ID, go to tenant dashboard
        navigate(`/tenant-dashboard/${organizationId}`);
      }
    }
  }, [viewMode, isSubdomainAccess, organizationId, navigate]);

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
