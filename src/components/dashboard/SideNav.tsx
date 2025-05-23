
import React from 'react';
import { useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, Users, Paintbrush } from 'lucide-react';
import { useTenantContext } from '@/components/context/TenantContext';
import { useSubdomainRouter } from '@/hooks/useSubdomainRouter';
import OrgAwareLink from '@/components/routing/OrgAwareLink';

const SideNav = ({ isSuperAdmin, organizationId }: { isSuperAdmin: boolean, organizationId?: string }) => {
  const location = useLocation();
  const { getOrgAwarePath, isSubdomainAccess } = useTenantContext();
  const { navigateWithContext } = useSubdomainRouter();
  
  const isActive = (path: string) => {
    const orgAwarePath = getOrgAwarePath(path);
    return location.pathname === orgAwarePath || location.pathname.startsWith(orgAwarePath + '/');
  };
  
  // Handler for opening site builder with subdomain context
  const handleSiteBuilderClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!organizationId) {
      console.error("SideNav: No organization ID available for page builder");
      return;
    }
    
    console.log("SideNav: Opening site builder", {
      organizationId,
      isSubdomainAccess,
      pathname: window.location.pathname
    });
    
    // Use subdomain-aware navigation
    navigateWithContext('/page-builder');
  };
  
  return (
    <aside className="w-64 bg-white text-gray-800 h-screen flex flex-col border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary-600">
          <OrgAwareLink to="/">Church<span className="text-gray-900">OS</span></OrgAwareLink>
        </h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          <li>
            <OrgAwareLink
              to="/tenant-dashboard"
              className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${isActive('/tenant-dashboard') ? 'bg-gray-100' : ''}`}
            >
              <LayoutDashboard className="mr-3 h-5 w-5" />
              <span>Dashboard</span>
            </OrgAwareLink>
          </li>
          
          {/* Website Builder for both super admins and regular users when org ID is available */}
          {organizationId && (
            <li>
              <a 
                href="#"
                onClick={handleSiteBuilderClick} 
                className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${isActive('/page-builder') || location.pathname.includes('/page-builder') ? 'bg-gray-100' : ''}`}
              >
                <Paintbrush className="mr-3 h-5 w-5" />
                <span>Website Builder</span>
              </a>
            </li>
          )}
          
          {isSuperAdmin && (
            <>
              <li>
                <OrgAwareLink
                  to="/settings/user-org-assignment"
                  className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${isActive('/settings/user-org-assignment') ? 'bg-gray-100' : ''}`}
                >
                  <Users className="mr-3 h-5 w-5" />
                  <span>User Assignment</span>
                </OrgAwareLink>
              </li>
              <li>
                <OrgAwareLink
                  to="/settings/domains"
                  className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${isActive('/settings/domains') ? 'bg-gray-100' : ''}`}
                >
                  <Settings className="mr-3 h-5 w-5" />
                  <span>Domain Settings</span>
                </OrgAwareLink>
              </li>
              <li>
                <OrgAwareLink
                  to="/settings/org-management"
                  className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${isActive('/settings/org-management') ? 'bg-gray-100' : ''}`}
                >
                  <Settings className="mr-3 h-5 w-5" />
                  <span>Org Management</span>
                </OrgAwareLink>
              </li>
            </>
          )}
          
          {!isSuperAdmin && (
            <li>
              <OrgAwareLink
                to="/settings/org-management"
                className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${isActive('/settings/org-management') ? 'bg-gray-100' : ''}`}
              >
                <Settings className="mr-3 h-5 w-5" />
                <span>Settings</span>
              </OrgAwareLink>
            </li>
          )}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <a href="https://churchos.freshdesk.com/support/home" target="_blank" rel="noopener noreferrer" className="block text-gray-600 hover:text-gray-900 transition-colors">
          Support
        </a>
        <a href="https://status.churchos.com" target="_blank" rel="noopener noreferrer" className="block mt-2 text-gray-600 hover:text-gray-900 transition-colors">
          Status
        </a>
      </div>
    </aside>
  );
};

export default SideNav;
