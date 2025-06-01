import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Settings, Plus, LogOut, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from '@/components/auth/AuthContext';
import { Organization } from './hooks/useTenantDashboard';
import SubscriptionFlow from '../landing/SubscriptionFlow';

interface OrganizationSelectionProps {
  userOrganizations: Organization[];
  isSuperAdmin: boolean;
}

const OrganizationSelection: React.FC<OrganizationSelectionProps> = ({
  userOrganizations,
  isSuperAdmin
}) => {
  const navigate = useNavigate();
  const { signOut, user } = useAuthContext();
  const [showSubscriptionFlow, setShowSubscriptionFlow] = useState(false);

  const handleOrganizationSelect = (org: Organization) => {
    console.log("Navigating to organization dashboard:", org.id);
    navigate(`/dashboard/${org.id}`);
  };

  const handleSuperAdminPanel = () => {
    console.log("Navigating to super admin panel");
    navigate('/dashboard?admin=true');
  };

  const handleLogout = async () => {
    console.log("Logging out current user");
    await signOut();
    navigate('/', { replace: true });
  };

  const handleCreateOrganization = () => {
    console.log("Opening subscription flow for new organization");
    setShowSubscriptionFlow(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* User Info Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Church-OS
            </h1>
            <p className="text-lg text-gray-600">
              Choose an organization to manage
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <User className="h-4 w-4 mr-1" />
                <span>{user?.email}</span>
              </div>
              {isSuperAdmin && (
                <Badge variant="destructive" className="text-xs">
                  Super Admin
                </Badge>
              )}
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-gray-600 hover:text-red-600"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>

        {/* Super Admin Panel Button */}
        {isSuperAdmin && (
          <div className="mb-8 text-center">
            <Button 
              onClick={handleSuperAdminPanel}
              variant="outline"
              size="lg"
              className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300"
            >
              <Settings className="mr-2 h-5 w-5" />
              Super Admin Panel
            </Button>
          </div>
        )}

        {/* Organizations Grid */}
        {userOrganizations.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userOrganizations.map((org) => (
              <Card 
                key={org.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                onClick={() => handleOrganizationSelect(org)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Building2 className="h-8 w-8 text-blue-600" />
                    <Badge variant="secondary" className="text-xs">
                      {org.role}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{org.name}</CardTitle>
                  {org.subdomain && (
                    <CardDescription>
                      {org.subdomain}.church-os.com
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Users className="h-4 w-4 mr-1" />
                    <span>Organization Dashboard</span>
                  </div>
                  <Button className="w-full" variant="outline">
                    Manage Organization
                  </Button>
                </CardContent>
              </Card>
            ))}
            
            {/* Add Organization Card */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-dashed border-2 border-gray-300 hover:border-blue-400"
              onClick={handleCreateOrganization}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-center">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <CardTitle className="text-xl text-center text-gray-600">Add Organization</CardTitle>
                <CardDescription className="text-center">
                  Create a new organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="default">
                  <Plus className="mr-2 h-4 w-4" />
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Let's Create Your First Organization
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get started by creating your church or organization. Choose a plan and set up your website in minutes.
            </p>
            <Button onClick={handleCreateOrganization} size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-5 w-5" />
              Create Your Organization
            </Button>
          </div>
        )}
      </div>

      {/* Subscription Flow Modal */}
      <SubscriptionFlow
        isOpen={showSubscriptionFlow}
        onClose={() => setShowSubscriptionFlow(false)}
      />
    </div>
  );
};

export default OrganizationSelection;
