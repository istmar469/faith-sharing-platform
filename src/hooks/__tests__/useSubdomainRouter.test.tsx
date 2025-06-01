
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSubdomainRouter } from '../useSubdomainRouter';

// Mock the domain utils
vi.mock('@/utils/domain', () => ({
  extractSubdomain: vi.fn(() => null),
  isMainDomain: vi.fn(() => true),
}));

// Mock the tenant context
vi.mock('@/components/context/TenantContext', () => ({
  useTenantContext: vi.fn(() => ({
    organizationId: null,
    subdomain: null,
    isSubdomainAccess: false,
    isContextReady: true,
  })),
}));

describe('useSubdomainRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle main domain correctly', () => {
    const { result } = renderHook(() => useSubdomainRouter());
    
    // Test the actual return values from useSubdomainRouter
    expect(result.current.navigateWithContext).toBeDefined();
    expect(result.current.redirectToSubdomain).toBeDefined();
    expect(result.current.navigateToDashboard).toBeDefined();
  });

  it('should handle subdomain access', () => {
    const mockExtractSubdomain = vi.mocked(
      require('@/utils/domain').extractSubdomain
    );
    const mockIsMainDomain = vi.mocked(
      require('@/utils/domain').isMainDomain
    );
    const mockUseTenantContext = vi.mocked(
      require('@/components/context/TenantContext').useTenantContext
    );

    mockExtractSubdomain.mockReturnValue('test');
    mockIsMainDomain.mockReturnValue(false);
    mockUseTenantContext.mockReturnValue({
      organizationId: 'test-org-id',
      subdomain: 'test',
      isSubdomainAccess: true,
      isContextReady: true,
    });

    const { result } = renderHook(() => useSubdomainRouter());
    
    expect(result.current.navigateWithContext).toBeDefined();
    expect(result.current.redirectToSubdomain).toBeDefined();
    expect(result.current.navigateToDashboard).toBeDefined();
  });

  it('should handle context not ready', () => {
    const mockUseTenantContext = vi.mocked(
      require('@/components/context/TenantContext').useTenantContext
    );

    mockUseTenantContext.mockReturnValue({
      organizationId: null,
      subdomain: null,
      isSubdomainAccess: false,
      isContextReady: false,
    });

    const { result } = renderHook(() => useSubdomainRouter());
    
    expect(result.current.navigateWithContext).toBeDefined();
    expect(result.current.redirectToSubdomain).toBeDefined();
    expect(result.current.navigateToDashboard).toBeDefined();
  });
});
