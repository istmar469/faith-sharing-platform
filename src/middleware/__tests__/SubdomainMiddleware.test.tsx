import { render, screen, waitFor } from '@testing-library/react';
import SubdomainMiddleware from '../SubdomainMiddleware';
import { useTenantContext } from '@/components/context/TenantContext';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the useTenantContext hook
vi.mock('@/components/context/TenantContext', () => ({
  useTenantContext: vi.fn(),
}));

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
  },
}));

const TestComponent = () => <div>Test Content</div>;

const renderWithRouter = (initialPath = '/', context = {}) => {
  const queryClient = new QueryClient();
  
  const defaultContext = {
    setTenantContext: vi.fn(),
    isSubdomainAccess: false,
    organizationId: null,
    organizationName: null,
    isContextReady: false,
    contextError: null,
    retryContext: vi.fn(),
    getOrgAwarePath: (path: string) => path,
    ...context,
  };

  (useTenantContext as any).mockImplementation(() => defaultContext);

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <SubdomainMiddleware>
          <TestComponent />
        </SubdomainMiddleware>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('SubdomainMiddleware', () => {
  const originalWindow = { ...window };
  const originalLocation = window.location;
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location
    delete (window as any).location;
    window.location = {
      ...originalLocation,
      hostname: 'test.example.com',
      protocol: 'https:',
      port: '',
    } as any;
  });

  afterEach(() => {
    // Restore window.location
    window.location = originalLocation as any;
  });

  it('should render children when no subdomain is present', async () => {
    window.location.hostname = 'example.com';
    
    renderWithRouter('/');
    
    await waitFor(() => {
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  it('should validate subdomain and set tenant context when subdomain exists', async () => {
    const mockOrgData = {
      id: 'org-123',
      name: 'Test Org',
      website_enabled: true,
      subdomain: 'test',
    };


    supabase.from('organizations').select().eq('subdomain', 'test').maybeSingle.mockResolvedValueOnce({
      data: mockOrgData,
      error: null,
    });

    renderWithRouter('/');

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('organizations');
      // Verify that the chain was used properly - we can't verify the specific chain calls
      // since we're using mockResolvedValueOnce directly on the maybeSingle method
      
      const { setTenantContext } = useTenantContext();
      expect(setTenantContext).toHaveBeenCalledWith(
        'org-123',
        'Test Org',
        true
      );
    });
  });

  it('should show error when subdomain is not found', async () => {

    supabase.from('organizations').select().eq('subdomain', 'test').maybeSingle.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    renderWithRouter('/');

    await waitFor(() => {
      expect(screen.getByText(/No organization found for subdomain "test"/i)).toBeInTheDocument();
    });
  });

  it('should show error when website is disabled', async () => {
    const mockOrgData = {
      id: 'org-123',
      name: 'Test Org',
      website_enabled: false,
      subdomain: 'test',
    };


    supabase.from('organizations').select().eq('subdomain', 'test').maybeSingle.mockResolvedValueOnce({
      data: mockOrgData,
      error: null,
    });

    renderWithRouter('/');

    await waitFor(() => {
      expect(screen.getByText(/website is currently disabled/i)).toBeInTheDocument();
    });
  });

  it('should handle database errors', async () => {

    const dbError = new Error('Database connection failed');
    supabase.from('organizations').select().eq('subdomain', 'test').maybeSingle.mockResolvedValueOnce({
      data: null,
      error: dbError,
    });

    renderWithRouter('/');

    await waitFor(() => {
      expect(screen.getByText(/Database error looking up subdomain/i)).toBeInTheDocument();
    });
  });

  it('should skip subdomain validation for page-builder routes', async () => {
    window.location.pathname = '/page-builder/123';
    
    renderWithRouter('/page-builder/123');

    // Should not make any database calls

    expect(supabase.from).not.toHaveBeenCalled();
    
    // Should still render children
    await waitFor(() => {
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });
});
