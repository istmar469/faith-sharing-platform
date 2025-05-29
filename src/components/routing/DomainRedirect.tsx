import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import { useAuthStatus } from '@/hooks/useAuthStatus';

/**
 * DomainRedirect handles URL routing based on domain type (main vs subdomain)
 * For subdomains, it shows the organization's landing page at root path (/)
 * and protects admin routes for non-authenticated users
 */
const DomainRedirect: React.FC = () => {
  const tenantContext = useTenantContext();
  const { isAuthenticated, isCheckingAuth } = useAuthStatus(); // Using the correct property from useAuthStatus

  // Wait for the TenantContext to be ready
  if (!tenantContext || !tenantContext.isContextReady || isCheckingAuth) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  // Handle context initialization errors
  if (tenantContext.contextError) {
    console.error("TenantContext Error:", tenantContext.contextError);
    return <Navigate to="/error" replace />;
  }

  // If it's NOT a subdomain access (i.e., it's the main domain like localhost or church-os.com)
  if (!tenantContext.isSubdomainAccess) {
    // Main domain should show the main landing page, but we'll let the router handle it naturally
    // Only redirect if we're not already at root
    if (window.location.pathname !== '/') {
      return <Navigate to="/" replace />;
    }
    return null;
  }

  // For subdomain access, we want to show the organization's landing page at root
  // AND protect admin routes for non-authenticated users
  if (tenantContext.isSubdomainAccess) {
    const { pathname } = window.location;
    
    // Protect admin/authorized routes for non-authenticated users
    if ((pathname === '/page-builder' || pathname.startsWith('/dashboard')) && !isAuthenticated) {
      // Redirect to login with return URL
      return <Navigate to={`/login?returnUrl=${encodeURIComponent(pathname)}`} replace />;
    }
    
    // No redirect for subdomain root path - this allows PublicHomepage to show at /
    // For all other subdomain paths, let the router handle it naturally
    return null;
  }

  // Fallback to landing page
  return <Navigate to="/landing" replace />;
};

export default DomainRedirect;
