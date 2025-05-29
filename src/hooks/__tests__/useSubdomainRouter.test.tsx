import { renderHook, act } from '@testing-library/react';
import { useSubdomainRouter } from '../useSubdomainRouter';
import { useTenantContext } from '@/components/context/TenantContext';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isDevelopmentEnvironment } from '@/utils/environment';

// Mock the useTenantContext hook
vi.mock('@/components/context/TenantContext', () => ({
  useTenantContext: vi.fn(),
}));

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the development environment check
vi.mock('@/utils/environment', () => ({
  isDevelopmentEnvironment: vi.fn().mockReturnValue(false),
}));

describe('useSubdomainRouter', () => {
  const mockSetTenantContext = vi.fn();
  const originalWindow = { ...window };
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    (useTenantContext as any).mockImplementation(() => ({
      organizationId: 'test-org-id',
      isSubdomainAccess: true,
      setTenantContext: mockSetTenantContext,
    }));

    // Mock window.location
    delete (window as any).location;
    window.location = {
      ...originalWindow.location,
      protocol: 'https:',
      hostname: 'example.com',
      port: '',
      href: 'https://example.com',
    } as any;
  });

  afterEach(() => {
    // Restore window.location
    window.location = originalWindow.location;
  });

  it('should navigate within current domain context when using navigateWithContext', () => {
    const { result } = renderHook(() => useSubdomainRouter());
    
    act(() => {
      result.current.navigateWithContext('/test-path');
    });

    expect(mockNavigate).toHaveBeenCalledWith('/test-path', undefined);
  });

  it('should include options when provided to navigateWithContext', () => {
    const { result } = renderHook(() => useSubdomainRouter());
    const options = { replace: true };
    
    act(() => {
      result.current.navigateWithContext('/test-path', options);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/test-path', options);
  });

  it('should redirect to subdomain when using redirectToSubdomain', () => {
    const { result } = renderHook(() => useSubdomainRouter());
    
    act(() => {
      result.current.redirectToSubdomain('test-subdomain', '/test-path');
    });

    expect(window.location.href).toBe('https://test-subdomain.example.com/test-path');
  });

  it('should handle port numbers in redirectToSubdomain', () => {
    // Update window.location for this test
    window.location = {
      ...window.location,
      protocol: 'http:',
      hostname: 'localhost',
      port: '3000',
      href: 'http://localhost:3000',
    } as any;

    const { result } = renderHook(() => useSubdomainRouter());
    
    act(() => {
      result.current.redirectToSubdomain('test', '/dashboard');
    });

    expect(window.location.href).toBe('http://test.localhost:3000/dashboard');
  });

  it('should navigate to dashboard with organization ID using navigateToDashboard', () => {
    const { result } = renderHook(() => useSubdomainRouter());
    
    act(() => {
      result.current.navigateToDashboard('test-org-123');
    });

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/test-org-123', undefined);
  });

  it('should not redirect to subdomain in development environment', () => {
    // Mock isDevelopmentEnvironment to return true

    isDevelopmentEnvironment.mockReturnValueOnce(true);

    const originalHref = window.location.href;
    
    const { result } = renderHook(() => useSubdomainRouter());
    
    act(() => {
      result.current.redirectToSubdomain('test', '/path');
    });

    // Should not change the URL in development
    expect(window.location.href).toBe(originalHref);
  });
});
