import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Zap, Shield, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OrganizationOnboarding from '@/components/onboarding/OrganizationOnboarding';
import { useAuthContext } from '@/components/auth/AuthContext';
import { getCurrentDomain } from '@/utils/domain';

const MainDomainContent: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const currentDomain = getCurrentDomain();

  if (showOnboarding) {
    return <OrganizationOnboarding />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">ChurchSite Builder</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700">Welcome, {user.email}</span>
                  <Button onClick={() => navigate('/dashboard')}>Dashboard</Button>
                </>
              ) : (
                <Button onClick={() => navigate('/login')}>Sign In</Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Build Your Church Website in Minutes
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create a beautiful, professional website for your church or organization with our easy-to-use platform. 
            Get your own subdomain and start building today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              onClick={() => setShowOnboarding(true)}
              className="text-lg px-8 py-3"
            >
              Create Your Organization
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/login')}
              className="text-lg px-8 py-3"
            >
              Sign In
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <Card>
              <CardHeader>
                <Zap className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <CardTitle>Quick Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get your church website up and running in minutes with our streamlined setup process.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Globe className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <CardTitle>Custom Subdomain</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get your own branded subdomain like yourchurch.{currentDomain} with full isolation and security.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <CardTitle>Secure & Isolated</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Your organization's data is completely isolated and secure from other organizations.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Environment Indicator for Testing */}
          <div className="mt-16 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Testing Environment</h3>
            <p className="text-blue-700 mb-4">
              You're currently on <strong>{currentDomain}</strong>. 
              Your organization subdomain will be: <strong>yourchurch.{currentDomain}</strong>
            </p>
            <div className="text-sm text-blue-600">
              Perfect for testing the multi-tenant subdomain system!
            </div>
          </div>

          {/* Testing Section */}
          <div className="mt-8 p-8 bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Test the Platform</h2>
            <p className="text-gray-600 mb-6">
              Want to see how the subdomain creation and isolation works? Create a test organization to explore the features.
            </p>
            <Button 
              variant="outline"
              onClick={() => setShowOnboarding(true)}
              className="mr-4"
            >
              Start Testing Flow
            </Button>
            <Button 
              variant="ghost"
              onClick={() => navigate('/diagnostic')}
            >
              View Diagnostics
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDomainContent;
