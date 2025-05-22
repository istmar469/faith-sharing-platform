
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrganizationData } from '../types';

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
  
  const checkAuth = async (): Promise<boolean> => {
    try {
      // Check if the user is authenticated
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
      
      // Check if the user is a super admin
      const { data: superAdminData, error: superAdminError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', sessionData.session.user.id)
        .eq('role', 'super_admin')
        .maybeSingle();
      
      // Log the super admin check response
      console.info("Super admin status response:", superAdminData ? { is_super_admin: true } : { is_super_admin: false });
      
      if (superAdminError) {
        console.error("Super admin check error:", superAdminError);
        setError("Failed to check super admin status");
        return false;
      }
      
      const isSuperAdmin = !!superAdminData;
      console.info(isSuperAdmin ? "User is super admin" : "User is not super admin");
      
      return isSuperAdmin;
    } catch (error) {
      console.error("Auth check error:", error);
      setError("An unexpected error occurred");
      return false;
    }
  };
  
  const fetchOrganizations = async () => {
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
  };
  
  useEffect(() => {
    const initializeSuperAdminData = async () => {
      console.log("Initializing super admin data...");
      const isSuperAdmin = await checkAuth();
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
  }, []);
  
  return {
    organizations,
    loading,
    error,
    isAllowed,
    statusChecked,
    fetchOrganizations
  };
};
