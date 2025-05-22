
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SideNav from './SideNav';
import OrganizationsTable from './OrganizationsTable';
import { Loader2, RefreshCw, LogOut } from 'lucide-react';
import { useSuperAdminData } from './hooks/useSuperAdminData';
import AccessDenied from './AccessDenied';
import LoadingState from './LoadingState';
import OrganizationsSearch from './OrganizationsSearch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';

/**
 * Dashboard component for super admins
 */
const SuperAdminDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [isUserChecked, setIsUserChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
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
      setIsCheckingAuth(true);
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
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in SuperAdminDashboard:", event);
      setIsAuthenticated(!!session);
      
      // Reset retry count on auth state change
      if (event === 'SIGNED_IN') {
        setRetryCount(0);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [retryCount]);

  // Handle search filtering
  const filteredOrganizations = organizations.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOrgClick = (orgId: string) => {
    navigate(`/tenant-dashboard/${orgId}`);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    toast({
      title: "Retrying",
      description: "Attempting to reconnect to server..."
    });
  };

  // Advanced retry for auth errors
  const handleAuthRetry = async () => {
    try {
      // Try to refresh the session
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Failed to refresh session:", error);
        // If refresh fails, navigate to auth page
        navigate('/auth');
        return;
      }
      
      // If refresh succeeds, retry
      handleRetry();
    } catch (err) {
      console.error("Session refresh error:", err);
      navigate('/auth');
    }
  };
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully."
      });
      navigate('/auth');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Show loading screen while authentication check is in progress
  if (isCheckingAuth || (!statusChecked || !isUserChecked)) {
    return (
      <LoadingState 
        message="Checking authentication status..." 
        onRetry={handleRetry}
        timeout={12000} // 12 seconds timeout
      />
    );
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
        <header className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </header>
        
        <OrganizationsSearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onRefresh={fetchOrganizations}
        />

        {loading ? (
          <Card className="my-6">
            <CardContent className="flex flex-col items-center justify-center h-32 p-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
              <span className="mb-4">Loading organizations...</span>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" /> Retry
              </Button>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="my-6 border-red-300">
            <CardHeader>
              <CardTitle className="text-red-700">Error Loading Data</CardTitle>
              <CardDescription className="text-red-600">{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end space-x-2">
                <Button onClick={handleRetry} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" /> Retry
                </Button>
                <Button onClick={handleAuthRetry} variant="outline" size="sm" className="ml-2">
                  Refresh Auth
                </Button>
              </div>
            </CardContent>
          </Card>
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
