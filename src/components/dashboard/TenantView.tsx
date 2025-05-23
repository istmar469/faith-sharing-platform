
import React from 'react';
import SideNav from './SideNav';
import DashboardStats from './DashboardStats';
import QuickActions from './QuickActions';
import ActivitySubscription from './ActivitySubscription';
import { Organization } from './hooks/useTenantDashboard';
import { OrganizationSwitcher } from '.';
import ViewModeToggle from './ViewModeToggle';
import { useTenantContext } from '@/components/context/TenantContext';

interface TenantViewProps {
  userOrganizations: Organization[];
  currentOrganization?: Organization | null;
  isSuperAdmin: boolean;
  showComingSoonToast: () => void;
}

const TenantView: React.FC<TenantViewProps> = ({ 
  userOrganizations, 
  currentOrganization,
  isSuperAdmin, 
  showComingSoonToast 
}) => {
  const { organizationId, isSubdomainAccess } = useTenantContext();
  
  return (
    <div className="flex h-screen bg-white">
      {!isSubdomainAccess && <SideNav isSuperAdmin={isSuperAdmin} organizationId={organizationId} />}
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isSubdomainAccess ? 'Dashboard' : 'Tenant Dashboard'}
                </h1>
                {currentOrganization && (
                  <p className="text-sm text-muted-foreground">
                    {currentOrganization.name}
                  </p>
                )}
              </div>
              
              {isSuperAdmin && userOrganizations.length > 0 && !isSubdomainAccess && (
                <div>
                  <OrganizationSwitcher 
                    currentOrganizationId={organizationId} 
                    currentOrganizationName={currentOrganization?.name}
                  />
                </div>
              )}
            </div>
            
            {/* Add the ViewModeToggle only for super admins on main domain */}
            {isSuperAdmin && !isSubdomainAccess && (
              <div className="flex justify-end border-t pt-2 mt-2">
                <ViewModeToggle />
              </div>
            )}
          </div>
        </header>
        
        <main className="p-6">
          <DashboardStats />
          <QuickActions 
            organizationId={organizationId} 
            showComingSoonToast={showComingSoonToast}
          />
          <ActivitySubscription 
            showComingSoonToast={showComingSoonToast}
            organizationId={organizationId} 
          />
        </main>
      </div>
    </div>
  );
};

export default TenantView;
