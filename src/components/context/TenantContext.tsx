import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { extractSubdomain, isMainDomain } from '@/utils/domain';
import { supabase } from '@/integrations/supabase/client';

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

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [isSubdomainAccess, setIsSubdomainAccess] = useState<boolean>(false);
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [isContextReady, setIsContextReady] = useState<boolean>(false);
  const [contextError, setContextError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const isInitialized = useRef<boolean>(false);
  const initializationPromise = useRef<Promise<void> | null>(null);

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
    setContextError(null);
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

  // Lookup organization by subdomain or custom domain with retry logic
  const lookupOrganizationByDomain = async (detectedSubdomain: string, hostname: string, attempt: number = 1) => {
    const maxAttempts = 3;
    console.log(`TenantContext: Looking up organization (attempt ${attempt}/${maxAttempts})`, { detectedSubdomain, hostname });
    
    try {
      // Add a small delay for retries to handle transient network issues
      if (attempt > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }

      // Extract just the subdomain part (e.g., 'test3' from 'test3.church-os.com')
      const pureSubdomain = detectedSubdomain.split('.')[0];
      console.log(`TenantContext: Pure subdomain: ${pureSubdomain}`);

      // First try to find by exact subdomain match
      console.log(`TenantContext: Querying for subdomain: ${detectedSubdomain} or ${pureSubdomain}`);
      
      let { data: orgData, error } = await supabase
        .from('organizations')
        .select('id, name, website_enabled, subdomain')
        .eq('subdomain', pureSubdomain)
        .maybeSingle();

      console.log(`TenantContext: Subdomain lookup result (attempt ${attempt}):`, { orgData, error });

      // If not found by pure subdomain, try the full detected subdomain
      if (!orgData && !error && detectedSubdomain !== pureSubdomain) {
        console.log("TenantContext: Trying full detected subdomain:", detectedSubdomain);
        ({ data: orgData, error } = await supabase
          .from('organizations')
          .select('id, name, website_enabled, subdomain')
          .eq('subdomain', detectedSubdomain)
          .maybeSingle());
        
        console.log("TenantContext: Full subdomain lookup result:", { orgData, error });
      }

      // If not found by subdomain, try by custom domain
      if (!orgData && !error) {
        console.log("TenantContext: Trying custom domain lookup for:", hostname);
        ({ data: orgData, error } = await supabase
          .from('organizations')
          .select('id, name, website_enabled, subdomain, custom_domain')
          .eq('custom_domain', hostname)
          .maybeSingle());
        
        console.log("TenantContext: Custom domain lookup result:", { orgData, error });
      }

      if (error) {
        console.error(`TenantContext: Database error during organization lookup (attempt ${attempt}):`, error);
        
        // Retry on database errors
        if (attempt < maxAttempts) {
          console.log(`TenantContext: Retrying lookup (${attempt + 1}/${maxAttempts})`);
          return await lookupOrganizationByDomain(detectedSubdomain, hostname, attempt + 1);
        }
        
        setContextError(`Database error looking up subdomain "${detectedSubdomain}": ${error.message}`);
        setIsContextReady(true);
        return;
      }

      if (orgData) {
        console.log("TenantContext: Found organization", orgData);
        
        // Check if website is enabled
        if (orgData.website_enabled === false) {
          console.warn("TenantContext: Website is disabled for this organization");
          setContextError(`${orgData.name}'s website is currently disabled. Please contact the organization administrator.`);
          setIsContextReady(true);
          return;
        }

        // Set the tenant context with the found organization
        console.log("TenantContext: Setting subdomain access context");
        setTenantContext(orgData.id, orgData.name, true);
        setSubdomain(orgData.subdomain || pureSubdomain);
        
        console.log("TenantContext: Successfully set tenant context for organization", {
          id: orgData.id,
          name: orgData.name,
          subdomain: orgData.subdomain || pureSubdomain,
          isSubdomainAccess: true
        });
      } else {
        console.warn("TenantContext: No organization found for subdomain/domain", { detectedSubdomain, hostname, pureSubdomain });
        setContextError(`No organization found for subdomain "${detectedSubdomain}". Please check if the organization exists and has the correct subdomain configured.`);
        setIsContextReady(true);
      }
    } catch (error) {
      console.error(`TenantContext: Unexpected error during organization lookup (attempt ${attempt}):`, error);
      
      // Retry on unexpected errors
      if (attempt < maxAttempts) {
        console.log(`TenantContext: Retrying lookup due to unexpected error (${attempt + 1}/${maxAttempts})`);
        return await lookupOrganizationByDomain(detectedSubdomain, hostname, attempt + 1);
      }
      
      setContextError(`Unexpected error during subdomain validation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsContextReady(true);
    }
  };

  // Retry context initialization
  const retryContext = () => {
    console.log("TenantContext: Retrying context initialization");
    setRetryCount(prev => prev + 1);
    setIsContextReady(false);
    setContextError(null);
    isInitialized.current = false;
    initializationPromise.current = null;
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

    const hostname = window.location.hostname;
    console.log(`TenantContext: Initializing context for hostname (retry: ${retryCount}):`, hostname);
    
    initializationPromise.current = (async () => {
      try {
        const isMainDomainCheck = isMainDomain(hostname);
        console.log("TenantContext: Main domain check result:", isMainDomainCheck);
        
        // If we're on main domain, mark as ready immediately
        if (isMainDomainCheck) {
          console.log("TenantContext: Main domain detected, marking as ready immediately");
          setIsContextReady(true);
          return;
        }

        // Extract subdomain for custom domains
        const detectedSubdomain = extractSubdomain(hostname);
        console.log("TenantContext: Detected subdomain:", detectedSubdomain);

        if (detectedSubdomain) {
          // Look up organization by subdomain or custom domain
          await lookupOrganizationByDomain(detectedSubdomain, hostname);
        } else {
          console.log("TenantContext: No subdomain detected, marking as ready");
          setIsContextReady(true);
        }
      } catch (error) {
        console.error('TenantContext: Error during initialization:', error);
        setContextError(`Context initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsContextReady(true);
      } finally {
        initializationPromise.current = null;
      }
    })();
  }, [retryCount]); // Include retryCount to trigger re-initialization

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
}

export function useTenantContext() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenantContext must be used within a TenantProvider');
  }
  return context;
}
