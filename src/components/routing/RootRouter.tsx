
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import PublicHomepage from '@/components/public/PublicHomepage';
import DynamicPageRenderer from '@/components/public/DynamicPageRenderer';
import LandingPage from '@/components/landing/LandingPage';

// Simple loading component
const LoadingComponent = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    Loading...
  </div>
);

const RootRouter: React.FC = () => {
  const tenantContext = useTenantContext();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();

  if (!tenantContext || !tenantContext.isContextReady) {
    return <LoadingComponent />;
  }

  console.log('--- RootRouter Debug ---');
  console.log('Hostname:', window.location.hostname);
  console.log('TenantContext isSubdomainAccess:', tenantContext?.isSubdomainAccess);
  console.log('TenantContext subdomain:', tenantContext?.subdomain);
  console.log('Slug parameter:', slug);
  console.log('--- End RootRouter Debug ---');

  const handleShowLogin = () => {
    navigate('/login');
  };

  if (tenantContext.isSubdomainAccess) {
    // User is on a subdomain - show organization-specific content
    if (slug) {
      // Show specific page
      return <DynamicPageRenderer />;
    } else {
      // Show homepage
      return <PublicHomepage />;
    }
  } else {
    // User is on the main domain - show public pages with site elements (header/footer)
    if (slug) {
      // Show specific page for main domain
      return <DynamicPageRenderer />;
    } else {
      // Show main domain homepage with site elements
      return <PublicHomepage />;
    }
  }
};

export default RootRouter;
