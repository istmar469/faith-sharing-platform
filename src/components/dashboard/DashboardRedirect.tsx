
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import LoginDialog from '@/components/auth/LoginDialog';

const DashboardRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    handleRedirectLogic();
  }, []);

  const handleRedirectLogic = async () => {
    try {
      // Check authentication
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        console.log("User not authenticated, showing login dialog");
        setShowLoginDialog(true);
        setIsLoading(false);
        return;
      }

      console.log("User authenticated, determining redirect destination");

      // Check if user is super admin
      const { data: isSuperAdminData, error: superAdminError } = await supabase.rpc('direct_super_admin_check');
      
      if (superAdminError) {
        console.error("Error checking super admin status:", superAdminError);
      }

      const isSuperAdmin = !!isSuperAdminData;
      console.log("Super admin status:", isSuperAdmin);

      // Fetch user's organizations
      const { data: userOrgs, error: orgsError } = await supabase.rpc('rbac_fetch_user_organizations');
      
      if (orgsError) {
        console.error("Error fetching user organizations:", orgsError);
        toast({
          title: "Error",
          description: "Failed to load your organizations",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      console.log("User organizations:", userOrgs);

      // Determine redirect destination
      if (isSuperAdmin) {
        // Super admins can access the root dashboard or organization selection
        if (userOrgs && userOrgs.length > 0) {
          console.log("Super admin with orgs, redirecting to tenant dashboard selection");
          navigate('/tenant-dashboard', { replace: true });
        } else {
          console.log("Super admin with no orgs, staying on root dashboard");
          navigate('/', { replace: true });
        }
      } else if (userOrgs && userOrgs.length > 0) {
        // Regular users with organizations
        if (userOrgs.length === 1) {
          console.log("User with single org, redirecting to tenant dashboard");
          navigate(`/tenant-dashboard/${userOrgs[0].id}`, { replace: true });
        } else {
          console.log("User with multiple orgs, redirecting to selection");
          navigate('/tenant-dashboard', { replace: true });
        }
      } else {
        // User with no organizations
        console.log("User with no organizations");
        toast({
          title: "No Organizations",
          description: "You don't have access to any organizations",
          variant: "destructive"
        });
        // Stay on current page or redirect to a "no access" page
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error("Error in dashboard redirect logic:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center px-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (showLoginDialog) {
    return (
      <>
        <div className="flex items-center justify-center h-screen bg-white">
          <div className="text-center max-w-md p-6">
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="mb-4 text-gray-600">Please log in to access your dashboard.</p>
          </div>
        </div>
        <LoginDialog 
          isOpen={showLoginDialog} 
          setIsOpen={(open) => {
            setShowLoginDialog(open);
            if (!open) {
              // If dialog closes without auth, redirect to home
              navigate('/', { replace: true });
            }
          }} 
        />
      </>
    );
  }

  // This should not be reached due to redirects above
  return null;
};

export default DashboardRedirect;
