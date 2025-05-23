
import React from 'react';
import { useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, Users, Paintbrush, Globe, Activity, Mail } from 'lucide-react';
import { useTenantContext } from '@/components/context/TenantContext';
import { useSubdomainRouter } from '@/hooks/useSubdomainRouter';
import OrgAwareLink from '@/components/routing/OrgAwareLink';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

interface DashboardSidebarProps {
  isSuperAdmin: boolean;
  organizationId?: string;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isSuperAdmin, organizationId }) => {
  const location = useLocation();
  const { getOrgAwarePath, isSubdomainAccess } = useTenantContext();
  const { navigateWithContext } = useSubdomainRouter();
  
  const isActive = (path: string) => {
    const orgAwarePath = getOrgAwarePath(path);
    return location.pathname === orgAwarePath || location.pathname.startsWith(orgAwarePath + '/');
  };
  
  const handleSiteBuilderClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!organizationId) {
      console.error("DashboardSidebar: No organization ID available for page builder");
      return;
    }
    
    console.log("DashboardSidebar: Opening site builder", {
      organizationId,
      isSubdomainAccess,
      pathname: window.location.pathname
    });
    
    navigateWithContext('/page-builder');
  };

  // Main navigation items - available to all users
  const mainNavItems = [
    {
      title: "Dashboard",
      path: isSubdomainAccess ? "/" : "/tenant-dashboard",
      icon: LayoutDashboard,
      active: isSubdomainAccess ? location.pathname === "/" : isActive('/tenant-dashboard')
    }
  ];

  // Content management items - available when organizationId exists
  const contentItems = organizationId ? [
    {
      title: "Website Builder",
      path: "/page-builder",
      icon: Paintbrush,
      active: isActive('/page-builder') || location.pathname.includes('/page-builder'),
      onClick: handleSiteBuilderClick
    },
    {
      title: "Pages",
      path: "/pages",
      icon: Globe,
      active: isActive('/pages')
    },
    {
      title: "Communication",
      path: "/communication",
      icon: Mail,
      active: isActive('/communication')
    },
    {
      title: "Activity",
      path: "/activity",
      icon: Activity,
      active: isActive('/activity')
    }
  ] : [];

  // Super admin specific items
  const superAdminItems = isSuperAdmin ? [
    {
      title: "User Assignment",
      path: "/settings/user-org-assignment",
      icon: Users,
      active: isActive('/settings/user-org-assignment')
    },
    {
      title: "Domain Settings",
      path: "/settings/domains",
      icon: Settings,
      active: isActive('/settings/domains')
    },
    {
      title: "Org Management",
      path: "/settings/org-management",
      icon: Settings,
      active: isActive('/settings/org-management')
    }
  ] : [];

  // Regular user settings
  const userSettingsItems = !isSuperAdmin ? [
    {
      title: "Settings",
      path: "/settings/org-management",
      icon: Settings,
      active: isActive('/settings/org-management')
    }
  ] : [];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <h1 className="text-2xl font-bold text-primary-600">
          <OrgAwareLink to="/">
            Church<span className="text-gray-900">OS</span>
          </OrgAwareLink>
        </h1>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.active}>
                    <OrgAwareLink to={item.path} className="flex items-center">
                      <item.icon className="mr-3 h-5 w-5" />
                      <span>{item.title}</span>
                    </OrgAwareLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Content Management */}
        {contentItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Content</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {contentItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.active}>
                      {item.onClick ? (
                        <a href="#" onClick={item.onClick} className="flex items-center">
                          <item.icon className="mr-3 h-5 w-5" />
                          <span>{item.title}</span>
                        </a>
                      ) : (
                        <OrgAwareLink to={item.path} className="flex items-center">
                          <item.icon className="mr-3 h-5 w-5" />
                          <span>{item.title}</span>
                        </OrgAwareLink>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Super Admin Tools */}
        {superAdminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {superAdminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.active}>
                      <OrgAwareLink to={item.path} className="flex items-center">
                        <item.icon className="mr-3 h-5 w-5" />
                        <span>{item.title}</span>
                      </OrgAwareLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* User Settings */}
        {userSettingsItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {userSettingsItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.active}>
                      <OrgAwareLink to={item.path} className="flex items-center">
                        <item.icon className="mr-3 h-5 w-5" />
                        <span>{item.title}</span>
                      </OrgAwareLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t">
        <div className="space-y-2">
          <a 
            href="https://churchos.freshdesk.com/support/home" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Support
          </a>
          <a 
            href="https://status.churchos.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Status
          </a>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
