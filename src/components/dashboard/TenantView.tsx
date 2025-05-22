
import React from 'react';
import { useParams } from 'react-router-dom';
import SideNav from './SideNav';
import DashboardStats from './DashboardStats';
import QuickActions from './QuickActions';
import ActivitySubscription from './ActivitySubscription';
import { Organization } from './hooks/useTenantDashboard';
import { OrganizationSwitcher } from '.';

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
  const { organizationId } = useParams();
  const organization = currentOrganization || userOrganizations.find(org => org.id === organizationId);
  
  return (
    <div className="flex h-screen bg-gray-100">
      <SideNav isSuperAdmin={isSuperAdmin} />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tenant Dashboard</h1>
              {organization && (
                <p className="text-sm text-muted-foreground">
                  {organization.name}
                </p>
              )}
            </div>
            
            {isSuperAdmin && userOrganizations.length > 0 && (
              <div>
                <OrganizationSwitcher 
                  currentOrganizationId={organizationId} 
                  currentOrganizationName={organization?.name}
                />
              </div>
            )}
          </div>
        </header>
        
        <main className="p-6">
          <DashboardStats />
          <QuickActions showComingSoonToast={showComingSoonToast} />
          <ActivitySubscription showComingSoonToast={showComingSoonToast} />
        </main>
      </div>
    </div>
  );
};

export default TenantView;
