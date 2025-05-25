
import React from 'react';
import { SidebarHeader } from '@/components/ui/sidebar';
import { useTenantContext } from '@/components/context/TenantContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import OrgAwareLink from '@/components/routing/OrgAwareLink';

const DashboardSidebarHeader: React.FC = () => {
  const { organizationId } = useTenantContext();
  const { siteSettings, loading } = useSiteSettings(organizationId);

  const logoUrl = siteSettings?.logo_url;

  return (
    <SidebarHeader className="p-4 border-b">
      <h1 className="text-2xl font-bold text-primary-600">
        <OrgAwareLink to="/" className="flex items-center">
          {logoUrl && !loading ? (
            <img 
              src={logoUrl} 
              alt="Organization Logo" 
              className="h-8 w-auto mr-2"
              onError={(e) => {
                // Hide image if it fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : null}
          <span>
            Church<span className="text-gray-900">OS</span>
          </span>
        </OrgAwareLink>
      </h1>
    </SidebarHeader>
  );
};

export default DashboardSidebarHeader;
