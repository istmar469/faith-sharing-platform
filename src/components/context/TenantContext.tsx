
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface TenantContextType {
  organizationId: string | null;
  organizationName: string | null;
  isSubdomainAccess: boolean;
  setTenantContext: (id: string | null, name: string | null, isSubdomain: boolean) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [isSubdomainAccess, setIsSubdomainAccess] = useState<boolean>(false);
  const { organizationId: urlOrgId } = useParams<{ organizationId: string }>();

  // Check URL for organization ID on mount and route changes
  useEffect(() => {
    if (urlOrgId && !organizationId) {
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
