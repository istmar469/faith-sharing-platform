
import React from 'react';
import RouteProtection from '@/components/routing/RouteProtection';
import FullWidthPageBuilder from '@/components/pagebuilder/FullWidthPageBuilder';

const PageBuilderPage: React.FC = () => {
  return (
    <RouteProtection requiredContext="organization" fallbackRoute="/dashboard">
      <FullWidthPageBuilder />
    </RouteProtection>
  );
};

export default PageBuilderPage;
