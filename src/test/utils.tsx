
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { TenantProvider, useTenantContext } from '@/components/context/TenantContext';

// Create a mock TenantContext value type
interface MockTenantContextType {
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

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  tenantContextValue?: MockTenantContextType;
}

const AllTheProviders = ({ 
  children, 
  queryClient,
  tenantContextValue 
}: { 
  children: React.ReactNode;
  queryClient?: QueryClient;
  tenantContextValue?: MockTenantContextType;
}) => {
  const defaultQueryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  // If tenantContextValue is provided, use TenantProvider, otherwise use a mock
  if (tenantContextValue) {
    return (
      <QueryClientProvider client={queryClient || defaultQueryClient}>
        <BrowserRouter>
          <TenantProvider>
            {children}
          </TenantProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient || defaultQueryClient}>
      <BrowserRouter>
        <TenantProvider>
          {children}
        </TenantProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  const { queryClient, tenantContextValue, ...renderOptions } = options || {};
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders 
        queryClient={queryClient}
        tenantContextValue={tenantContextValue}
      >
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

export * from '@testing-library/react';
export { customRender as render };
