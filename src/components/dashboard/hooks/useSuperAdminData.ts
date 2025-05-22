
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrganizationData } from '../types';

export const useSuperAdminData = () => {
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAllowed, setIsAllowed] = useState<boolean>(false);
  const [statusChecked, setStatusChecked] = useState<boolean>(false);
  
  // Check if user has admin privileges
  const checkAdminStatus = useCallback(async (): Promise<boolean> => {
    try {
      // Query the users table directly to check for super_admin role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();
      
      if (userError) {
        console.error("Admin check error:", userError);
        return false;
      }
      
      // Check if the user role is super_admin
      return userData?.role === 'super_admin';
    } catch (err) {
      console.error("Admin check error:", err);
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
        // Check if the user is an admin by querying the users table
        const isAdmin = await checkAdminStatus();
          
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
    
    return () => {
      isMounted = false;
    };
  }, [checkAdminStatus, fetchOrganizations]);
  
  return {
    organizations,
    loading,
    error,
    isAllowed,
    statusChecked,
    fetchOrganizations
  };
};
