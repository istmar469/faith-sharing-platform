
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  // Circuit breaker to prevent infinite loops
  const updateCountRef = useRef(0);
  const lastUpdateRef = useRef<number>(0);
  const stabilityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { organizationId: urlOrgId } = useParams<{ organizationId: string }>();
  const location = useLocation();

  // SINGLE SOURCE OF TRUTH: Only check subdomain once on mount
  useEffect(() => {
    if (isInitialized) return;
    
    const now = Date.now();
    
    // Circuit breaker: prevent rapid updates
    if (now - lastUpdateRef.current < 100) {
      updateCountRef.current++;
      if (updateCountRef.current > 10) {
        console.warn("TenantContext: Circuit breaker activated - too many rapid updates");
        return;
      }
    } else {
      updateCountRef.current = 0;
    }
    
    lastUpdateRef.current = now;
    
    const hostname = window.location.hostname;
    const extractedSubdomain = extractSubdomain(hostname);
    
    if (extractedSubdomain) {
      setIsSubdomainAccess(true);
      setSubdomain(extractedSubdomain);
    } else {
      setIsSubdomainAccess(false);
      setSubdomain(null);
    }
    
    setIsInitialized(true);
  }, [isInitialized]);

  // Handle URL-based organization ID ONLY if not on subdomain
  useEffect(() => {
    if (!isInitialized || isSubdomainAccess) return;
    
    // Clear any existing timeout
    if (stabilityTimeoutRef.current) {
      clearTimeout(stabilityTimeoutRef.current);
    }
    
    // Debounce URL changes to prevent thrashing
    stabilityTimeoutRef.current = setTimeout(() => {
      if (urlOrgId && organizationId !== urlOrgId) {
        setOrganizationId(urlOrgId);
      } else if (!urlOrgId) {
        const orgIdFromPath = getOrganizationIdFromPath(location.pathname);
        if (orgIdFromPath && organizationId !== orgIdFromPath) {
          setOrganizationId(orgIdFromPath);
        }
      }
    }, 50);
    
    return () => {
      if (stabilityTimeoutRef.current) {
        clearTimeout(stabilityTimeoutRef.current);
      }
    };
  }, [urlOrgId, location.pathname, organizationId, isSubdomainAccess, isInitialized]);

  // IDEMPOTENT context setter - only update if values actually changed
  const setTenantContext = (id: string | null, name: string | null, isSubdomain: boolean) => {
    // Prevent updates if values haven't actually changed
    if (
      organizationId === id && 
      organizationName === name && 
      isSubdomainAccess === isSubdomain
    ) {
      return; // No change needed
    }
    
    // Circuit breaker check
    const now = Date.now();
    if (now - lastUpdateRef.current < 100) {
      updateCountRef.current++;
      if (updateCountRef.current > 10) {
        console.warn("TenantContext: Blocked rapid context update");
        return;
      }
    } else {
      updateCountRef.current = 0;
    }
    
    lastUpdateRef.current = now;
    
    setOrganizationId(id);
    setOrganizationName(name);
    setIsSubdomainAccess(isSubdomain);
    
    if (isSubdomain && name) {
      setSubdomain(name.toLowerCase());
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
    
    // For non-subdomain access, add organization context if needed
    if (organizationId) {
      if (path === '/tenant-dashboard') {
        return `/tenant-dashboard/${organizationId}`;
      }
      
      if (
        path.startsWith('/page-builder') || 
        path.startsWith('/settings/') || 
        path.startsWith('/livestream') || 
        path.startsWith('/communication') ||
        path.startsWith('/pages') ||
        path.startsWith('/templates')
      ) {
        if (location.pathname.includes('/tenant-dashboard/')) {
          return `/tenant-dashboard/${organizationId}${path}`;
        }
        return path;
      }
    }
    
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
