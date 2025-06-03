import React from 'react';
import RouteProtection from '@/components/routing/RouteProtection';
import CleanPageBuilder from '@/components/pagebuilder/CleanPageBuilder';

const PageBuilderPage: React.FC = () => {
  return (
    <RouteProtection requiredContext="organization" fallbackRoute="/dashboard">
      <CleanPageBuilder />
    </RouteProtection>
  );
};

export default PageBuilderPage;
