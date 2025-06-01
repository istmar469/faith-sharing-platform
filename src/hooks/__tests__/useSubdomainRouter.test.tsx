
import { renderHook, act } from '@testing-library/react';
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
    
    expect(result.current.isSubdomainAccess).toBe(false);
    expect(result.current.organizationId).toBe(null);
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
    
    expect(result.current.isSubdomainAccess).toBe(true);
    expect(result.current.organizationId).toBe('test-org-id');
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
    
    expect(result.current.isContextReady).toBe(false);
  });
});
