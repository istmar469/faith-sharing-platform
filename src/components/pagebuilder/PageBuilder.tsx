
import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useTenantContext } from '../context/TenantContext';
import { PageBuilderProvider } from './context/PageBuilderContext';
import PageCanvasContainer from './components/PageCanvasContainer';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OrgAwareLink from '@/components/routing/OrgAwareLink';

const PageBuilder = () => {
  const { pageId } = useParams<{ pageId?: string }>();
  const { organizationId, subdomain, isSubdomainAccess, isContextReady } = useTenantContext();
  const location = useLocation();
  
  // Enhanced debug logging
  useEffect(() => {
    console.log("=== PageBuilder: State Monitor ===");
    console.log("PageBuilder: Current state", {
      pageId,
      organizationId,
      subdomain,
      isSubdomainAccess,
      isContextReady,
      pathname: location.pathname,
      search: location.search,
      timestamp: new Date().toISOString()
    });
  }, [pageId, organizationId, subdomain, isSubdomainAccess, isContextReady, location]);

  // Wait for context to be ready
  if (!isContextReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Initializing application context...</p>
        </div>
      </div>
    );
  }

  // For subdomain access, we need an organizationId from context
  if (isSubdomainAccess && !organizationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading organization context...</p>
        </div>
      </div>
    );
  }

  // Create initial page data for new pages
  const initialPageData = {
    content: { content: [], root: {} },
    organization_id: organizationId,
    title: 'New Page',
    slug: '',
    published: false,
    show_in_navigation: true,
    is_homepage: false
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <OrgAwareLink to="/">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </OrgAwareLink>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Visual Page Builder</h1>
                <p className="text-sm text-gray-500">Create and edit your website content with drag & drop</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="h-[calc(100vh-120px)]">
        <PageBuilderProvider initialPageData={initialPageData}>
          <PageCanvasContainer
            organizationId={organizationId || ''}
            isEditorInitializing={false}
            editorError={null}
            showFallback={false}
            hasContent={false}
            editorKey={1}
            initialEditorData={{ content: [], root: {} }}
            pageElements={{ content: [], root: {} }}
            handleEditorChange={(data) => console.log('Puck data changed:', data)}
            handleEditorReady={() => console.log('Puck editor ready')}
            handleRetryEditor={() => {}}
            handleShowFallback={() => {}}
          />
        </PageBuilderProvider>
      </div>
    </div>
  );
};

export default PageBuilder;
