
import React from 'react';
import { useTenantContext } from '@/components/context/TenantContext';
import { isMainDomain } from '@/utils/domain';
import MainDomainDashboard from './MainDomainDashboard';
import SubdomainDashboard from './SubdomainDashboard';
import { Loader2 } from 'lucide-react';

const SmartDashboardRouter: React.FC = () => {
  const { isContextReady, isSubdomainAccess } = useTenantContext();

  // Show loading while context is initializing
  if (!isContextReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center px-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-lg font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Check current hostname to determine domain type
  const hostname = window.location.hostname;
  const isRootDomain = isMainDomain(hostname);

  console.log("SmartDashboardRouter: Routing decision", {
    hostname,
    isRootDomain,
    isSubdomainAccess,
    isContextReady
  });

  // Root domain: Show organization selection dashboard
  if (isRootDomain || !isSubdomainAccess) {
    console.log("SmartDashboardRouter: Routing to MainDomainDashboard");
    return <MainDomainDashboard />;
  }

  // Subdomain: Show organization-specific dashboard
  console.log("SmartDashboardRouter: Routing to SubdomainDashboard");
  return <SubdomainDashboard />;
};

export default SmartDashboardRouter;
