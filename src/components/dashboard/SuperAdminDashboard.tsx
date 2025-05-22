
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

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(!!data.session);
          console.log("Auth check result:", !!data.session, data.session?.user?.email);
        }
        
        setIsUserChecked(true);
      } catch (err) {
        console.error("Unexpected error during auth check:", err);
        setIsAuthenticated(false);
        setIsUserChecked(true);
      }
    };

    checkAuthStatus();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in SuperAdminDashboard:", event);
      setIsAuthenticated(!!session);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Handle search filtering
  const filteredOrganizations = organizations.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOrgClick = (orgId: string) => {
    navigate(`/tenant-dashboard/${orgId}`);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // Show loading screen until status check is complete
  if (!statusChecked || !isUserChecked) {
    return <LoadingState message="Checking authentication status..." onRetry={handleRetry} />;
  }
  
  // If not authenticated at all, show access denied with login form
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

  // Super admin dashboard view
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
