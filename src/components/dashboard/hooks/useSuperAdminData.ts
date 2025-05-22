
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
      
      // Use direct_super_admin_check function which is faster
      const { data, error } = await supabase
        .rpc('direct_super_admin_check');
      
      if (error) {
        console.error("Direct super admin check error:", error);
        return false;
      }
      
      console.log("Super admin check result:", data);
      return !!data;
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
        // First try the check_super_admin RPC function 
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('check_super_admin');
          
        if (!isMounted) return;
        
        if (rpcError) {
          console.error("RPC super admin check failed:", rpcError);
          
          // Try direct_super_admin_check as fallback with timeout
          try {
            // Create a timeout promise
            const timeoutPromise = new Promise<boolean>((_, reject) => {
              setTimeout(() => reject(new Error("Super admin check timed out")), 2000);
            });

            // Race the check against the timeout
            const isSuperAdmin = await Promise.race([
              checkSuperAdminStatus(),
              timeoutPromise
            ]).catch(error => {
              console.error("Super admin check timed out:", error);
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
              setStatusChecked(true);  // Mark as checked even on failure
              setIsAllowed(false);     // Default to not allowed on error
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
