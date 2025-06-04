import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, ChevronRight, Crown, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Organization {
  id: string;
  name: string;
  subdomain: string;
  role: string;
}

const DashboardSelector: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserOrganizations();
  }, []);

  const loadUserOrganizations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if super admin
      const { data: superAdmin } = await supabase.rpc('direct_super_admin_check');
      setIsSuperAdmin(superAdmin === true);

      // Get organization memberships
      const { data: memberships, error } = await supabase
        .from('organization_members')
        .select(`
          role,
          organization:organizations(
            id,
            name, 
            subdomain
          )
        `)
        .eq('user_id', user.id)
        .in('role', ['admin', 'editor']);

      if (error) throw error;

      const orgs = memberships
        ?.filter(m => m.organization)
        .map(m => ({
          id: m.organization.id,
          name: m.organization.name,
          subdomain: m.organization.subdomain,
          role: m.role
        })) || [];

      setOrganizations(orgs);
    } catch (error) {
      console.error('Error loading organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuperAdminDashboard = () => {
    window.location.href = '/dashboard';
  };

  const handleOrganizationDashboard = (org: Organization) => {
    // If organization has a subdomain, redirect to subdomain dashboard
    if (org.subdomain) {
      window.location.href = `https://${org.subdomain}.church-os.com/dashboard`;
    } else {
      // Fallback to main domain dashboard with org context
      window.location.href = `/dashboard?org=${org.id}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Select Dashboard
          </h1>
          <p className="text-gray-600">
            Choose which dashboard you'd like to access
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Super Admin Dashboard */}
          {isSuperAdmin && (
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-blue-900">Super Admin Dashboard</CardTitle>
                    <CardDescription className="text-blue-700">
                      Manage all organizations and system settings
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleSuperAdminDashboard}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Access Super Admin
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Organization Dashboards */}
          {organizations.map((org) => (
            <Card key={org.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-gray-900">{org.name}</CardTitle>
                    <CardDescription>
                      {org.role === 'admin' ? 'Administrator' : 'Editor'} Access
                      {org.subdomain && (
                        <span className="block text-xs text-gray-500 mt-1">
                          {org.subdomain}.church-os.com
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleOrganizationDashboard(org)}
                  variant="outline"
                  className="w-full"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage {org.name}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No access message */}
        {!isSuperAdmin && organizations.length === 0 && (
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-gray-900">No Dashboard Access</CardTitle>
              <CardDescription>
                You don't have administrative access to any organizations yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = 'https://church-os.com'}
              >
                Return to Main Site
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Back button */}
        <div className="text-center mt-8">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
          >
            ← Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSelector; 