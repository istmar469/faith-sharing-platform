import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { organizationId } = useTenantContext();
  
  // Check if we're on page builder
  const isOnPageBuilder = location.pathname.includes('/page-builder');
  
  const handleDashboardClick = () => {
    if (isSubdomainAccess) {
      navigate('/');
    } else if (organizationId) {
      navigate(`/dashboard/${organizationId}`);
    } else {
      navigate('/dashboard');
    }
  };

  const isActive = (path: string) => {
    if (path === '/dashboard' || path === '/') {
      // Dashboard is active if we're not on page builder
      return !isOnPageBuilder;
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const mainNavItems = [
    {
      title: "Dashboard",
      path: isSubdomainAccess ? "/" : "/dashboard",
      icon: LayoutDashboard,
      active: !isOnPageBuilder,
      onClick: handleDashboardClick
    }
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {mainNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.onClick ? (
                <SidebarMenuButton isActive={item.active} onClick={item.onClick}>
                  <item.icon className="mr-3 h-5 w-5" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton asChild isActive={item.active}>
                  <OrgAwareLink to={item.path}>
                    <item.icon className="mr-3 h-5 w-5" />
                    <span>{item.title}</span>
                  </OrgAwareLink>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default SidebarNavigation;
