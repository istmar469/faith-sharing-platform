
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { extractSubdomain, isMainDomain } from '@/utils/domainUtils';
import { supabase } from '@/integrations/supabase/client';

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

  // Lookup organization by subdomain or custom domain
  const lookupOrganizationByDomain = async (detectedSubdomain: string, hostname: string) => {
    console.log("TenantContext: Looking up organization for subdomain/domain", { detectedSubdomain, hostname });
    
    try {
      // First try to find by subdomain
      let { data: orgData, error } = await supabase
        .from('organizations')
        .select('id, name, website_enabled')
        .eq('subdomain', detectedSubdomain)
        .maybeSingle();

      console.log("TenantContext: Subdomain lookup result:", { orgData, error });

      // If not found by subdomain, try by custom domain
      if (!orgData && !error) {
        console.log("TenantContext: Trying custom domain lookup for:", hostname);
        ({ data: orgData, error } = await supabase
          .from('organizations')
          .select('id, name, website_enabled')
          .eq('custom_domain', hostname)
          .maybeSingle());
        
        console.log("TenantContext: Custom domain lookup result:", { orgData, error });
      }

      if (error) {
        console.error("TenantContext: Database error during organization lookup:", error);
        setIsContextReady(true);
        return;
      }

      if (orgData) {
        console.log("TenantContext: Found organization", orgData);
        
        // Check if website is enabled
        if (orgData.website_enabled === false) {
          console.warn("TenantContext: Website is disabled for this organization");
          setIsContextReady(true);
          return;
        }

        // Set the tenant context with the found organization
        console.log("TenantContext: Setting subdomain access context");
        setOrganizationId(orgData.id);
        setOrganizationName(orgData.name);
        setIsSubdomainAccess(true);
        setSubdomain(detectedSubdomain);
        isInitialized.current = true;
        setIsContextReady(true);
        
        console.log("TenantContext: Successfully set tenant context for organization", {
          id: orgData.id,
          name: orgData.name,
          subdomain: detectedSubdomain,
          isSubdomainAccess: true
        });
      } else {
        console.warn("TenantContext: No organization found for subdomain/domain", { detectedSubdomain, hostname });
        setIsContextReady(true);
      }
    } catch (error) {
      console.error("TenantContext: Unexpected error during organization lookup:", error);
      setIsContextReady(true);
    }
  };

  // Initialize context based on domain
  useEffect(() => {
    if (isInitialized.current) {
      console.log("TenantContext: Already initialized, skipping domain check");
      return;
    }

    const hostname = window.location.hostname;
    console.log("TenantContext: Initializing context for hostname:", hostname);
    
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
      lookupOrganizationByDomain(detectedSubdomain, hostname);
    } else {
      console.log("TenantContext: No subdomain detected, marking as ready");
      setIsContextReady(true);
    }
  }, []); // Empty dependency array to run only once

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
    isInitialized: isInitialized.current,
    hostname: window.location.hostname
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
