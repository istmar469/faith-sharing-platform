
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Globe, Activity, Mail, Layout } from 'lucide-react';
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
  const { getOrgAwarePath, isSubdomainAccess } = useTenantContext();
  
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
