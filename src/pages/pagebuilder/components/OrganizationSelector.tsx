
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Building2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Organization {
  id: string;
  name: string;
  subdomain: string | null;
}

interface OrganizationSelectorProps {
  onBackToDashboard: () => void;
}

const OrganizationSelector: React.FC<OrganizationSelectorProps> = ({
  onBackToDashboard
}) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError('Please sign in to access the page builder');
          setLoading(false);
          return;
        }

        // Get user's organizations
        const { data: orgs, error: orgError } = await supabase
          .from('organization_members')
          .select(`
            organization_id,
            organizations!inner(
              id,
              name,
              subdomain
            )
          `)
          .eq('user_id', user.id);

        if (orgError) {
          console.error('Error loading organizations:', orgError);
          setError('Failed to load organizations');
          setLoading(false);
          return;
        }

        if (!orgs || orgs.length === 0) {
          setError('No organizations found. Please contact support.');
          setLoading(false);
          return;
        }

        const organizationList = orgs.map(item => ({
          id: item.organizations.id,
          name: item.organizations.name,
          subdomain: item.organizations.subdomain
        }));

        setOrganizations(organizationList);
        
        // Auto-select first organization if only one
        if (organizationList.length === 1) {
          setSelectedOrgId(organizationList[0].id);
        }
      } catch (err) {
        console.error('Error in loadOrganizations:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadOrganizations();
  }, []);

  const handleContinue = () => {
    if (selectedOrgId) {
      // Navigate to page builder with organization context
      navigate(`/page-builder?organization_id=${selectedOrgId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Building2 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <CardTitle className="text-xl font-semibold">Select Organization</CardTitle>
          <p className="text-gray-600 text-sm">
            Choose which organization's pages you want to edit
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={onBackToDashboard} variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          ) : (
            <>
              <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name} {org.subdomain && `(${org.subdomain})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleContinue}
                  disabled={!selectedOrgId}
                  className="w-full"
                >
                  Continue to Page Builder
                </Button>
                <Button onClick={onBackToDashboard} variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationSelector;
