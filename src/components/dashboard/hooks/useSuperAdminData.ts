
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
  
  // Function to check if user is super admin using the new RPC function
  const checkSuperAdminStatus = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('super_admin_status');
      
      if (error) {
        console.error("Super admin check error:", error);
        return false;
      }
      
      console.log("Super admin status check result:", data);
      
      // Properly handle the response as a typed object
      if (data && typeof data === 'object' && 'is_super_admin' in data) {
        return data.is_super_admin === true;
      }
      
      return false;
    } catch (err) {
      console.error("Auth check error:", err);
      return false;
    }
  }, []);
  
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
      console.log("Super admin check result:", isSuperAdmin);
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
          console.log("Super admin check after auth change:", isSuperAdmin);
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
