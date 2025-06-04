
import React, { createContext, useContext, useEffect } from 'react';
import { extractSubdomain, isMainDomain } from '@/utils/domain';
import { useTenantState } from './hooks/useTenantState';
import { analyzeDomain } from './utils/domainDetection';
import { lookupOrganizationById, lookupOrganizationByDomain, loadRootDomainOrganization } from './utils/organizationLookup';

// Root domain organization ID that should be used for church-os.com
const ROOT_DOMAIN_ORGANIZATION_ID = 'df5b8196-7bc4-44fd-b3cb-e559f67c2f84';

interface TenantContextType {
  organizationId: string | null;
  organizationName: string | null;
  isSubdomainAccess: boolean;
  subdomain: string | null;
  setTenantContext: (id: string | null, name: string | null, isSubdomain: boolean) => void;
  getOrgAwarePath: (path: string) => string;
  isContextReady: boolean;
  contextError: string | null;
  retryContext: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    organizationId,
    organizationName,
    isSubdomainAccess,
    subdomain,
    isContextReady,
    contextError,
    retryCount,
    setTenantContext,
    retryContext,
    setContextError,
    setIsContextReady,
    setSubdomain,
    isInitialized,
    initializationPromise
  } = useTenantState();

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

  // Initialize context based on domain
  useEffect(() => {
    // Prevent multiple simultaneous initializations
    if (initializationPromise.current) {
      return;
    }

    if (isInitialized.current && !retryCount) {
      console.log("TenantContext: Already initialized, skipping domain check");
      return;
    }

    const domainInfo = analyzeDomain();
    console.log(`TenantContext: Initializing context for hostname (retry: ${retryCount}):`, domainInfo);
    
    // Add timeout to prevent infinite loading
    const initTimeout = setTimeout(() => {
      console.warn("TenantContext: Initialization timeout reached, marking as ready");
      if (!isContextReady) {
        setContextError("Context initialization timed out. Using fallback configuration.");
        setIsContextReady(true);
      }
    }, 15000); // 15 second timeout

    initializationPromise.current = (async () => {
      try {
        // FIRST: Check if this is a Lovable development environment
        if (domainInfo.lovableOrgId) {
          console.log("TenantContext: Lovable development environment detected, looking up organization by ID");
          const orgData = await lookupOrganizationById(domainInfo.lovableOrgId, 1, setContextError, setIsContextReady);
          if (orgData) {
            // Set the tenant context - this is development/Lovable access, treat as subdomain access
            console.log("TenantContext: Setting development access context");
            setTenantContext(orgData.id, orgData.name, true);
            setSubdomain(orgData.subdomain || domainInfo.lovableOrgId);
            
            console.log("TenantContext: Successfully set tenant context for organization", {
              id: orgData.id,
              name: orgData.name,
              subdomain: orgData.subdomain || domainInfo.lovableOrgId,
              isSubdomainAccess: true
            });
          }
          return;
        }

        // If we're on main domain, load the root domain organization
        if (domainInfo.isMainDomain) {
          console.log("TenantContext: Main domain detected, loading root domain organization");
          const orgData = await loadRootDomainOrganization(ROOT_DOMAIN_ORGANIZATION_ID, setContextError, setIsContextReady);
          if (orgData) {
            // Set the tenant context with the root domain organization (not subdomain access)
            setTenantContext(orgData.id, orgData.name, false);
            setSubdomain(null); // Root domain doesn't have a subdomain
            
            console.log("TenantContext: Successfully set root domain context", {
              id: orgData.id,
              name: orgData.name,
              isSubdomainAccess: false
            });
          }
          return;
        }

        if (domainInfo.detectedSubdomain) {
          // Look up organization by subdomain or custom domain
          const orgData = await lookupOrganizationByDomain(domainInfo.detectedSubdomain, domainInfo.hostname, 1, setContextError, setIsContextReady);
          if (orgData) {
            // Set the tenant context with the found organization
            console.log("TenantContext: Setting subdomain access context");
            setTenantContext(orgData.id, orgData.name, true);
            setSubdomain(orgData.subdomain || domainInfo.detectedSubdomain.split('.')[0]);
            
            console.log("TenantContext: Successfully set tenant context for organization", {
              id: orgData.id,
              name: orgData.name,
              subdomain: orgData.subdomain || domainInfo.detectedSubdomain.split('.')[0],
              isSubdomainAccess: true
            });
          }
        } else {
          console.log("TenantContext: No subdomain detected, loading root domain organization");
          const orgData = await loadRootDomainOrganization(ROOT_DOMAIN_ORGANIZATION_ID, setContextError, setIsContextReady);
          if (orgData) {
            setTenantContext(orgData.id, orgData.name, false);
            setSubdomain(null);
          }
        }
      } catch (error) {
        console.error('TenantContext: Error during initialization:', error);
        setContextError(`Context initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsContextReady(true);
      } finally {
        clearTimeout(initTimeout);
        initializationPromise.current = null;
      }
    })();
  }, [retryCount]);

  const value = {
    organizationId,
    organizationName,
    isSubdomainAccess,
    subdomain,
    setTenantContext,
    getOrgAwarePath,
    isContextReady,
    contextError,
    retryContext
  };

  console.log("TenantContext: Current state", {
    organizationId,
    organizationName,
    isSubdomainAccess,
    subdomain,
    isContextReady,
    contextError,
    isInitialized: isInitialized.current,
    hostname: window.location.hostname,
    retryCount
  });

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

export function useTenantContext() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenantContext must be used within a TenantProvider');
  }
  return context;
}
