
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface OrganizationSwitcherProps {
  currentOrganizationId?: string;
  currentOrganizationName?: string;
}

interface Organization {
  id: string;
  name: string;
}

const OrganizationSwitcher: React.FC<OrganizationSwitcherProps> = ({
  currentOrganizationId,
  currentOrganizationName
}) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    fetchUserOrganizations();
  }, []);
  
  const fetchUserOrganizations = async () => {
    setIsLoading(true);
    
    try {
      // Get current user session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        console.error("Error getting user session:", sessionError);
        return;
      }
      
      // Check if user is super admin first
      const { data: superAdminData } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', sessionData.session.user.id)
        .eq('role', 'super_admin')
        .maybeSingle();
      
      const isSuperAdmin = !!superAdminData;
      let orgsData;
      
      if (isSuperAdmin) {
        // Super admin can see all organizations
        const { data, error } = await supabase
          .from('organizations')
          .select('id, name')
          .order('name');
          
        if (error) throw error;
        orgsData = data;
      } else {
        // Regular users only see organizations they belong to
        const { data, error } = await supabase
          .from('organizations')
          .select(`
            id,
            name,
            organization_members!inner(role)
          `)
          .eq('organization_members.user_id', sessionData.session.user.id)
          .order('name');
          
        if (error) throw error;
        orgsData = data.map(org => ({
          id: org.id,
          name: org.name
        }));
      }
      
      setOrganizations(orgsData);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      toast({
        title: "Error",
        description: "Failed to load your organizations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOrganizationChange = (orgId: string) => {
    if (orgId === currentOrganizationId) return;
    navigate(`/tenant-dashboard/${orgId}`);
  };
  
  // If only one organization or none, don't show the switcher
  if (organizations.length <= 1 && !isLoading) {
    return (
      <div className="text-sm font-medium">
        {currentOrganizationName || "Organization"}
      </div>
    );
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex gap-2 items-center">
          {isLoading ? (
            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <>
              <span>{currentOrganizationName || "Select Organization"}</span>
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            className="flex items-center justify-between"
            onClick={() => handleOrganizationChange(org.id)}
          >
            <span>{org.name}</span>
            {org.id === currentOrganizationId && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OrganizationSwitcher;
