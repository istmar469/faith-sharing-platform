
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrganizationData } from '../types';
import { useToast } from '@/components/ui/use-toast';

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
  
  // Use direct RPC check for super admin status
  const checkSuperAdminStatus = useCallback(async (): Promise<boolean> => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        setError("Authentication error");
        return false;
      }
      
      if (!sessionData.session) {
        console.log("No active session found");
        setError(null);
        return false;
      }
      
      console.log("Checking super admin status for:", sessionData.session.user.email);
      
      // Use the direct super admin check RPC function
      const { data, error: checkError } = await supabase.rpc('direct_super_admin_check');
      
      if (checkError) {
        console.error("Super admin check error:", checkError);
        toast({
          title: "Error checking permissions",
          description: "There was a problem checking your admin status.",
          variant: "destructive"
        });
        return false;
      }
      
      console.log("Super admin direct check result:", data);
      return !!data;
    } catch (error) {
      console.error("Auth check error:", error);
      setError("An unexpected error occurred");
      return false;
    }
  }, [toast]);
  
  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get organizations data
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
    const initializeSuperAdminData = async () => {
      console.log("Initializing super admin data...");
      const isSuperAdmin = await checkSuperAdminStatus();
      console.log("Setting isAllowed to:", isSuperAdmin);
      setIsAllowed(isSuperAdmin);
      setStatusChecked(true);
      
      if (isSuperAdmin) {
        await fetchOrganizations();
      }
    };
    
    initializeSuperAdminData();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth state changed: ${event}`);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log("User signed in or token refreshed, checking super admin status");
          const isSuperAdmin = await checkSuperAdminStatus();
          setIsAllowed(isSuperAdmin);
          setStatusChecked(true);
          
          if (isSuperAdmin) {
            fetchOrganizations();
          }
        } else if (event === 'SIGNED_OUT') {
          setIsAllowed(false);
          setOrganizations([]);
          setStatusChecked(true);
        }
      }
    );
    
    return () => {
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
