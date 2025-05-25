
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Settings, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Organization } from './hooks/useTenantDashboard';

interface OrganizationSelectionProps {
  userOrganizations: Organization[];
  isSuperAdmin: boolean;
}

const OrganizationSelection: React.FC<OrganizationSelectionProps> = ({
  userOrganizations,
  isSuperAdmin
}) => {
  const navigate = useNavigate();

  const handleOrganizationSelect = (org: Organization) => {
    console.log("Navigating to organization dashboard:", org.id);
    navigate(`/dashboard/${org.id}`);
  };

  const handleSuperAdminPanel = () => {
    console.log("Navigating to super admin panel");
    navigate('/dashboard?admin=true');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Church-OS
          </h1>
          <p className="text-lg text-gray-600">
            Choose an organization to manage
          </p>
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
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Organizations Found
            </h3>
            <p className="text-gray-600 mb-6">
              You don't belong to any organizations yet.
            </p>
            <Button onClick={() => navigate('/auth')} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Contact Support
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationSelection;
