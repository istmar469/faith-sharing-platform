
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useTenantContext } from './TenantContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { extractSubdomain, isDevelopmentEnvironment } from '@/utils/domainUtils';

type ViewMode = 'super_admin' | 'regular_admin';

interface ViewModeContextType {
  viewMode: ViewMode;
  toggleViewMode: () => void;
  setViewMode: (mode: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const tenant = useTenantContext();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get values from tenant context, safely
  const isSubdomainAccess = tenant?.isSubdomainAccess || false;
  const organizationId = tenant?.organizationId || null;
  
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
      
      // Only handle navigation if the organizationId is already available
      // (prevents premature navigation before context is fully loaded)
      if (organizationId) {
        handleNavigation();
      }
    }
  }, [viewMode, isSubdomainAccess, organizationId]);
  
  // Handle navigation based on view mode and current path
  const handleNavigation = () => {
    // Don't navigate during initial page load or if path contains diagnostic
    if (location.pathname === '/' || location.pathname.includes('/diagnostic')) {
      return;
    }
    
    // If switching to super admin mode and we're in a tenant-specific route
    if (viewMode === 'super_admin' && location.pathname.includes('/tenant-dashboard/')) {
      console.log("Switching to super admin mode - redirecting to super admin dashboard");
      navigate('/dashboard');
    } 
    // If switching to regular admin mode and we have an org ID
    else if (viewMode === 'regular_admin' && organizationId) {
      // Check if we're not already in tenant dashboard route
      if (!location.pathname.includes(`/tenant-dashboard/${organizationId}`)) {
        console.log("Switching to regular admin mode - redirecting to tenant dashboard");
        navigate(`/tenant-dashboard/${organizationId}`);
      }
    }
  };

  const toggleViewMode = () => {
    const newMode = viewMode === 'super_admin' ? 'regular_admin' : 'super_admin';
    setViewMode(newMode);
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
