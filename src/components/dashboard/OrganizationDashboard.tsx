import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import DashboardSidebar from './DashboardSidebar';
import OrganizationHeader from './OrganizationHeader';
import OrganizationLoading from './OrganizationLoading';
import OrganizationError from './OrganizationError';
import LoginDialog from '../auth/LoginDialog';
import OrganizationTabContent from './OrganizationTabContent';
import { useAuthCheck } from './hooks/useAuthCheck';
import { OrganizationData } from './types';
import { useTenantContext } from '@/components/context/TenantContext';
import { isMainDomain } from '@/utils/domain';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const OrganizationDashboard = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSubdomainAccess, organizationId: contextOrgId } = useTenantContext();
  const [activeTab, setActiveTab] = useState("overview");
  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const {
    loginDialogOpen,
    setLoginDialogOpen,
    isCheckingAuth
  } = useAuthCheck();

  // Get the organization ID from URL params or context
  const currentOrgId = organizationId || contextOrgId;

  useEffect(() => {
    // Check if we're on root domain without org ID - redirect to dashboard selection
    const hostname = window.location.hostname;
    const isRootDomain = isMainDomain(hostname);
    
    if (isRootDomain && !currentOrgId) {
      console.log("OrganizationDashboard: Root domain without org ID, redirecting to smart router");
      navigate('/dashboard', { replace: true });
      return;
    }

    const fetchOrganization = async () => {
      if (!currentOrgId) {
        setError("No organization ID provided");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching organization:", currentOrgId);
        
        // First check if user is authenticated
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          setLoginDialogOpen(true);
          setIsLoading(false);
          return;
        }

        // Check if user is super admin
        const { data: isSuperAdmin } = await supabase.rpc('direct_super_admin_check');
        
        // Fetch organization details
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', currentOrgId)
          .single();

        if (orgError) {
          console.error("Error fetching organization:", orgError);
          setError("Failed to load organization");
          setIsLoading(false);
          return;
        }

        if (!orgData) {
          setError("Organization not found");
          setIsLoading(false);
          return;
        }

        // Check if user has access to this organization
        if (!isSuperAdmin) {
          const { data: memberData } = await supabase
            .from('organization_members')
            .select('role')
            .eq('organization_id', currentOrgId)
            .eq('user_id', userData.user.id)
            .single();

          if (!memberData) {
            setError("You don't have access to this organization");
            setIsLoading(false);
            return;
          }

          setOrganization({
            ...orgData,
            subdomain: orgData.subdomain || '',
            role: memberData.role
          });
        } else {
          setOrganization({
            ...orgData,
            subdomain: orgData.subdomain || '',
            role: 'super_admin'
          });
        }

      } catch (error) {
        console.error("Error in fetchOrganization:", error);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganization();
  }, [currentOrgId, navigate]);
  
  const handleWebsiteToggle = async () => {
    if (!organization) return;
    
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ website_enabled: !organization.website_enabled })
        .eq('id', organization.id);
      
      if (error) {
        toast({
          title: "Error",
          description: `Failed to update website status: ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      setOrganization({
        ...organization,
        website_enabled: !organization.website_enabled
      });
      
      toast({
        title: "Success",
        description: `Website is now ${!organization.website_enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };
  
  const showComingSoonToast = () => {
    toast({
      title: "Coming Soon",
      description: "This feature is under development",
    });
  };
  
  if (isLoading || isCheckingAuth) {
    return <OrganizationLoading />;
  }
  
  if (loginDialogOpen) {
    return (
      <>
        <div className="flex h-screen items-center justify-center bg-white">
          <div className="text-center max-w-md p-6">
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="mb-4 text-gray-600">Please log in to view this organization.</p>
          </div>
        </div>
        <LoginDialog 
          isOpen={loginDialogOpen} 
          setIsOpen={(open) => {
            setLoginDialogOpen(open);
            if (!open) {
              window.location.reload();
            }
          }} 
        />
      </>
    );
  }
  
  if (error || !organization) {
    return (
      <OrganizationError 
        error={error} 
        onRetry={() => window.location.reload()}
        availableOrgs={[]}
      />
    );
  }
  
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-white w-full">
        <DashboardSidebar 
          isSuperAdmin={organization.role === 'super_admin'} 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <SidebarInset className="flex-1 overflow-auto">
          <div className="flex items-center gap-3 p-4 border-b">
            <SidebarTrigger className="lg:hidden" />
            <div className="flex-1">
              <OrganizationHeader 
                organization={organization}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleWebsiteToggle={handleWebsiteToggle}
                showComingSoonToast={showComingSoonToast}
              />
            </div>
          </div>
          
          <main className="p-6">
            <OrganizationTabContent
              activeTab={activeTab}
              organizationId={organization.id}
            />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default OrganizationDashboard;
