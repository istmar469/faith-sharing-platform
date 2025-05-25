
import React from 'react';
import { useTenantContext } from '@/components/context/TenantContext';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import DashboardSidebarHeader from './sidebar/SidebarHeader';
import DashboardSidebarFooter from './sidebar/SidebarFooter';
import SidebarNavigation from './sidebar/SidebarNavigation';
import SidebarContentSection from './sidebar/SidebarContentSection';
import SidebarAdminSection from './sidebar/SidebarAdminSection';
import SidebarSettingsSection from './sidebar/SidebarSettingsSection';

interface DashboardSidebarProps {
  isSuperAdmin: boolean;
  organizationId?: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  isSuperAdmin, 
  organizationId,
  activeTab,
  onTabChange 
}) => {
  const { isSubdomainAccess } = useTenantContext();
  
  // Enhanced security logging
  console.log("DashboardSidebar: Enhanced security check", {
    isSuperAdmin,
    isSubdomainAccess,
    organizationId,
    shouldShowSuperAdminFeatures: isSuperAdmin && !isSubdomainAccess,
    timestamp: new Date().toISOString()
  });
  
  // Critical security check: Only show super admin features if user is actually super admin
  // AND not accessing via subdomain (which should be regular user view)
  const showSuperAdminFeatures = isSuperAdmin && !isSubdomainAccess;
  
  // Regular user settings - ONLY show if NOT super admin OR on subdomain
  const showUserSettings = !showSuperAdminFeatures;

  // Additional security logging for menu items
  console.log("DashboardSidebar: Menu items configured", {
    showSuperAdminFeatures,
    showUserSettings,
    securityStatus: showSuperAdminFeatures ? "SUPER_ADMIN_MODE" : "REGULAR_USER_MODE"
  });

  return (
    <Sidebar>
      <DashboardSidebarHeader />
      
      <SidebarContent>
        <SidebarNavigation isSubdomainAccess={isSubdomainAccess} />
        <SidebarContentSection 
          activeTab={activeTab}
          onTabChange={onTabChange}
          organizationId={organizationId} 
        />
        <SidebarAdminSection showSuperAdminFeatures={showSuperAdminFeatures} />
        <SidebarSettingsSection showUserSettings={showUserSettings} />
      </SidebarContent>
      
      <DashboardSidebarFooter />
    </Sidebar>
  );
};

export default DashboardSidebar;
