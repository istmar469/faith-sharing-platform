
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Laptop, FileText, Layout, Settings, Users } from 'lucide-react';
import { useTenantContext } from '@/components/context/TenantContext';

const SideNav = ({ isSuperAdmin, organizationId }: { isSuperAdmin: boolean, organizationId?: string }) => {
  const location = useLocation();
  const { getOrgAwarePath } = useTenantContext();
  
  const isActive = (path: string) => {
    const orgAwarePath = getOrgAwarePath(path);
    return location.pathname === orgAwarePath || location.pathname.startsWith(orgAwarePath + '/');
  };
  
  const OrgAwareLink = ({ to, children, className }: { to: string, children: React.ReactNode, className: string }) => {
    const orgAwarePath = getOrgAwarePath(to);
    return <Link to={orgAwarePath} className={className}>{children}</Link>;
  };
  
  return (
    <aside className="w-64 bg-white text-gray-800 h-screen flex flex-col border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary-600">
          <Link to="/">Church<span className="text-gray-900">OS</span></Link>
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
          
          <li>
            <OrgAwareLink
              to="/page-builder"
              className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${isActive('/page-builder') ? 'bg-gray-100' : ''}`}
            >
              <Laptop className="mr-3 h-5 w-5" />
              <span>Site Builder</span>
            </OrgAwareLink>
          </li>
          
          <li>
            <OrgAwareLink
              to="/pages"
              className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${isActive('/pages') ? 'bg-gray-100' : ''}`}
            >
              <FileText className="mr-3 h-5 w-5" />
              <span>Pages</span>
            </OrgAwareLink>
          </li>
          
          <li>
            <OrgAwareLink
              to="/templates"
              className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${isActive('/templates') ? 'bg-gray-100' : ''}`}
            >
              <Layout className="mr-3 h-5 w-5" />
              <span>Templates</span>
            </OrgAwareLink>
          </li>
          
          {isSuperAdmin && (
            <li>
              <OrgAwareLink
                to="/settings/user-org-assignment"
                className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${isActive('/settings/user-org-assignment') ? 'bg-gray-100' : ''}`}
              >
                <Users className="mr-3 h-5 w-5" />
                <span>User Assignment</span>
              </OrgAwareLink>
            </li>
          )}
          
          <li>
            <OrgAwareLink
              to="/settings/org-management"
              className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${isActive('/settings/org-management') ? 'bg-gray-100' : ''}`}
            >
              <Settings className="mr-3 h-5 w-5" />
              <span>Settings</span>
            </OrgAwareLink>
          </li>
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
