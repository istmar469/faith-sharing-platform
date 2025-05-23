
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { extractSubdomain, isDevelopmentEnvironment } from "@/utils/domainUtils";

interface TenantContextType {
  organizationId: string | null;
  organizationName: string | null;
  isSubdomainAccess: boolean;
  subdomain: string | null;
  setTenantContext: (id: string | null, name: string | null, isSubdomain: boolean) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [isSubdomainAccess, setIsSubdomainAccess] = useState<boolean>(false);
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const { organizationId: urlOrgId } = useParams<{ organizationId: string }>();

  // Check for subdomain on mount
  useEffect(() => {
    const hostname = window.location.hostname;
    const isSubdomain = !isDevelopmentEnvironment() && hostname.split('.').length > 2;
    const extractedSubdomain = extractSubdomain(hostname);
    
    if (isSubdomain && extractedSubdomain) {
      console.log("TenantContext: Detected subdomain access:", extractedSubdomain);
      setIsSubdomainAccess(true);
      setSubdomain(extractedSubdomain);
    } else {
      setIsSubdomainAccess(false);
    }
  }, []);

  // Check URL for organization ID on mount and route changes
  useEffect(() => {
    if (urlOrgId && (organizationId !== urlOrgId)) {
      console.log("TenantContext: Setting organization ID from URL params:", urlOrgId);
      setOrganizationId(urlOrgId);
    }
  }, [urlOrgId, organizationId]);

  const setTenantContext = (id: string | null, name: string | null, isSubdomain: boolean) => {
    console.log("TenantContext: Setting context:", { id, name, isSubdomain });
    setOrganizationId(id);
    setOrganizationName(name);
    setIsSubdomainAccess(isSubdomain);
  };

  const value = {
    organizationId,
    organizationName,
    isSubdomainAccess,
    subdomain,
    setTenantContext
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
