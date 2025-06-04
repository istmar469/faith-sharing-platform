
import React from 'react';
import RouteProtection from '@/components/routing/RouteProtection';
import SiteCustomizer from '@/components/sitebuilder/SiteCustomizer';

const SiteCustomizerPage: React.FC = () => {
  return (
    <RouteProtection requiredContext="organization" fallbackRoute="/dashboard">
      <SiteCustomizer />
    </RouteProtection>
  );
};

export default SiteCustomizerPage;
