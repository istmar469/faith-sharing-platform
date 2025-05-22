
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
  
  const checkSuperAdminStatus = useCallback(async (): Promise<boolean> => {
    try {
      // Check if the user is authenticated first
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        setError("Authentication error");
        return false;
      }
      
      if (!sessionData.session) {
        console.info("Session not found, user is not authenticated");
        setError(null);
        return false;
      }
      
      console.info("Session found, checking super admin status for user:", sessionData.session.user.email);
      
      // Use a direct query to check super admin status
      const { data, error: checkError } = await supabase.rpc('direct_super_admin_check');
      
      if (checkError) {
        console.error("Super admin check error:", checkError);
        toast({
          title: "Error checking permissions",
          description: "There was a problem checking your admin status. Please try again.",
          variant: "destructive"
        });
        return false;
      }
      
      console.log("Super admin status response:", data);
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
      } else {
        console.log("User is not a super admin, skipping organization fetch");
      }
    };
    
    initializeSuperAdminData();
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(`Auth state changed in useSuperAdminData: ${event}`);
        
        if (event === 'SIGNED_IN') {
          // On sign in, check super admin status and fetch orgs if needed
          setTimeout(async () => {
            const isSuperAdmin = await checkSuperAdminStatus();
            setIsAllowed(isSuperAdmin);
            setStatusChecked(true);
            
            if (isSuperAdmin) {
              fetchOrganizations();
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          // Reset state on sign out
          setIsAllowed(false);
          setOrganizations([]);
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
