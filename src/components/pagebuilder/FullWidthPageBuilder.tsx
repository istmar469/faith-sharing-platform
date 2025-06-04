
import React from 'react';
import { useParams } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import ConsolidatedPageBuilder from '@/pages/pagebuilder/components/ConsolidatedPageBuilder';

const FullWidthPageBuilder: React.FC = () => {
  const { pageId } = useParams();
  const { organizationId, isContextReady } = useTenantContext();
  
  console.log('FullWidthPageBuilder: Rendering with context', {
    pageId,
    organizationId,
    isContextReady
  });

  // Use the consolidated page builder which handles all the complexity
  return <ConsolidatedPageBuilder />;
};

export default FullWidthPageBuilder;
