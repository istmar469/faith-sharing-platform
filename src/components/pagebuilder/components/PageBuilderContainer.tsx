
import React from 'react';
import { PageBuilderProvider } from '../context/PageBuilderContext';
import { PageData } from '../context/types';
import AuthenticationCheck from './AuthenticationCheck';
import PageBuilderLayout from './PageBuilderLayout';

interface PageBuilderContainerProps {
  initialPageData: PageData | null;
  isSuperAdmin: boolean;
  organizationId: string | null;
  showTemplatePrompt: boolean;
  subdomain: string | null;
  isSubdomainAccess: boolean;
  onAuthenticated: (userId: string) => void;
  onNotAuthenticated: () => void;
}

const PageBuilderContainer: React.FC<PageBuilderContainerProps> = ({
  initialPageData,
  isSuperAdmin,
  organizationId,
  showTemplatePrompt,
  subdomain,
  isSubdomainAccess,
  onAuthenticated,
  onNotAuthenticated
}) => {
  return (
    <AuthenticationCheck
      onAuthenticated={onAuthenticated}
      onNotAuthenticated={onNotAuthenticated}
    >
      <PageBuilderProvider initialPageData={initialPageData}>
        <PageBuilderLayout
          isSuperAdmin={isSuperAdmin}
          organizationId={organizationId}
          pageData={initialPageData}
          showTemplatePrompt={showTemplatePrompt}
          debugMode={false}
          subdomain={subdomain}
          isSubdomainAccess={isSubdomainAccess}
        />
      </PageBuilderProvider>
    </AuthenticationCheck>
  );
};

export default PageBuilderContainer;
