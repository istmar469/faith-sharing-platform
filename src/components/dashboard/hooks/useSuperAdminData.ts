
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrganizationData } from '../types';
import { useToast } from '@/components/ui/use-toast';

export const useSuperAdminData = () => {
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAllowed, setIsAllowed] = useState<boolean>(false);
  const [statusChecked, setStatusChecked] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Simplified direct super admin check with timeout
  const checkSuperAdminStatus = useCallback(async (): Promise<boolean> => {
    try {
      console.log("Checking super admin status - direct method");
      
      // Create a timeout promise
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error("Super admin check timed out")), 2000);
      });
      
      // Use direct_super_admin_check function which is faster
      const checkPromise = supabase.rpc('direct_super_admin_check');
      
      // Race the check against the timeout
      const { data, error } = await Promise.race([
        checkPromise,
        timeoutPromise.then(() => {
          throw new Error("Super admin check timed out");
        })
      ]);
      
      if (error) {
        console.error("Direct super admin check error:", error);
        return false;
      }
      
      console.log("Super admin check result:", data);
      return !!data;
    } catch (err) {
      console.error("Auth check error:", err);
      // Return false if there's any error
      return false;
    }
  }, []);
  
  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching organizations - start");
      const { data, error: fetchError } = await supabase
        .from('organizations')
        .select('*')
        .order('name');
      
      if (fetchError) {
        console.error("Error fetching organizations:", fetchError);
        setError("Failed to load organizations");
        setLoading(false);
        return;
      }
      
      console.log("Organizations fetched successfully:", data?.length || 0);
      setOrganizations(data || []);
    } catch (error) {
      console.error("Organizations fetch error:", error);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    let isMounted = true;
    
    const initializeSuperAdminData = async () => {
      console.log("Initializing super admin data...");
      
      // First, get user session - if no session, don't bother checking admin status
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        if (isMounted) {
          setStatusChecked(true);
          setIsAllowed(false);
        }
        return;
      }
      
      try {
        // Simplified admin check strategy - try the fastest way first
        const isSuperAdmin = await checkSuperAdminStatus();
          
        if (!isMounted) return;
        
        console.log("Super admin check result:", isSuperAdmin);
        setIsAllowed(isSuperAdmin);
        setStatusChecked(true);
        
        // If super admin, fetch organizations
        if (isSuperAdmin) {
          fetchOrganizations();
        } else {
          // Not a super admin, but authenticated - fetch their accessible organizations
          const { data: userOrgs } = await supabase.rpc('fetch_user_organizations');
          if (isMounted && userOrgs) {
            setOrganizations(userOrgs);
          }
        }
      } catch (error) {
        console.error("Error initializing super admin data:", error);
        if (isMounted) {
          setError("Failed to check admin status");
          setStatusChecked(true);  // Mark as checked even on failure
          setIsAllowed(false);     // Default to not allowed on error
        }
      }
    };
    
    // Execute the initialization
    initializeSuperAdminData();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event) => {
        console.log(`Auth state changed: ${event}`);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log("User signed in or token refreshed, checking super admin status");
          // Reset status and re-initialize on auth changes
          setStatusChecked(false);
          initializeSuperAdminData();
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setIsAllowed(false);
            setOrganizations([]);
            setStatusChecked(true);
          }
        }
      }
    );
    
    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [checkSuperAdminStatus, fetchOrganizations]);
  
  return {
    organizations,
    loading,
    error,
    isAllowed,
    statusChecked,
    fetchOrganizations
  };
};
