import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import PublicHomepage from '@/components/public/PublicHomepage';
import LandingPage from '@/components/landing/LandingPage';

// Simple loading component, replace with your actual one if available
const LoadingComponent = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    Loading...
  </div>
);

const RootRouter: React.FC = () => {
  const tenantContext = useTenantContext();
  const navigate = useNavigate();

  if (!tenantContext || !tenantContext.isContextReady) {
    return <LoadingComponent />;
  }

  // Optional: Handle context initialization errors
  // if (tenantContext.contextError) {
  //   console.error("TenantContext Error in RootRouter:", tenantContext.contextError);
  //   // return <ErrorPage message={tenantContext.contextError} />;
  // }

  console.log('--- RootRouter Debug ---');
  console.log('Hostname:', window.location.hostname);
  console.log('TenantContext isSubdomainAccess:', tenantContext?.isSubdomainAccess);
  console.log('TenantContext subdomain:', tenantContext?.subdomain);
  console.log('TenantContext object:', tenantContext);
  console.log('--- End RootRouter Debug ---');

  const handleShowLogin = () => {
    navigate('/login');
  };

  if (tenantContext.isSubdomainAccess) {
    // User is on a subdomain (e.g., test3.localhost, test3.church-os.com)
    // Show the organization-specific website
    return <PublicHomepage />;
  } else {
    // User is on the main domain (e.g., localhost, church-os.com)
    // Show the main Church-OS SaaS landing page
    return <LandingPage onShowLogin={handleShowLogin} />;
  }
};

// Lint ID: fix-lint-error-123
export default RootRouter;
