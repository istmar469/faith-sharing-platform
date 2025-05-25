
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Building2 } from 'lucide-react';
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
  
  const handleOrganizationSelect = (orgId: string) => {
    // Navigate to the main dashboard and let SmartDashboard handle the routing
    window.location.href = `/dashboard?org=${orgId}`;
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Select Organization</h1>
            <p className="text-sm text-muted-foreground">
              Choose an organization to manage.
            </p>
            
            {isSuperAdmin && (
              <div className="mt-2 flex items-center">
                <ShieldCheck className="h-4 w-4 text-indigo-600 mr-1" />
                <span className="text-sm font-medium text-indigo-600">
                  Super Admin Access
                </span>
              </div>
            )}
          </div>
        </header>
        
        <main className="p-6">
          {userOrganizations.length === 0 && !isSuperAdmin ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Organizations</h3>
              <p className="text-gray-600">You don't have access to any organizations yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userOrganizations.map((org) => (
                <Card key={org.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>{org.name}</CardTitle>
                    <CardDescription>
                      {org.subdomain ? `${org.subdomain}.church-os.com` : 'No domain set'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {org.role}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => handleOrganizationSelect(org.id)}
                    >
                      Manage <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          {isSuperAdmin && (
            <div className="mt-6">
              <Button 
                variant="default" 
                onClick={() => navigate('/dashboard?admin=true')}
                className="w-full md:w-auto"
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Access Super Admin Features
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                As a Super Admin, you have access to additional administrative features.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default OrganizationSelection;
