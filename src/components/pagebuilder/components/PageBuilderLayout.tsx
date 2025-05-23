
import React from 'react';
import PageSideNav from '../PageSideNav';
import PageHeader from '../PageHeader';
import PageCanvas from '../PageCanvas';
import SidebarContainer from '../sidebar/SidebarContainer';
import DebugPanel from '../preview/DebugPanel';
import TemplatePromptBar from './TemplatePromptBar';
import { Badge } from '@/components/ui/badge';
import { Globe } from 'lucide-react';

interface PageBuilderLayoutProps {
  isSuperAdmin: boolean;
  organizationId: string | null;
  pageData: any;
  showTemplatePrompt: boolean;
  debugMode: boolean;
  subdomain?: string | null;
}

const PageBuilderLayout: React.FC<PageBuilderLayoutProps> = ({
  isSuperAdmin,
  organizationId,
  pageData,
  showTemplatePrompt,
  debugMode,
  subdomain
}) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <PageSideNav isSuperAdmin={isSuperAdmin} />
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col">
          <PageHeader />
          
          {subdomain && (
            <div className="bg-white border-t border-b px-4 py-1 flex items-center">
              <Globe className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-sm text-muted-foreground">Editing site: </span>
              <Badge variant="outline" className="ml-2">
                {subdomain}.church-os.com
              </Badge>
            </div>
          )}
        </div>
        
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
