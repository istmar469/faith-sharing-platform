import React, { useState, useEffect } from 'react';
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
import { isDevelopmentEnvironment } from '@/utils/domain';
import { useTenantContext } from '@/components/context/TenantContext';
import { useSubdomainRouter } from '@/hooks/useSubdomainRouter';

interface OrganizationSwitcherProps {
  currentOrganizationId?: string;
  currentOrganizationName?: string;
}

interface Organization {
  id: string;
  name: string;
  subdomain?: string;
}

const OrganizationSwitcher: React.FC<OrganizationSwitcherProps> = ({
  currentOrganizationId,
  currentOrganizationName
}) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { isSubdomainAccess } = useTenantContext();
  const { redirectToSubdomain, navigateWithContext } = useSubdomainRouter();
  
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
      
      // Check if user is super admin first
      const { data: isSuperAdminData } = await supabase.rpc('direct_super_admin_check');
      
      const isSuperAdmin = !!isSuperAdminData;
      let orgsData;
      
      if (isSuperAdmin) {
        // Super admin can see all organizations
        const { data, error } = await supabase
          .from('organizations')
          .select('id, name, subdomain')
          .order('name');
          
        if (error) throw error;
        orgsData = data;
        console.log("Super admin organizations:", orgsData.length);
      } else {
        // Regular users only see organizations they belong to
        const { data, error } = await supabase.rpc('rbac_fetch_user_organizations');
          
        if (error) throw error;
        
        // Get subdomains for these organizations
        const orgIds = data?.map((org: any) => org.id) || [];
        if (orgIds.length > 0) {
          const { data: subdomainData } = await supabase
            .from('organizations')
            .select('id, subdomain')
            .in('id', orgIds);
            
          // Merge subdomain data with organization data
          orgsData = data?.map((org: any) => {
            const matchingOrg = subdomainData?.find((subOrg) => subOrg.id === org.id);
            return {
              ...org,
              subdomain: matchingOrg?.subdomain
            };
          }) || [];
        } else {
          orgsData = data || [];
        }
        
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
  
  const handleOrganizationChange = (org: Organization) => {
    if (org.id === currentOrganizationId) return;
    
    // Show toast notification
    toast({
      title: "Switching organization",
      description: "Please wait while we redirect you..."
    });
    
    // Always use the organization ID for navigation to ensure consistency
    // This prevents 404 errors when organization names change
    if (isSubdomainAccess && org.subdomain && !isDevelopmentEnvironment()) {
      // Redirect to the subdomain
      redirectToSubdomain(org.subdomain, '/');
    } else {
      // Navigate to the dashboard using organization ID (most reliable method)
      navigateWithContext(`/dashboard/${org.id}`);
    }
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
            onClick={() => handleOrganizationChange(org)}
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
