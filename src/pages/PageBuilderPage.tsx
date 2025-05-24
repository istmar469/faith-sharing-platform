
import React from 'react';
import { useParams } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import MinimalEditor from '@/components/pagebuilder/MinimalEditor';
import { ArrowLeft, Save, Eye, Settings, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const PageBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { pageId } = useParams<{ pageId?: string }>();
  const { organizationId, isSubdomainAccess } = useTenantContext();

  console.log("PageBuilderPage: Enhanced initialization", {
    organizationId,
    isSubdomainAccess,
    pageId,
    timestamp: new Date().toISOString()
  });

  const handleSave = (data: any) => {
    console.log('PageBuilderPage: Saving enhanced page data:', data);
    // TODO: Implement actual save functionality with better feedback
  };

  const handleBackToDashboard = () => {
    console.log("PageBuilderPage: Navigating back to dashboard", {
      isSubdomainAccess,
      organizationId
    });
    
    if (isSubdomainAccess) {
      navigate('/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handlePreview = () => {
    console.log("PageBuilderPage: Opening preview");
    // TODO: Implement preview functionality
  };

  const handleSettings = () => {
    console.log("PageBuilderPage: Opening page settings");
    // TODO: Implement page settings
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleBackToDashboard}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Page Builder</h1>
                <p className="text-sm text-gray-500">Create and edit your website content</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {organizationId && (
                <Badge variant="outline" className="text-xs">
                  {isSubdomainAccess ? 'Subdomain' : 'Organization'}: {organizationId}
                </Badge>
              )}
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePreview}
                  className="flex items-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSettings}
                  className="flex items-center gap-1"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Welcome Banner */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-blue-900 mb-1">
                Welcome to the Enhanced Page Builder
              </h2>
              <p className="text-blue-700 text-sm">
                Create beautiful content with our advanced editor featuring headers, lists, quotes, and more!
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1 text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              <HelpCircle className="h-4 w-4" />
              Help
            </Button>
          </div>
        </div>

        {/* Editor Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <MinimalEditor
              initialData={null}
              onSave={handleSave}
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Changes are automatically saved. Use keyboard shortcuts for faster editing.</p>
        </div>
      </div>
    </div>
  );
};

export default PageBuilderPage;
