
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTenantContext } from '@/components/context/TenantContext';
import { isMainDomain } from '@/utils/domain';
import SubdomainDashboard from './SubdomainDashboard';
import MainDomainDashboard from './MainDomainDashboard';

const SmartDashboard: React.FC = () => {
  const { isContextReady, contextError, retryContext } = useTenantContext();
  const [dashboardType, setDashboardType] = useState<'main' | 'subdomain' | null>(null);

  useEffect(() => {
    if (!isContextReady) {
      console.log("SmartDashboard: Waiting for context to be ready");
      return;
    }
    
    const hostname = window.location.hostname;
    const isMainDomainAccess = isMainDomain(hostname);
    
    console.log("SmartDashboard: Context ready, determining dashboard type", {
      hostname,
      isMainDomainAccess,
      contextError
    });
    
    setDashboardType(isMainDomainAccess ? 'main' : 'subdomain');
  }, [isContextReady, contextError]);

  // Show loading while context is initializing
  if (!isContextReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center px-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-lg font-medium">Initializing dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Determining organization context...</p>
        </div>
      </div>
    );
  }

  // Show error if context initialization failed
  if (contextError) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center max-w-md p-6">
          <h2 className="text-2xl font-bold mb-2 text-red-600">Context Error</h2>
          <p className="mb-4 text-gray-600">{contextError}</p>
          <div className="space-y-2">
            <button
              onClick={retryContext}
              className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
            >
              Retry
            </button>
            <button
              onClick={() => window.location.href = 'https://church-os.com'}
              className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Go to Main Site
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while determining dashboard type
  if (!dashboardType) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center px-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-lg font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on access type
  console.log("SmartDashboard: Rendering dashboard type:", dashboardType);
  
  if (dashboardType === 'main') {
    return <MainDomainDashboard />;
  } else {
    return <SubdomainDashboard />;
  }
};

export default SmartDashboard;
