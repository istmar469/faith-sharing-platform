
import React, { createContext, useContext, useEffect } from 'react';
import { isMainDomain } from '@/utils/domain';
import { useTenantState } from './hooks/useTenantState';
import { analyzeDomain } from './utils/domainDetection';
import { lookupOrganizationById, lookupOrganizationByDomain, loadRootDomainOrganization } from './utils/organizationLookup';
import TenantContextError from './TenantContextError';

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
    return path;
  };

  // Initialize context based on domain
  useEffect(() => {
    if (initializationPromise.current) {
      return;
    }

    if (isInitialized.current && !retryCount) {
      console.log("🔄 TenantContext: Already initialized, skipping domain check");
      return;
    }

    const domainInfo = analyzeDomain();
    console.log(`🚀 TenantContext: Starting enhanced initialization (retry: ${retryCount}):`, domainInfo);
    
    const initTimeout = setTimeout(() => {
      console.warn("⏰ TenantContext: Initialization timeout reached, marking as ready");
      if (!isContextReady) {
        setContextError("Context initialization timed out. Using fallback configuration.");
        setIsContextReady(true);
      }
    }, 15000); // Increased timeout for better debugging

    initializationPromise.current = (async () => {
      try {
        // Check if this is a Lovable development environment FIRST
        if (domainInfo.lovableOrgId) {
          console.log("🎯 TenantContext: Lovable development environment detected, looking up organization by ID:", domainInfo.lovableOrgId);
          const orgData = await lookupOrganizationById(domainInfo.lovableOrgId, 1, setContextError, setIsContextReady);
          if (orgData) {
            console.log("✅ TenantContext: Setting development access context for organization:", orgData);
            setTenantContext(orgData.id, orgData.name, true);
            setSubdomain(orgData.subdomain || domainInfo.lovableOrgId);
          }
          return;
        }

        // If we're on main domain, load the root domain organization
        if (domainInfo.isMainDomain) {
          console.log("🏠 TenantContext: Main domain detected, loading root domain organization");
          const orgData = await loadRootDomainOrganization(ROOT_DOMAIN_ORGANIZATION_ID, setContextError, setIsContextReady);
          if (orgData) {
            setTenantContext(orgData.id, orgData.name, false);
            setSubdomain(null);
          }
          return;
        }

        if (domainInfo.detectedSubdomain) {
          console.log("⛪ TenantContext: Subdomain detected, looking up by domain:", {
            detectedSubdomain: domainInfo.detectedSubdomain,
            hostname: domainInfo.hostname,
            debugInfo: domainInfo.debugInfo
          });
          
          const orgData = await lookupOrganizationByDomain(domainInfo.detectedSubdomain, domainInfo.hostname, 1, setContextError, setIsContextReady);
          if (orgData) {
            console.log("✅ TenantContext: Setting subdomain access context for organization:", orgData);
            setTenantContext(orgData.id, orgData.name, true);
            setSubdomain(orgData.subdomain || domainInfo.detectedSubdomain.split('.')[0]);
          }
        } else {
          console.log("🏠 TenantContext: No subdomain detected, loading root domain organization");
          const orgData = await loadRootDomainOrganization(ROOT_DOMAIN_ORGANIZATION_ID, setContextError, setIsContextReady);
          if (orgData) {
            setTenantContext(orgData.id, orgData.name, false);
            setSubdomain(null);
          }
        }
      } catch (error) {
        console.error('💥 TenantContext: Error during initialization:', error);
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

  console.log("📊 TenantContext: Current state", {
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

  // Show error component if there's an error and context is ready
  if (contextError && isContextReady) {
    return <TenantContextError error={contextError} onRetry={retryContext} />;
  }

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
