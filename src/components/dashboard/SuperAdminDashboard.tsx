
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SideNav from './SideNav';
import OrganizationsTable from './OrganizationsTable';
import { Loader2 } from 'lucide-react';
import { useSuperAdminData } from './hooks/useSuperAdminData';
import AccessDenied from './AccessDenied';
import LoadingState from './LoadingState';
import OrganizationsSearch from './OrganizationsSearch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

/**
 * Dashboard component for super admins
 */
const SuperAdminDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [isUserChecked, setIsUserChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  
  // Use the custom hook for super admin data
  const { 
    organizations, 
    loading, 
    error, 
    isAllowed, 
    statusChecked,
    fetchOrganizations
  } = useSuperAdminData();

  // Independent auth check separate from the hook
  const checkAuthStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(!!data.user);
        console.log("Auth check result:", !!data.user, data.user?.email);
      }
      
      setIsUserChecked(true);
    } catch (err) {
      console.error("Unexpected error during auth check:", err);
      setIsAuthenticated(false);
      setIsUserChecked(true);
      toast({
        title: "Authentication Error",
        description: "There was a problem checking your authentication status.",
        variant: "destructive"
      });
    }
  }, [toast]);
  
  useEffect(() => {
    // Check authentication status when component mounts
    checkAuthStatus();
    
    // Set up authentication state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed in SuperAdminDashboard:", event, session?.user?.email);
      setIsAuthenticated(!!session);
      
      if (event === 'SIGNED_IN') {
        console.log("User signed in, refreshing super admin data");
        fetchOrganizations();
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [toast, fetchOrganizations, checkAuthStatus]);
  
  // Direct auth check to verify super admin status
  const verifySuperAdminStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('direct_super_admin_check');
      if (error) {
        console.error("Direct super admin check error:", error);
        return false;
      }
      console.log("Direct super admin check result:", data);
      return !!data;
    } catch (err) {
      console.error("Unexpected error during super admin check:", err);
      return false;
    }
  }, []);
  
  useEffect(() => {
    // If we're authenticated but not allowed, double-check the super admin status
    if (isAuthenticated && statusChecked && !isAllowed) {
      verifySuperAdminStatus().then(isSuperAdmin => {
        if (isSuperAdmin) {
          console.log("Direct super admin check succeeded when hook check failed, refreshing page");
          // If direct check shows we're a super admin but the hook doesn't, refresh the page
          window.location.reload();
        }
      });
    }
  }, [isAuthenticated, statusChecked, isAllowed, verifySuperAdminStatus]);
  
  // Handle search
  const filteredOrganizations = organizations.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOrgClick = (orgId: string) => {
    navigate(`/tenant-dashboard/${orgId}`);
  };

  // Show loading screen until status check is complete
  if (!statusChecked || !isUserChecked) {
    return <LoadingState message="Checking authentication status..." />;
  }
  
  // If not authenticated at all, show access denied
  if (!isAuthenticated) {
    return (
      <AccessDenied 
        message="You need to be logged in to access this page"
        isAuthError={true}
      />
    );
  }
  
  // If authenticated but not a super admin, show access denied
  if (!isAllowed) {
    return (
      <AccessDenied 
        message="You need to be logged in as a super admin to access this page"
        isAuthError={false}
      />
    );
  }

  return (
    <div className="flex min-h-screen">
      <SideNav />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Super Admin Dashboard</h1>
        
        <OrganizationsSearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onRefresh={fetchOrganizations}
        />

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading organizations...</span>
          </div>
        ) : error ? (
          <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-800">
            {error}
          </div>
        ) : (
          <OrganizationsTable 
            organizations={filteredOrganizations}
            onOrgClick={handleOrgClick}
          />
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
