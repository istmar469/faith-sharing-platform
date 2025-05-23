
import React from 'react';
import PageSideNav from '../PageSideNav';
import PageHeader from '../PageHeader';
import PageCanvas from '../PageCanvas';
import SidebarContainer from '../sidebar/SidebarContainer';
import DebugPanel from '../preview/DebugPanel';
import TemplatePromptBar from './TemplatePromptBar';

interface PageBuilderLayoutProps {
  isSuperAdmin: boolean;
  organizationId: string | null;
  pageData: any;
  showTemplatePrompt: boolean;
  debugMode: boolean;
}

const PageBuilderLayout: React.FC<PageBuilderLayoutProps> = ({
  isSuperAdmin,
  organizationId,
  pageData,
  showTemplatePrompt,
  debugMode
}) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <PageSideNav isSuperAdmin={isSuperAdmin} />
      <div className="flex-1 flex flex-col">
        <PageHeader />
        
        {showTemplatePrompt && <TemplatePromptBar />}
        
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto">
            <PageCanvas />
          </div>
          
          <SidebarContainer />
        </div>
        
        {debugMode && organizationId && <DebugPanel organizationId={organizationId} pageData={pageData} />}
      </div>
    </div>
  );
};

export default PageBuilderLayout;
