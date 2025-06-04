
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, Settings, Edit, Eye, ArrowLeft, Plus, AlertTriangle } from 'lucide-react';
import { useTenantContext } from '@/components/context/TenantContext';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PuckRenderer from '@/components/pagebuilder/puck/PuckRenderer';
import SubdomainLayout from './SubdomainLayout';

interface HomepageData {
  id: string;
  title: string;
  content: any;
}

interface SubdomainPageProps {
  homepageData: HomepageData | null;
  adminBarOffset?: boolean;
  error?: string | null;
  availablePages?: Array<{
    id: string;
    title: string;
    slug: string;
    is_homepage: boolean;
  }>;
}

const SubdomainPage: React.FC<SubdomainPageProps> = ({ 
  homepageData, 
  adminBarOffset = false,
  error = null,
  availablePages = []
}) => {
  const { organizationName, organizationId } = useTenantContext();
  const { isAuthenticated } = useAuthStatus();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleDashboardClick = () => {
    navigate(`/dashboard/${organizationId}`);
  };

  const handleEditHomepage = () => {
    if (homepageData?.id) {
      const editUrl = `/page-builder/${homepageData.id}?organization_id=${organizationId}`;
      window.location.href = editUrl;
    }
  };

  const handleCreateHomepage = () => {
    const createUrl = `/page-builder/new?organization_id=${organizationId}&homepage=true`;
    window.location.href = createUrl;
  };

  const handleViewPage = (pageId: string) => {
    const viewUrl = `/page-builder/${pageId}?organization_id=${organizationId}`;
    window.location.href = viewUrl;
  };

  const handleBackToDashboard = () => {
    window.location.href = '/dashboard';
  };

  // If there's an error, show error state
  if (error) {
    return (
      <SubdomainLayout organizationId={organizationId!}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md text-center">
            <div className="mb-8">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Page</h1>
              <p className="text-gray-600 mb-4">
                {error}
              </p>
              <p className="text-sm text-gray-500">
                Please try refreshing the page or contact support if the issue persists.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Refresh Page
              </Button>
              {isAuthenticated && (
                <Button 
                  onClick={handleDashboardClick}
                  variant="outline"
                  className="w-full"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      </SubdomainLayout>
    );
  }

  // If we have Puck content and organization ID, render with layout
  if (homepageData && organizationId) {
    return (
      <SubdomainLayout organizationId={organizationId}>
        <PuckRenderer 
          data={homepageData.content || { content: [], root: {} }}
          className="min-h-screen"
        />
      </SubdomainLayout>
    );
  }

  // If we have organization ID but no homepage content, show setup message with available pages
  if (organizationId) {
    return (
      <SubdomainLayout organizationId={organizationId}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md text-center">
            <div className="mb-8">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Edit className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to {organizationName}</h1>
              <p className="text-gray-600 mb-4">
                {availablePages.length > 0 
                  ? "Your website has pages but no homepage is set. Choose a page to view or set as homepage:"
                  : "Your website is ready! Create your homepage using the page builder to get started."
                }
              </p>
            </div>
            
            {/* Show available pages if any exist */}
            {availablePages.length > 0 && (
              <div className="mb-6 space-y-2">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Available Pages:</h3>
                {availablePages.map((page) => (
                  <div key={page.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <span className="text-sm font-medium">{page.title}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewPage(page.id)}
                        className="text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      {isAuthenticated && (
                        <Button
                          size="sm"
                          onClick={() => handleViewPage(page.id)}
                          className="text-xs"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {isAuthenticated ? (
              <div className="space-y-3">
                <Button 
                  onClick={handleCreateHomepage}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Homepage
                </Button>
                <Button 
                  onClick={handleDashboardClick}
                  variant="outline"
                  className="w-full"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 mb-4">
                  Are you the site administrator?
                </p>
                <Button 
                  onClick={handleLoginClick}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login to Edit Site
                </Button>
              </div>
            )}
          </div>
        </div>
      </SubdomainLayout>
    );
  }

  // Fallback for cases without organization ID
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Site Not Found</h1>
        <p className="text-gray-600">This subdomain is not configured.</p>
      </div>
    </div>
  );
};

export default SubdomainPage;
