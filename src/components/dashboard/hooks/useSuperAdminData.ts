
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrganizationData } from '../types';

export const useSuperAdminData = () => {
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAllowed, setIsAllowed] = useState<boolean>(false);
  const [statusChecked, setStatusChecked] = useState<boolean>(false);
  
  // Check if the user is a super admin or admin using the updated function
  const checkSuperAdminStatus = useCallback(async (): Promise<boolean> => {
    try {
      console.log("Checking admin status using direct_super_admin_check");
      
      const { data, error } = await supabase.rpc('direct_super_admin_check');
      
      if (error) {
        console.error("Admin check error:", error);
        return false;
      }
      
      console.log("Admin check result:", data);
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
      
      if (data) {
        const transformedData: OrganizationData[] = data.map(org => ({
          id: org.id,
          name: org.name,
          subdomain: org.subdomain || null,
          description: org.description || null,
          website_enabled: org.website_enabled || false,
          slug: org.slug || '',
          custom_domain: org.custom_domain || null,
          role: 'viewer' // Default role
        }));
        setOrganizations(transformedData);
      } else {
        setOrganizations([]);
      }
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
        // Check if the user is an admin using the simplified function
        const isAdmin = await checkSuperAdminStatus();
          
        if (!isMounted) return;
        
        setIsAllowed(isAdmin);
        setStatusChecked(true);
        
        // If admin, fetch organizations
        if (isAdmin) {
          fetchOrganizations();
        }
      } catch (error) {
        console.error("Error initializing admin data:", error);
        if (isMounted) {
          setError("Failed to check admin status");
          setStatusChecked(true);
          setIsAllowed(false);
        }
      }
    };
    
    initializeSuperAdminData();
    
    // Auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
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
