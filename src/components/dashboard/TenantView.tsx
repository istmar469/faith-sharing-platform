
import React from 'react';
import SideNav from './SideNav';
import DashboardStats from './DashboardStats';
import QuickActions from './QuickActions';
import ActivitySubscription from './ActivitySubscription';
import { Organization } from './hooks/useTenantDashboard';

interface TenantViewProps {
  userOrganizations: Organization[];
  isSuperAdmin: boolean;
  showComingSoonToast: () => void;
}

const TenantView: React.FC<TenantViewProps> = ({ 
  userOrganizations, 
  isSuperAdmin, 
  showComingSoonToast 
}) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <SideNav isSuperAdmin={isSuperAdmin} />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Tenant Dashboard</h1>
            {userOrganizations.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {userOrganizations[0].name}
              </p>
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
