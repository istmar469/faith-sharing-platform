import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { extractSubdomain, isDevelopmentEnvironment, getOrganizationIdFromPath } from "@/utils/domainUtils";

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
  const { organizationId: urlOrgId } = useParams<{ organizationId: string }>();
  const location = useLocation();

  // Check for subdomain on mount
  useEffect(() => {
    const hostname = window.location.hostname;
    const extractedSubdomain = extractSubdomain(hostname);
    
    console.log("TenantContext: Initial subdomain check", {
      hostname,
      extractedSubdomain,
      isDev: isDevelopmentEnvironment()
    });
    
    if (extractedSubdomain) {
      console.log("TenantContext: Detected subdomain access:", extractedSubdomain);
      setIsSubdomainAccess(true);
      setSubdomain(extractedSubdomain);
    } else {
      setIsSubdomainAccess(false);
    }
  }, []);

  // Check URL for organization ID when route changes
  useEffect(() => {
    // Skip URL-based org ID detection if we're on a subdomain
    if (isSubdomainAccess) {
      console.log("TenantContext: Skipping URL org ID detection for subdomain");
      return;
    }
    
    // Try to get organization ID from URL params
    if (urlOrgId && (organizationId !== urlOrgId)) {
      console.log("TenantContext: Setting organization ID from URL params:", urlOrgId);
      setOrganizationId(urlOrgId);
    } 
    // If no URL param, try to extract from path (for nested routes)
    else if (!urlOrgId) {
      const orgIdFromPath = getOrganizationIdFromPath(location.pathname);
      if (orgIdFromPath && organizationId !== orgIdFromPath) {
        console.log("TenantContext: Setting organization ID from path:", orgIdFromPath);
        setOrganizationId(orgIdFromPath);
      }
    }
  }, [urlOrgId, location.pathname, organizationId, isSubdomainAccess]);

  const setTenantContext = (id: string | null, name: string | null, isSubdomain: boolean) => {
    console.log("TenantContext: Setting context:", { id, name, isSubdomain });
    setOrganizationId(id);
    setOrganizationName(name);
    setIsSubdomainAccess(isSubdomain);
    if (isSubdomain && name) {
      setSubdomain(name?.toLowerCase() || null);
    }
  };

  // Generate organization-aware URL for a given path
  const getOrgAwarePath = (path: string) => {
    // If accessing via subdomain, don't prefix with org ID
    if (isSubdomainAccess) {
      // For tenant dashboard paths, clean them up for subdomain access
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
    
    // If we have an organization ID, prefix tenant-specific paths
    if (organizationId) {
      // For tenant dashboard route
      if (path === '/tenant-dashboard') {
        return `/tenant-dashboard/${organizationId}`;
      }
      
      // For other paths that should be organization-specific
      if (
        path.startsWith('/page-builder') || 
        path.startsWith('/settings/') || 
        path.startsWith('/livestream') || 
        path.startsWith('/communication') ||
        path.startsWith('/pages') ||
        path.startsWith('/templates')
      ) {
        // If already in tenant dashboard context, append to it
        if (location.pathname.includes('/tenant-dashboard/')) {
          return `/tenant-dashboard/${organizationId}${path}`;
        }
        // Otherwise use the direct path with organization ID
        return path;
      }
    }
    
    // Default case - return original path
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
