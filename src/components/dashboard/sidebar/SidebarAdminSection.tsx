
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Users, Settings } from 'lucide-react';
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

interface SidebarAdminSectionProps {
  showSuperAdminFeatures: boolean;
}

const SidebarAdminSection: React.FC<SidebarAdminSectionProps> = ({ showSuperAdminFeatures }) => {
  const location = useLocation();
  const { getOrgAwarePath } = useTenantContext();
  
  const isActive = (path: string) => {
    const orgAwarePath = getOrgAwarePath(path);
    return location.pathname === orgAwarePath || location.pathname.startsWith(orgAwarePath + '/');
  };

  if (!showSuperAdminFeatures) {
    return null;
  }

  const superAdminItems = [
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
  ];

  return (
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
  );
};

export default SidebarAdminSection;
