
import React from 'react';
import { usePageManagerContext } from '../context/PageManagerProvider';
import { PageBuilderProvider } from '../context/PageBuilderContext';
import AuthenticationCheck from './AuthenticationCheck';
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
    isAuthenticated, 
    pageData, 
    organizationId, 
    isEditorReady,
    error,
    isLoading
  } = usePageManagerContext();

  // Show loading or error states
  if (isLoading || error || !isAuthenticated || !pageData || !isEditorReady) {
    return <PageManagerStatus />;
  }

  return (
    <AuthenticationCheck
      onAuthenticated={(userId) => {
        console.log("PageBuilder: User authenticated:", userId);
      }}
      onNotAuthenticated={() => {
        console.log("PageBuilder: User not authenticated");
      }}
    >
      <PageBuilderProvider initialPageData={pageData}>
        <PageBuilderLayout
          isSuperAdmin={false} // Will be determined by the auth check
          organizationId={organizationId}
          pageData={pageData}
          showTemplatePrompt={false}
          debugMode={false}
          subdomain={subdomain}
          isSubdomainAccess={isSubdomainAccess}
        />
      </PageBuilderProvider>
    </AuthenticationCheck>
  );
};

export default PageBuilderWithManager;
