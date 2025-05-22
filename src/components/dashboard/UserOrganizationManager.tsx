
import React, { useState } from 'react';
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

  React.useEffect(() => {
    if (isSuperAdmin) {
      fetchAllOrganizations();
    } else if (currentOrganization) {
      // For regular admins, just use the current organization
      setOrganizations([currentOrganization]);
    }
  }, [isSuperAdmin, currentOrganization]);

  const fetchAllOrganizations = async () => {
    setLoading(true);
    try {
      // For super admins, fetch all organizations
      const { data: orgsData, error } = await supabase
        .rpc('super_admin_view_all_organizations');
      
      if (error) {
        console.error('Error fetching organizations:', error);
        toast({
          title: "Error",
          description: "Failed to load organizations. Please try again.",
          variant: "destructive",
        });
      } else {
        // Convert to Organization type by adding role field
        const orgsWithRole = orgsData.map(org => ({
          ...org,
          role: 'super_admin' // Add role property for the Organization type
        }));
        setOrganizations(orgsWithRole);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
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
            <p>No organization available for user assignments</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserOrganizationManager;
