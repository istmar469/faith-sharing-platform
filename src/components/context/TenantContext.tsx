
import React, { createContext, useContext, useState } from 'react';

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

  const setTenantContext = (id: string | null, name: string | null, isSubdomain: boolean) => {
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
