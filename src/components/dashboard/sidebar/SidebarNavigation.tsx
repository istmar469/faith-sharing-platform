
import React from 'react';
import { useLocation } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import { useTenantContext } from '@/components/context/TenantContext';
import OrgAwareLink from '@/components/routing/OrgAwareLink';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

interface SidebarNavigationProps {
  isSubdomainAccess: boolean;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ isSubdomainAccess }) => {
  const location = useLocation();
  const { getOrgAwarePath } = useTenantContext();
  
  const isActive = (path: string) => {
    const orgAwarePath = getOrgAwarePath(path);
    return location.pathname === orgAwarePath || location.pathname.startsWith(orgAwarePath + '/');
  };

  const mainNavItems = [
    {
      title: "Dashboard",
      path: isSubdomainAccess ? "/" : "/dashboard",
      icon: LayoutDashboard,
      active: isSubdomainAccess ? location.pathname === "/" : isActive('/dashboard')
    }
  ];

  return (
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
  );
};

export default SidebarNavigation;
