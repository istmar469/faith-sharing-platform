
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Check, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (isOpen) {
      fetchUserOrganizations();
    }
  }, [isOpen]);
  
  // Pre-fetch organizations on component mount
  useEffect(() => {
    fetchUserOrganizations();
  }, []);
  
  const fetchUserOrganizations = async () => {
    setIsLoading(true);
    
    try {
      console.log("Fetching organizations for switcher");
      
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
        console.log("Super admin organizations:", orgsData.length);
      } else {
        // Regular users only see organizations they belong to
        const { data, error } = await supabase
          .from('organization_members')
          .select(`
            organization_id,
            organizations (
              id,
              name
            )
          `)
          .eq('user_id', sessionData.session.user.id);
          
        if (error) throw error;
        
        orgsData = data.map(item => ({
          id: item.organizations?.id || item.organization_id,
          name: item.organizations?.name || 'Unknown Organization'
        }));
        console.log("User organizations:", orgsData.length);
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
    
    // Show toast notification
    toast({
      title: "Switching organization",
      description: "Please wait while we redirect you..."
    });
    
    // Navigate to the tenant dashboard for the selected organization
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
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex gap-2 items-center">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <span>{currentOrganizationName || "Select Organization"}</span>
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 max-h-[300px] overflow-auto">
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            className="flex items-center justify-between"
            onClick={() => handleOrganizationChange(org.id)}
          >
            <span className="truncate">{org.name}</span>
            {org.id === currentOrganizationId && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
        {organizations.length === 0 && !isLoading && (
          <div className="px-2 py-4 text-center text-sm text-gray-500">
            No organizations available
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OrganizationSwitcher;
