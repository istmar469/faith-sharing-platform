
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Paintbrush, Globe, Activity, Mail, Layout } from 'lucide-react';
import { useTenantContext } from '@/components/context/TenantContext';
import { useSubdomainRouter } from '@/hooks/useSubdomainRouter';
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
  const { navigateWithContext } = useSubdomainRouter();
  
  const isActive = (path: string) => {
    const orgAwarePath = getOrgAwarePath(path);
    return location.pathname === orgAwarePath || location.pathname.startsWith(orgAwarePath + '/');
  };

  const handleSiteBuilderClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!organizationId) {
      console.error("SidebarContentSection: No organization ID available for page builder");
      return;
    }
    
    console.log("SidebarContentSection: Opening site builder", {
      organizationId,
      pathname: window.location.pathname
    });
    
    navigateWithContext('/page-builder');
  };

  const handleFullSiteBuilderClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!organizationId) {
      console.error("SidebarContentSection: No organization ID available for full site builder");
      return;
    }
    
    console.log("SidebarContentSection: Opening full site builder", {
      organizationId,
      pathname: window.location.pathname
    });
    
    navigateWithContext('/site-builder');
  };

  if (!organizationId) {
    return null;
  }

  const contentItems = [
    {
      title: "Page Builder",
      path: "/page-builder",
      icon: Paintbrush,
      active: isActive('/page-builder') || location.pathname.includes('/page-builder'),
      onClick: handleSiteBuilderClick
    },
    {
      title: "Site Builder",
      path: "/site-builder",
      icon: Layout,
      active: isActive('/site-builder') || location.pathname.includes('/site-builder'),
      onClick: handleFullSiteBuilderClick
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
  );
};

export default SidebarContentSection;
