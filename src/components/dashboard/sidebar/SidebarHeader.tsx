
import React from 'react';
import { SidebarHeader } from '@/components/ui/sidebar';
import OrgAwareLink from '@/components/routing/OrgAwareLink';

const DashboardSidebarHeader: React.FC = () => {
  return (
    <SidebarHeader className="p-4 border-b">
      <h1 className="text-2xl font-bold text-primary-600">
        <OrgAwareLink to="/">
          Church<span className="text-gray-900">OS</span>
        </OrgAwareLink>
      </h1>
    </SidebarHeader>
  );
};

export default DashboardSidebarHeader;
