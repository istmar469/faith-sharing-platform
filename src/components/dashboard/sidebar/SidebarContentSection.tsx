
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Layout, Edit } from 'lucide-react';
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

interface SidebarContentSectionProps {
  organizationId?: string;
}

const SidebarContentSection: React.FC<SidebarContentSectionProps> = ({ organizationId }) => {
  const location = useLocation();
  const { getOrgAwarePath } = useTenantContext();
  
  const isActive = (path: string) => {
    const orgAwarePath = getOrgAwarePath(path);
    return location.pathname === orgAwarePath || location.pathname.startsWith(orgAwarePath + '/');
  };

  if (!organizationId) {
    return null;
  }

  const contentItems = [
    {
      title: "Site Builder",
      path: "/site-builder",
      icon: Layout,
      active: isActive('/site-builder') || location.pathname.includes('/site-builder')
    },
    {
      title: "Edit Site",
      path: "/page-builder",
      icon: Edit,
      active: isActive('/page-builder') || location.pathname.includes('/page-builder')
    }
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Content</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {contentItems.map((item) => (
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

export default SidebarContentSection;
