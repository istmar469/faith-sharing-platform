import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext'; 

const DomainRedirect: React.FC = () => {
  const tenantContext = useTenantContext();

  // Wait for the TenantContext to be ready
  if (!tenantContext || !tenantContext.isContextReady) {
    // Replace with your actual loading component if you have one
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  // Optional: Handle context initialization errors
  // if (tenantContext.contextError) {
  //   // You might want to redirect to an error page or display an error message
  //   console.error("TenantContext Error:", tenantContext.contextError);
  //   // return <Navigate to="/error" replace />;
  // }

  // If it's NOT a subdomain access (i.e., it's the main domain like localhost or church-os.com)
  if (!tenantContext.isSubdomainAccess) {
    // Redirect to your main public landing page. 
    // Change '/home' if your main landing page route is different (e.g., '/')
    return <Navigate to="/" replace />;
  }

  // If it IS a subdomain access, redirect to the page-builder (or tenant dashboard/landing)
  // This was the original behavior for subdomains and is often the desired starting point for a tenant.
  return <Navigate to="/page-builder" replace />;
};

export default DomainRedirect;
