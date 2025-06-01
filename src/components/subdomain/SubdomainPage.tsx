import React from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, Settings } from 'lucide-react';
import { useTenantContext } from '@/components/context/TenantContext';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useNavigate } from 'react-router-dom';
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

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleDashboardClick = () => {
    navigate(`/dashboard/${organizationId}`);
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
      <div className={`min-h-screen ${adminBarOffset ? 'pt-12' : ''}`}>
        <SubdomainLayout organizationId={organizationId}>
          <PuckRenderer 
            data={homepageData.content || { content: [], root: {} }}
            className="min-h-screen"
          />
        </SubdomainLayout>
      </div>
    );
  }

  // If we have organization ID but no Puck content, still use layout with fallback
  if (organizationId) {
    return (
      <div className={`min-h-screen bg-white ${adminBarOffset ? 'pt-12' : ''}`}>
        {/* Simple Navigation Bar for Subdomains */}
        <nav className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  {organizationName || "Church Website"}
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <Button
                    onClick={handleDashboardClick}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Admin Dashboard
                  </Button>
                ) : (
                  <Button
                    onClick={handleLoginClick}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    Staff Login
                  </Button>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main>
          {homepageData ? (
            <PuckRenderer data={homepageData.content} />
          ) : (
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
          )}
        </main>
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
