
import React from 'react';
import { useTenantContext } from '@/components/context/TenantContext';
import FullSiteBuilder from '@/components/sitebuilder/FullSiteBuilder';

const PagesTab: React.FC = () => {
  const { organizationId } = useTenantContext();

  return (
    <div className="w-full">
      <FullSiteBuilder organizationId={organizationId} />
    </div>
  );
};

export default PagesTab;
