
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { checkSuperAdmin } from '@/utils/checkSuperAdmin';
import { supabase } from '@/integrations/supabase/client';
import FullSiteBuilder from '@/components/sitebuilder/FullSiteBuilder';
import { ArrowLeft, AlertCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Organization {
  id: string;
  name: string;
  subdomain: string | null;
}

const SiteBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSubdomainAccess, organizationId, isContextReady } = useTenantContext();
  const { isAuthenticated, isCheckingAuth } = useAuthStatus();
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [isCheckingSuperAdmin, setIsCheckingSuperAdmin] = useState<boolean>(false);
  const [availableOrganizations, setAvailableOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [isLoadingOrgs, setIsLoadingOrgs] = useState<boolean>(false);

  const handleBackToHome = () => {
    navigate('/');
  };

  // Check super admin status and load organizations for root domain access
  useEffect(() => {
    const checkAdminAndLoadOrgs = async () => {
      if (!isAuthenticated || isSubdomainAccess) return;

      console.log('SiteBuilder: Checking super admin status for root domain access');
      setIsCheckingSuperAdmin(true);

      try {
        const adminStatus = await checkSuperAdmin();
        console.log('SiteBuilder: Super admin status:', adminStatus);
        setIsSuperAdmin(adminStatus);

        if (adminStatus) {
          setIsLoadingOrgs(true);
          // Load all organizations for super admin
          const { data: orgs, error } = await supabase
            .from('organizations')
            .select('id, name, subdomain')
            .order('name');

          if (error) {
            console.error('Error loading organizations:', error);
          } else if (orgs) {
            console.log('SiteBuilder: Loaded organizations:', orgs.length);
            setAvailableOrganizations(orgs);
            // Auto-select first organization if available
            if (orgs.length > 0) {
              setSelectedOrgId(orgs[0].id);
            }
          }
          setIsLoadingOrgs(false);
        }
      } catch (error) {
        console.error('Error checking super admin status:', error);
      } finally {
        setIsCheckingSuperAdmin(false);
      }
    };

    if (isContextReady && !isCheckingAuth) {
      checkAdminAndLoadOrgs();
    }
  }, [isAuthenticated, isSubdomainAccess, isContextReady, isCheckingAuth]);

  // Show loading while checking authentication and context
  if (!isContextReady || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <CardTitle className="text-xl font-semibold">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              You need to be signed in to access the site builder.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={handleBackToHome} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // For subdomain access - require organization context
  if (isSubdomainAccess && !organizationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <CardTitle className="text-xl font-semibold">Organization Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Unable to determine your organization context. Please try again.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={handleBackToHome} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // For root domain access - check super admin status
  if (!isSubdomainAccess) {
    if (isCheckingSuperAdmin) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking permissions...</p>
          </div>
        </div>
      );
    }

    if (!isSuperAdmin) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <CardTitle className="text-xl font-semibold">Access Restricted</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                The site builder requires super admin privileges when accessed from the main domain.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={handleBackToHome} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Show organization selection for super admin on root domain
    if (availableOrganizations.length > 0 && !selectedOrgId) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <CardTitle className="text-xl font-semibold">Select Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-center">
                Choose an organization to edit its site:
              </p>
              <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an organization" />
                </SelectTrigger>
                <SelectContent>
                  {availableOrganizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name} {org.subdomain && `(${org.subdomain})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={handleBackToHome} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (isLoadingOrgs) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading organizations...</p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 p-2 px-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBackToHome}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">Site Builder</h1>
            {!isSubdomainAccess && selectedOrgId && (
              <div className="text-sm text-gray-600">
                Editing: {availableOrganizations.find(org => org.id === selectedOrgId)?.name}
              </div>
            )}
          </div>
          <div></div>
        </div>
      </div>
      
      {/* Full Site Builder */}
      <div className="flex-1">
        <FullSiteBuilder organizationId={isSubdomainAccess ? organizationId : selectedOrgId} />
      </div>
    </div>
  );
};

export default SiteBuilderPage;
