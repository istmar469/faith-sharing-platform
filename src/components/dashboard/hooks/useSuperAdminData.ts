
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
  
  // Function to check if user is super admin - using direct query approach
  const checkSuperAdminStatus = useCallback(async (): Promise<boolean> => {
    try {
      console.log("Checking super admin status - direct method");
      // First check if user is authenticated
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError || !userData.user) {
        console.log("User not authenticated");
        return false;
      }
      
      // Use a more direct approach with simplified query
      const { data, error } = await supabase
        .rpc('direct_super_admin_check');
      
      if (error) {
        console.error("Super admin check error:", error);
        return false;
      }
      
      const isSuperAdmin = !!data;
      console.log("Super admin check complete. Direct result:", isSuperAdmin);
      return isSuperAdmin;
    } catch (err) {
      console.error("Auth check error:", err);
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
      try {
        // First try the RPC function approach
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('check_super_admin');
          
        if (!isMounted) return;
        
        if (rpcError) {
          console.error("RPC super admin check failed:", rpcError);
          // Fall back to the regular approach with a shorter timeout
          try {
            const timeoutPromise = new Promise<boolean>((_, reject) => {
              setTimeout(() => reject(new Error("Super admin check timed out")), 2000);
            });

            const isSuperAdmin = await Promise.race([
              checkSuperAdminStatus(),
              timeoutPromise
            ]).catch(error => {
              console.error("Super admin fallback check failed:", error);
              return false;
            });
            
            if (!isMounted) return;
            
            console.log("Super admin check result (fallback):", isSuperAdmin);
            setIsAllowed(isSuperAdmin);
            setStatusChecked(true);
            
            if (isSuperAdmin) {
              fetchOrganizations();
            }
          } catch (fallbackError) {
            console.error("Error in fallback super admin check:", fallbackError);
            if (isMounted) {
              setError("Authentication check failed after multiple attempts");
              setStatusChecked(true);
            }
          }
        } else {
          // RPC method succeeded
          const isSuperAdmin = rpcData && rpcData.length > 0 ? rpcData[0].is_super_admin : false;
          console.log("Super admin check result (RPC):", isSuperAdmin);
          
          if (isMounted) {
            setIsAllowed(isSuperAdmin);
            setStatusChecked(true);
            
            if (isSuperAdmin) {
              fetchOrganizations();
            }
          }
        }
      } catch (error) {
        console.error("Error initializing super admin data:", error);
        if (isMounted) {
          setError("Failed to check admin status");
          setStatusChecked(true);  // Mark as checked even on failure
        }
      }
    };
    
    initializeSuperAdminData();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth state changed: ${event}`);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log("User signed in or token refreshed, checking super admin status");
          try {
            const { data: rpcData, error: rpcError } = await supabase
              .rpc('check_super_admin');
              
            if (!isMounted) return;
            
            if (rpcError) {
              console.error("RPC super admin check failed after auth change:", rpcError);
              const isSuperAdmin = await checkSuperAdminStatus();
              
              if (!isMounted) return;
              
              setIsAllowed(isSuperAdmin);
              setStatusChecked(true);
              
              if (isSuperAdmin) {
                fetchOrganizations();
              }
            } else {
              // RPC method succeeded
              const isSuperAdmin = rpcData && rpcData.length > 0 ? rpcData[0].is_super_admin : false;
              
              if (!isMounted) return;
              
              setIsAllowed(isSuperAdmin);
              setStatusChecked(true);
              
              if (isSuperAdmin) {
                fetchOrganizations();
              }
            }
          } catch (error) {
            console.error("Error during auth change handler:", error);
            setStatusChecked(true);  // Mark as checked even on failure
          }
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
