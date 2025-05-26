
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { TenantContext } from '@/components/context/TenantContext';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  tenantContextValue?: any;
}

const AllTheProviders = ({ 
  children, 
  queryClient,
  tenantContextValue 
}: { 
  children: React.ReactNode;
  queryClient?: QueryClient;
  tenantContextValue?: any;
}) => {
  const defaultQueryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const defaultTenantValue = {
    organizationId: 'test-org-id',
    subdomain: 'test',
    isSubdomainAccess: false,
    isLoading: false,
    organization: null,
  };

  return (
    <QueryClientProvider client={queryClient || defaultQueryClient}>
      <BrowserRouter>
        <TenantContext.Provider value={tenantContextValue || defaultTenantValue}>
          {children}
        </TenantContext.Provider>
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
