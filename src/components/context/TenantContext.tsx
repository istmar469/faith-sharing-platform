
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface TenantContextType {
  organizationId: string | null;
  organizationName: string | null;
  isSubdomainAccess: boolean;
  subdomain: string | null;
  setTenantContext: (id: string | null, name: string | null, isSubdomain: boolean) => void;
  getOrgAwarePath: (path: string) => string;
  isContextReady: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [isSubdomainAccess, setIsSubdomainAccess] = useState<boolean>(false);
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [isContextReady, setIsContextReady] = useState<boolean>(false);
  const isInitialized = useRef<boolean>(false);

  const setTenantContext = (id: string | null, name: string | null, isSubdomain: boolean) => {
    console.log("TenantContext: setTenantContext called", { id, name, isSubdomain });
    
    // Only allow one initialization per session for non-null values
    if (isInitialized.current && id && name) {
      console.log("TenantContext: Already initialized, skipping update");
      return;
    }
    
    // Prevent updates if values haven't actually changed
    if (
      organizationId === id && 
      organizationName === name && 
      isSubdomainAccess === isSubdomain
    ) {
      console.log("TenantContext: No changes detected, marking as ready");
      setIsContextReady(true);
      return;
    }
    
    console.log("TenantContext: Applying context changes");
    
    setOrganizationId(id);
    setOrganizationName(name);
    setIsSubdomainAccess(isSubdomain);
    
    if (name) {
      setSubdomain(name.toLowerCase());
    }
    
    // Mark as initialized once we have valid data
    if (id && name) {
      isInitialized.current = true;
      console.log("TenantContext: Marking as initialized and ready");
    }
    
    // Always mark as ready after setting context
    setIsContextReady(true);
  };

  // Generate organization-aware URL for a given path
  const getOrgAwarePath = (path: string) => {
    // For subdomain access, always use clean paths
    if (isSubdomainAccess) {
      // Clean up any tenant-dashboard paths for subdomain access
      if (path.startsWith('/tenant-dashboard/')) {
        const parts = path.split('/tenant-dashboard/');
        if (parts.length > 1) {
          const orgAndPath = parts[1].split('/', 2);
          if (orgAndPath.length > 1) {
            return `/${orgAndPath[1]}`;
          } else {
            return '/';
          }
        }
      }
      
      return path;
    }
    
    // For non-subdomain access (super admin only), use simple paths
    return path;
  };

  // Initialize context immediately for main domain access
  useEffect(() => {
    const hostname = window.location.hostname;
    const isMainDomain = hostname === 'localhost' || 
                        hostname === 'church-os.com' || 
                        hostname.includes('lovable.dev') || 
                        hostname.includes('lovable.app');
    
    console.log("TenantContext: Domain check", { hostname, isMainDomain });
    
    // If we're on main domain, mark as ready immediately
    if (isMainDomain) {
      console.log("TenantContext: Main domain detected, marking as ready immediately");
      setIsContextReady(true);
    }
  }, []);

  const value = {
    organizationId,
    organizationName,
    isSubdomainAccess,
    subdomain,
    setTenantContext,
    getOrgAwarePath,
    isContextReady
  };

  console.log("TenantContext: Current state", {
    organizationId,
    organizationName,
    isSubdomainAccess,
    subdomain,
    isContextReady,
    isInitialized: isInitialized.current
  });

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenantContext() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenantContext must be used within a TenantProvider');
  }
  return context;
}
