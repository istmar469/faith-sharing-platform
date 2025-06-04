import { useState, useRef } from 'react';

export interface TenantState {
  organizationId: string | null;
  organizationName: string | null;
  isSubdomainAccess: boolean;
  subdomain: string | null;
  isContextReady: boolean;
  contextError: string | null;
  retryCount: number;
}

export const useTenantState = () => {
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
    console.log("setTenantContext: setTenantContext called", { id, name, isSubdomain });
    
    // Only allow one initialization per session for non-null values
    if (isInitialized.current && id && name) {
      console.log("setTenantContext: Already initialized, skipping update");
      return;
    }
    
    // Prevent updates if values haven't actually changed
    if (
      organizationId === id && 
      organizationName === name && 
      isSubdomainAccess === isSubdomain
    ) {
      console.log("setTenantContext: No changes detected, marking as ready");
      setIsContextReady(true);
      return;
    }
    
    console.log("setTenantContext: Applying context changes");
    
    setOrganizationId(id);
    setOrganizationName(name);
    setIsSubdomainAccess(isSubdomain);
    
    if (isSubdomain && name) {
      setSubdomain(name.toLowerCase());
    } else {
      setSubdomain(null);
    }
    
    // Mark as initialized once we have valid data
    if (id && name) {
      isInitialized.current = true;
      console.log("setTenantContext: Marking as initialized and ready");
    }
    
    // Always mark as ready after setting context
    setIsContextReady(true);
    setContextError(null);
  };

  const retryContext = () => {
    console.log("retryContext: Retrying context initialization");
    setRetryCount(prev => prev + 1);
    setIsContextReady(false);
    setContextError(null);
    isInitialized.current = false;
    initializationPromise.current = null;
  };

  return {
    // State
    organizationId,
    organizationName,
    isSubdomainAccess,
    subdomain,
    isContextReady,
    contextError,
    retryCount,
    
    // Actions
    setTenantContext,
    retryContext,
    setContextError,
    setIsContextReady,
    setSubdomain,
    
    // Refs
    isInitialized,
    initializationPromise
  };
};
