import React from 'react';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import DashboardSidebarHeader from './sidebar/SidebarHeader';
import DashboardSidebarFooter from './sidebar/SidebarFooter';
import SidebarNavigation from './sidebar/SidebarNavigation';
import SidebarAdminSection from './sidebar/SidebarAdminSection';

interface SuperAdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({ 
  activeTab,
  onTabChange 
}) => {
  console.log("SuperAdminSidebar: Rendering super admin specific sidebar", {
    activeTab,
    timestamp: new Date().toISOString()
  });

  return (
    <Sidebar>
      <DashboardSidebarHeader />
      
      <SidebarContent>
        <SidebarNavigation isSubdomainAccess={false} />
        
        {/* Super Admin specific navigation */}
        <div className="space-y-1">
          <div className="px-3 py-2">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Super Admin
            </h2>
          </div>
          <button
            onClick={() => onTabChange('organizations')}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'organizations'
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m0 0h2M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10V9a2 2 0 012-2h2a2 2 0 012 2v10M9 7h1m-1 4h1" />
            </svg>
            Organizations
          </button>
          <button
            onClick={() => onTabChange('pages')}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'pages'
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            All Pages
          </button>
        </div>
        
        <SidebarAdminSection showSuperAdminFeatures={true} />
      </SidebarContent>
      
      <DashboardSidebarFooter />
    </Sidebar>
  );
};

export default SuperAdminSidebar; 