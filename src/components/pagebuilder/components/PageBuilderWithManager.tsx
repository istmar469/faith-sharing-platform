
import React from 'react';
import { usePageManagerContext } from '../context/PageManagerProvider';
import { PageBuilderProvider } from '../context/PageBuilderContext';
import PageBuilderLayout from './PageBuilderLayout';
import PageManagerStatus from './PageManagerStatus';

interface PageBuilderWithManagerProps {
  subdomain: string | null;
  isSubdomainAccess: boolean;
}

const PageBuilderWithManager: React.FC<PageBuilderWithManagerProps> = ({
  subdomain,
  isSubdomainAccess
}) => {
  const { 
    pageData, 
    organizationId, 
    isEditorReady,
    error,
    isLoading
  } = usePageManagerContext();

  // Show loading or error states
  if (isLoading || error || !pageData || !isEditorReady) {
    return <PageManagerStatus />;
  }

  return (
    <PageBuilderProvider initialPageData={pageData}>
      <PageBuilderLayout
        isSuperAdmin={false}
        organizationId={organizationId}
        pageData={pageData}
        showTemplatePrompt={false}
        debugMode={false}
        subdomain={subdomain}
        isSubdomainAccess={isSubdomainAccess}
      />
    </PageBuilderProvider>
  );
};

export default PageBuilderWithManager;
