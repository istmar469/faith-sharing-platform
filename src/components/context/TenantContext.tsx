
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface TenantContextType {
  organizationId: string | null;
  organizationName: string | null;
  isSubdomainAccess: boolean;
  subdomain: string | null;
  setTenantContext: (id: string | null, name: string | null, isSubdomain: boolean) => void;
  getOrgAwarePath: (path: string) => string;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [isSubdomainAccess, setIsSubdomainAccess] = useState<boolean>(false);
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  
  const location = useLocation();

  // IDEMPOTENT context setter - only update if values actually changed AND not locked
  const setTenantContext = (id: string | null, name: string | null, isSubdomain: boolean) => {
    // If context is locked by subdomain detection, ignore updates
    if (isLocked && isSubdomain) {
      return;
    }
    
    // Prevent updates if values haven't actually changed
    if (
      organizationId === id && 
      organizationName === name && 
      isSubdomainAccess === isSubdomain
    ) {
      return;
    }
    
    console.log("TenantContext: Setting context:", {id, name, isSubdomain});
    
    setOrganizationId(id);
    setOrganizationName(name);
    setIsSubdomainAccess(isSubdomain);
    
    if (isSubdomain && name) {
      setSubdomain(name.toLowerCase());
      setIsLocked(true); // Lock context once subdomain is established
    }
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

  const value = {
    organizationId,
    organizationName,
    isSubdomainAccess,
    subdomain,
    setTenantContext,
    getOrgAwarePath
  };

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
