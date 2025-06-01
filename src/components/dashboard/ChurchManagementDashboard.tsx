import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Tabs } from '@/components/ui/tabs';
import { useTenantContext } from '@/components/context/TenantContext';
import DashboardSidebar from './DashboardSidebar';
import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';

// Custom hooks
import { useDashboardAuth } from './hooks/useDashboardAuth';
import { useDashboardData } from './hooks/useDashboardData';
import { useDashboardNavigation } from './hooks/useDashboardNavigation';

// Components
import DashboardLoadingState from './components/DashboardLoadingState';
import DashboardErrorState from './components/DashboardErrorState';
import DashboardHeader from './components/DashboardHeader';
import DashboardTabs from './components/DashboardTabs';
import DashboardTabContent from './components/DashboardTabContent';

const ChurchManagementDashboard: React.FC = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const { isSubdomainAccess, organizationId: contextOrgId } = useTenantContext();

  // Use URL param first, then fall back to context org ID
  const currentOrgId = organizationId || contextOrgId;

  // Custom hooks for business logic
  const authState = useDashboardAuth(currentOrgId);
  const { organization, stats, loading: dataLoading } = useDashboardData(currentOrgId, authState.hasAccess);
  const navigation = useDashboardNavigation();

  // Loading state
  if (authState.loading || dataLoading) {
    return <DashboardLoadingState />;
  }

  // Authentication check
  if (!authState.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Access control
  if (!authState.hasAccess) {
    return (
      <DashboardErrorState 
        type="access-denied"
        title="Access Denied"
        description="You don't have permission to access this organization."
      />
    );
  }

  // Organization validation
  if (!currentOrgId || !organization) {
    return (
      <DashboardErrorState 
        type="not-found"
        title="Organization Not Found"
        description="The requested organization could not be found."
      />
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-white w-full">
        <DashboardSidebar 
          isSuperAdmin={false} 
          organizationId={currentOrgId} 
          activeTab={navigation.activeTab}
          onTabChange={navigation.setActiveTab}
        />
        
        <SidebarInset className="flex-1 overflow-auto">
          <DashboardHeader organization={organization} />
          
          <main className="p-6">
            <Tabs value={navigation.activeTab} onValueChange={navigation.setActiveTab} className="w-full">
              <DashboardTabs 
                activeTab={navigation.activeTab}
                onTabChange={navigation.setActiveTab}
              />
              
              <DashboardTabContent 
                activeTab={navigation.activeTab}
                stats={stats}
                organization={organization}
                onCreateEvent={navigation.handleCreateEvent}
                onViewMembers={navigation.handleViewMembers}
                onViewDonations={navigation.handleViewDonations}
                onTabChange={navigation.setActiveTab}
              />
            </Tabs>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ChurchManagementDashboard;
