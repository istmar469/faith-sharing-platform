import React from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, Settings, Edit, Eye, ArrowLeft, Plus } from 'lucide-react';
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
}

const SubdomainPage: React.FC<SubdomainPageProps> = ({ homepageData, adminBarOffset = false }) => {
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
      // Navigate to page builder for homepage
      const editUrl = `/page-builder/${homepageData.id}?organization_id=${organizationId}`;
      window.location.href = editUrl;
    }
  };

  const handleCreateHomepage = () => {
    // Navigate to page builder to create new homepage
    const createUrl = `/page-builder/new?organization_id=${organizationId}&homepage=true`;
    window.location.href = createUrl;
  };

  const handleBackToDashboard = () => {
    // Navigate to dashboard
    window.location.href = '/dashboard';
  };

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

  // If we have organization ID but no homepage content, show setup message
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
              <p className="text-gray-600">
                Your website is ready! Create your homepage using the page builder to get started.
              </p>
            </div>
            
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
