import React from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, Settings, Edit, Eye, ArrowLeft } from 'lucide-react';
import { useTenantContext } from '@/components/context/TenantContext';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PuckRenderer from '@/components/pagebuilder/puck/PuckRenderer';
import PublicHomepage from '@/components/public/PublicHomepage';
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

  // Check if this is preview mode from URL params
  const isPreviewMode = searchParams.get('preview') === 'true';
  const hasEditMode = searchParams.get('editMode') === 'true';
  const showAdminOverlay = isAuthenticated; // Show for all authenticated users

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

  const handleBackToDashboard = () => {
    // Navigate to dashboard
    window.location.href = '/dashboard';
  };

  const togglePreviewMode = () => {
    if (isPreviewMode) {
      // Exit preview mode - go to normal homepage view
      window.location.href = '/';
    } else {
      // Enter preview mode
      window.location.href = '/?preview=true&editMode=true';
    }
  };

  // Default content if no homepage exists
  const defaultContent = {
    content: [
      {
        props: {
          id: "hero-section",
          title: organizationName || "Welcome to Our Church",
          subtitle: "Join us as we grow in faith and community together",
          primaryButtonText: "Plan Your Visit",
          primaryButtonLink: "#contact",
          backgroundImage: null
        },
        type: "HeroSection"
      }
    ],
    root: {
      props: {},
      title: organizationName || "Church Homepage"
    }
  };

  // If we have Puck content and organization ID, render with layout
  if (homepageData && organizationId) {
    return (
      <div className="min-h-screen">
        {/* Admin Overlay for Authenticated Users */}
        {showAdminOverlay && (
          <div className="fixed top-0 left-0 right-0 bg-slate-900 text-white px-4 py-2 shadow-lg z-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isPreviewMode ? (
                <>
                  <Eye className="h-4 w-4" />
                  <span className="text-sm font-medium">Homepage Preview</span>
                  <span className="text-xs bg-slate-700 px-2 py-1 rounded">
                    Live homepage preview
                  </span>
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4" />
                  <span className="text-sm font-medium">Admin View</span>
                  <span className="text-xs bg-slate-700 px-2 py-1 rounded">
                    You can edit the homepage
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm"
                variant="secondary"
                onClick={handleBackToDashboard}
                className="flex items-center gap-1 bg-slate-700 text-white hover:bg-slate-600 border-slate-600"
              >
                <ArrowLeft className="h-3 w-3" />
                Dashboard
              </Button>
              <Button 
                size="sm"
                variant="secondary"
                onClick={handleEditHomepage}
                className="flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
              >
                <Edit className="h-3 w-3" />
                Edit Homepage
              </Button>
              {isPreviewMode && (
                <Button 
                  size="sm"
                  variant="secondary"
                  onClick={togglePreviewMode}
                  className="flex items-center gap-1 bg-white text-slate-900 hover:bg-gray-100"
                >
                  <Eye className="h-3 w-3" />
                  Exit Preview
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Homepage Content */}
        <div className={showAdminOverlay ? "pt-12" : (adminBarOffset ? 'pt-12' : '')}>
          <SubdomainLayout organizationId={organizationId}>
            <PuckRenderer 
              data={homepageData.content || { content: [], root: {} }}
              className="min-h-screen"
            />
          </SubdomainLayout>
        </div>
      </div>
    );
  }

  // If we have organization ID but no homepage content, render with default content
  if (organizationId) {
    return (
      <div className={showAdminOverlay ? "pt-12" : (adminBarOffset ? 'pt-12' : '')}>
        <SubdomainLayout organizationId={organizationId}>
          <div className="py-20">
            <PuckRenderer data={defaultContent} />
            
            {/* Additional default sections */}
            <section className="py-16 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">About Our Church</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  We are a community of believers committed to following Jesus Christ and sharing His love with 
                  our neighbors. Our mission is to worship God, grow in faith, and serve others in the name of Christ.
                </p>
              </div>
            </section>
            
            <section className="py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Service Times</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-2">Sunday Worship</h3>
                    <p className="text-gray-600">9:00 AM & 11:00 AM</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-2">Wednesday Bible Study</h3>
                    <p className="text-gray-600">7:00 PM</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-2">Location</h3>
                    <p className="text-gray-600">123 Church Street</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </SubdomainLayout>
      </div>
    );
  }

  // Fallback for cases without organization ID
  return (
    <div className={adminBarOffset ? 'pt-12' : ''}>
      <PublicHomepage />
    </div>
  );
};

export default SubdomainPage;
