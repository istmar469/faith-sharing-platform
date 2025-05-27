
import React from 'react';
import RouteProtection from '@/components/routing/RouteProtection';
import ConsolidatedPageBuilder from './pagebuilder/components/ConsolidatedPageBuilder';

const PageBuilderPage: React.FC = () => {
  return (
    <RouteProtection requiredContext="organization" fallbackRoute="/dashboard">
      <ConsolidatedPageBuilder />
    </RouteProtection>
  );
};

export default PageBuilderPage;
