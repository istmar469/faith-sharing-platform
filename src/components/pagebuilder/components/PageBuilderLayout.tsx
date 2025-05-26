
import React from 'react';
import PageSideNav from '../PageSideNav';
import PageHeader from '../PageHeader';
import PageCanvas from '../PageCanvas';
import SidebarContainer from '../sidebar/SidebarContainer';
import RightSettingsPanel from '../sidebar/RightSettingsPanel';
import DebugPanel from '../preview/DebugPanel';
import TemplatePromptBar from './TemplatePromptBar';
import { PluginSystemProvider } from '@/components/dashboard/PluginSystemProvider';
import { Badge } from '@/components/ui/badge';
import { Globe, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { usePageBuilder } from '../context/PageBuilderContext';
import { useTenantContext } from '@/components/context/TenantContext';
import { toast } from 'sonner';

interface PageBuilderLayoutProps {
  isSuperAdmin: boolean;
  organizationId: string | null;
  pageData: any;
  showTemplatePrompt: boolean;
  debugMode: boolean;
  subdomain?: string | null;
  isSubdomainAccess?: boolean;
}

const PageBuilderLayout: React.FC<PageBuilderLayoutProps> = ({
  isSuperAdmin,
  organizationId,
  pageData,
  showTemplatePrompt,
  debugMode,
  subdomain,
  isSubdomainAccess = false
}) => {
  const navigate = useNavigate();
  const { isSubdomainAccess: contextSubdomain } = useTenantContext();
  const { 
    savePage, 
    isSaving, 
    pageTitle, 
    setIsPublished, 
    isPublished,
    pageElements 
  } = usePageBuilder();
  
  const [publishing, setPublishing] = React.useState(false);
  
  // Use context value for subdomain access
  const isActuallySubdomain = contextSubdomain || isSubdomainAccess;
  
  // Check if there are unsaved changes - use content array for Puck format
  const isDirty = pageElements && pageElements.content && pageElements.content.length > 0;
  
  const handleBackToDashboard = async () => {
    console.log("PageBuilderLayout: Navigating back to dashboard", {
      isActuallySubdomain,
      organizationId,
      subdomain
    });
    
    // Save changes before navigating
    try {
      if (isDirty) {
        await savePage();
        toast.success("Changes saved successfully!");
      }
      
      // Navigate back to appropriate dashboard
      if (isActuallySubdomain) {
        console.log("Navigating to subdomain dashboard");
        navigate('/');
      } else {
        console.log("Navigating to main dashboard");
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error("Failed to save changes before navigating");
      console.error("Error saving before navigation:", err);
    }
  };
  
  const handlePublish = async () => {
    try {
      setPublishing(true);
      setIsPublished(true);
      await savePage();
      toast.success("Page published successfully!");
    } catch (err) {
      toast.error("Failed to publish page");
      console.error("Error publishing page:", err);
      setIsPublished(false);
    } finally {
      setPublishing(false);
    }
  };
  
  return (
    <PluginSystemProvider organizationId={organizationId}>
      <div className="flex h-screen bg-gray-100 site-builder-layout overflow-hidden">
        {/* Only show side nav when not in subdomain mode */}
        {!isActuallySubdomain && <PageSideNav isSuperAdmin={isSuperAdmin} />}
        
        <div className="flex-1 flex flex-col site-builder-content">
          <div className="flex flex-col site-builder-header">
            {/* Always show back button for clean navigation */}
            <div className="bg-white border-b border-gray-200 p-2 px-3 sm:px-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleBackToDashboard}
                className="flex items-center gap-1"
                disabled={isSaving}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
            
            <PageHeader 
              pageName={pageTitle}
              onSave={savePage}
              onPublish={handlePublish}
              isDirty={isDirty}
              isPublished={isPublished}
              saving={isSaving}
              publishing={publishing}
            />
            
            {(subdomain || organizationId) && (
              <div className="bg-white border-t border-b px-3 sm:px-4 py-1 flex items-center">
                <Globe className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">Editing site: </span>
                <Badge variant="outline" className="ml-2">
                  {isActuallySubdomain && subdomain ? `${subdomain}.church-os.com` : `Organization: ${organizationId}`}
                </Badge>
              </div>
            )}
          </div>
          
          {showTemplatePrompt && <TemplatePromptBar />}
          
          <div className="flex flex-1 overflow-hidden site-builder-workspace">
            {/* Left Sidebar - Page Elements and Tools */}
            <SidebarContainer />
            
            {/* Main Canvas */}
            <div className="flex-1 overflow-auto site-builder-canvas">
              <PageCanvas />
            </div>
            
            {/* Right Settings Panel */}
            <RightSettingsPanel />
          </div>
          
          {debugMode && organizationId && <DebugPanel organizationId={organizationId} pageData={pageData} />}
        </div>
      </div>
    </PluginSystemProvider>
  );
};

export default PageBuilderLayout;
