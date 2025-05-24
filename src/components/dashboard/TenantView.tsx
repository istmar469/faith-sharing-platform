
import React from 'react';
import DashboardStats from './DashboardStats';
import QuickActions from './QuickActions';
import ActivitySubscription from './ActivitySubscription';
import { Organization } from './hooks/useTenantDashboard';
import { OrganizationSwitcher } from '.';
import { useTenantContext } from '@/components/context/TenantContext';
import DashboardSidebar from './DashboardSidebar';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';

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
    <SidebarProvider>
      <div className="flex h-screen bg-white w-full">
        <DashboardSidebar isSuperAdmin={isSuperAdmin} organizationId={organizationId} />
        
        <SidebarInset className="flex-1 overflow-auto">
          <header className="bg-white shadow-sm border-b">
            <div className="px-6 py-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="lg:hidden" />
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
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default TenantView;
