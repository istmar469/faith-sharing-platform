
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrganizationData } from '../types';
import { useToast } from '@/components/ui/use-toast';

interface SuperAdminStatusResponse {
  is_super_admin: boolean;
}

interface UseSuperAdminDataReturn {
  organizations: OrganizationData[];
  loading: boolean;
  error: string | null;
  isAllowed: boolean;
  statusChecked: boolean;
  fetchOrganizations: () => Promise<void>;
}

export const useSuperAdminData = (): UseSuperAdminDataReturn => {
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAllowed, setIsAllowed] = useState<boolean>(false);
  const [statusChecked, setStatusChecked] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Function to check if user is super admin using the database directly instead of RPC
  const checkSuperAdminStatus = useCallback(async (): Promise<boolean> => {
    try {
      // First check if user is authenticated
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError || !userData.user) {
        console.log("User not authenticated");
        return false;
      }
      
      // Then directly query the organization_members table with a timeout
      const timeoutPromise = new Promise<{data: null, error: Error}>((_, reject) =>
        setTimeout(() => reject(new Error('Super admin check timed out')), 8000) // Reduced timeout
      );
      
      const queryPromise = supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', userData.user.id)
        .eq('role', 'super_admin')
        .maybeSingle();
      
      // Race between actual request and timeout
      const { data, error } = await Promise.race([
        queryPromise,
        timeoutPromise
      ]) as {data: any, error: any};
      
      if (error) {
        console.error("Super admin check error:", error);
        return false;
      }
      
      console.log("Super admin direct query result:", data);
      
      // If we have data with role = super_admin, then user is super admin
      return !!data;
    } catch (err) {
      console.error("Auth check error:", err);
      toast({
        title: "Authentication Check Error",
        description: "Could not verify admin status. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);
  
  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Add a timeout to the fetch call to avoid hanging indefinitely
      const timeoutPromise = new Promise<{data: null, error: Error}>((_, reject) =>
        setTimeout(() => reject(new Error('Fetching organizations timed out')), 8000) // Reduced timeout
      );
      
      const fetchPromise = supabase
        .from('organizations')
        .select('*')
        .order('name');
      
      // Race between actual request and timeout
      const { data, error: fetchError } = await Promise.race([
        fetchPromise,
        timeoutPromise
      ]) as {data: any, error: any};
      
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
        const isSuperAdmin = await checkSuperAdminStatus();
        console.log("Super admin check result:", isSuperAdmin);
        
        if (!isMounted) return;
        
        setIsAllowed(isSuperAdmin);
        setStatusChecked(true);
        
        if (isSuperAdmin) {
          await fetchOrganizations();
        }
      } catch (error) {
        console.error("Error initializing super admin data:", error);
        if (isMounted) {
          setError("Failed to check admin status");
          setStatusChecked(true);
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
            const isSuperAdmin = await checkSuperAdminStatus();
            console.log("Super admin check after auth change:", isSuperAdmin);
            
            if (!isMounted) return;
            
            setIsAllowed(isSuperAdmin);
            setStatusChecked(true);
            
            if (isSuperAdmin) {
              fetchOrganizations();
            }
          } catch (error) {
            console.error("Error during auth change handler:", error);
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
