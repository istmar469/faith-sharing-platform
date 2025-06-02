
import React from 'react';
import RouteProtection from '@/components/routing/RouteProtection';
import SimplePageBuilder from '@/components/pagebuilder/SimplePageBuilder';

const PageBuilderPage: React.FC = () => {
  return (
    <RouteProtection requiredContext="organization" fallbackRoute="/dashboard">
      <SimplePageBuilder />
    </RouteProtection>
  );
};

export default PageBuilderPage;
