
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import SubdomainMiddleware from '../SubdomainMiddleware';

// Mock the domain utils
vi.mock('@/utils/domain', () => ({
  extractSubdomain: vi.fn(),
  isMainDomain: vi.fn(),
}));

// Mock the tenant context
vi.mock('@/components/context/TenantContext', () => ({
  useTenantContext: vi.fn(),
}));

const TestComponent = () => <div>Test Component</div>;

describe('SubdomainMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset location
    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'localhost',
        pathname: '/',
      },
      writable: true,
    });
  });

  it('should render children when context is ready and on main domain', () => {
    const mockUseTenantContext = vi.mocked(
      require('@/components/context/TenantContext').useTenantContext
    );
    const mockIsMainDomain = vi.mocked(
      require('@/utils/domain').isMainDomain
    );

    mockUseTenantContext.mockReturnValue({
      organizationId: null,
      subdomain: null,
      isSubdomainAccess: false,
      isContextReady: true,
    });
    mockIsMainDomain.mockReturnValue(true);

    render(
      <MemoryRouter>
        <SubdomainMiddleware>
          <TestComponent />
        </SubdomainMiddleware>
      </MemoryRouter>
    );

    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  it('should show loading when context is not ready', () => {
    const mockUseTenantContext = vi.mocked(
      require('@/components/context/TenantContext').useTenantContext
    );

    mockUseTenantContext.mockReturnValue({
      organizationId: null,
      subdomain: null,
      isSubdomainAccess: false,
      isContextReady: false,
    });

    render(
      <MemoryRouter>
        <SubdomainMiddleware>
          <TestComponent />
        </SubdomainMiddleware>
      </MemoryRouter>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should handle subdomain access', () => {
    const mockUseTenantContext = vi.mocked(
      require('@/components/context/TenantContext').useTenantContext
    );
    const mockExtractSubdomain = vi.mocked(
      require('@/utils/domain').extractSubdomain
    );
    const mockIsMainDomain = vi.mocked(
      require('@/utils/domain').isMainDomain
    );

    mockUseTenantContext.mockReturnValue({
      organizationId: 'test-org-id',
      subdomain: 'test',
      isSubdomainAccess: true,
      isContextReady: true,
    });
    mockExtractSubdomain.mockReturnValue('test');
    mockIsMainDomain.mockReturnValue(false);

    render(
      <MemoryRouter>
        <SubdomainMiddleware>
          <TestComponent />
        </SubdomainMiddleware>
      </MemoryRouter>
    );

    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  it('should handle organization not found', () => {
    const mockUseTenantContext = vi.mocked(
      require('@/components/context/TenantContext').useTenantContext
    );
    const mockExtractSubdomain = vi.mocked(
      require('@/utils/domain').extractSubdomain
    );
    const mockIsMainDomain = vi.mocked(
      require('@/utils/domain').isMainDomain
    );

    mockUseTenantContext.mockReturnValue({
      organizationId: null,
      subdomain: 'nonexistent',
      isSubdomainAccess: true,
      isContextReady: true,
      contextError: 'Organization not found',
    });
    mockExtractSubdomain.mockReturnValue('nonexistent');
    mockIsMainDomain.mockReturnValue(false);

    render(
      <MemoryRouter>
        <SubdomainMiddleware>
          <TestComponent />
        </SubdomainMiddleware>
      </MemoryRouter>
    );

    // Should show some error state or redirect
    expect(screen.queryByText('Test Component')).not.toBeInTheDocument();
  });
});
