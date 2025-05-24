
import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useTenantContext } from '../context/TenantContext';
import MinimalEditor from './MinimalEditor';
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
                <h1 className="text-xl font-semibold text-gray-900">Page Builder</h1>
                <p className="text-sm text-gray-500">Create and edit your website content</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <MinimalEditor
              initialData={null}
              onSave={(data) => console.log('Editor saved:', data)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageBuilder;
