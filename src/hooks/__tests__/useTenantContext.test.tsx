
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTenantContext, TenantProvider } from '@/components/context/TenantContext';
import React from 'react';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <TenantProvider>
        {children}
      </TenantProvider>
    </QueryClientProvider>
  );
};

describe('useTenantContext', () => {
  it('provides tenant context values', () => {
    const { result } = renderHook(() => useTenantContext(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBeDefined();
    expect(typeof result.current.setTenantContext).toBe('function');
    expect(typeof result.current.getOrgAwarePath).toBe('function');
    expect(typeof result.current.retryContext).toBe('function');
  });

  it('has proper initial state', () => {
    const { result } = renderHook(() => useTenantContext(), {
      wrapper: createWrapper(),
    });

    expect(result.current.organizationId).toBeNull();
    expect(result.current.organizationName).toBeNull();
    expect(result.current.isSubdomainAccess).toBe(false);
    expect(result.current.subdomain).toBeNull();
    expect(result.current.contextError).toBeNull();
  });
});
