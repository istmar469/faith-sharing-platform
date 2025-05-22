
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserOrgAssignment from "@/components/settings/UserOrgAssignment";
import { supabase } from "@/integrations/supabase/client";
import { Organization } from "./hooks/useTenantDashboard";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserOrganizationManagerProps {
  currentOrganization?: Organization | null;
  showComingSoonToast?: () => void;
  isSuperAdmin?: boolean;
}

const UserOrganizationManager: React.FC<UserOrganizationManagerProps> = ({ 
  currentOrganization,
  showComingSoonToast,
  isSuperAdmin
}) => {
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrganizations();
  }, [isSuperAdmin, currentOrganization]);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      let orgsData;
      
      if (isSuperAdmin) {
        // For super admins, fetch all organizations
        const { data, error } = await supabase
          .from('organizations')
          .select('*')
          .order('name');
        
        if (error) throw error;
        orgsData = data;
      } else if (currentOrganization) {
        // For regular admins, just use the current organization
        orgsData = [currentOrganization];
      } else {
        // If no current organization and not super admin, fetch user's organizations
        const { data, error } = await supabase
          .from('organization_members')
          .select('organization_id, role, organizations:organization_id(id, name, subdomain, custom_domain)')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
        
        if (error) throw error;
        
        orgsData = data.map((item: any) => ({
          id: item.organizations.id,
          name: item.organizations.name,
          subdomain: item.organizations.subdomain,
          custom_domain: item.organizations.custom_domain,
          role: item.role
        }));
      }
      
      // Convert to Organization type
      const orgsWithRole = orgsData.map((org: any) => ({
        id: org.id,
        name: org.name,
        subdomain: org.subdomain || null,
        description: org.description || null,
        website_enabled: org.website_enabled || false,
        slug: org.slug || '',
        custom_domain: org.custom_domain || null,
        role: org.role || 'viewer'
      }));
      
      setOrganizations(orgsWithRole);
    } catch (err) {
      console.error('Error fetching organizations:', err);
      toast({
        title: "Error",
        description: "Failed to load organizations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentComplete = () => {
    toast({
      title: "Success",
      description: "User role assignment completed successfully",
    });
    // Refresh organizations after assignment
    fetchOrganizations();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>User Organization Management</CardTitle>
        <CardDescription>
          Assign users to organizations and manage their roles
        </CardDescription>
      </CardHeader>
      <CardContent>
        {organizations.length > 0 ? (
          <UserOrgAssignment 
            organizations={organizations} 
            onAssignmentComplete={handleAssignmentComplete}
          />
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No organizations available for user assignments</p>
            <Button 
              variant="outline" 
              onClick={fetchOrganizations} 
              className="mt-4"
            >
              Refresh Organizations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserOrganizationManager;
