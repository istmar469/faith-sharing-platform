import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrganizationData } from '../types';
import { isSuperAdmin } from '@/utils/superAdminCheck';

export const useSuperAdminData = () => {
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAllowed, setIsAllowed] = useState<boolean>(false);
  const [statusChecked, setStatusChecked] = useState<boolean>(false);
  
  const checkSuperAdminStatus = useCallback(async () => {
    try {
      console.log("useSuperAdminData: Checking super admin status...");
      const adminStatus = await isSuperAdmin();
      console.log("useSuperAdminData: Super admin status:", adminStatus);
      setIsAllowed(adminStatus);
      return adminStatus;
    } catch (error) {
      console.error('useSuperAdminData: Error checking super admin status:', error);
      setError('Failed to verify admin status');
      setIsAllowed(false);
      return false;
    } finally {
      setStatusChecked(true);
    }
  }, []); // No dependencies
  
  const fetchOrganizations = useCallback(async () => {
    console.log("useSuperAdminData: Starting fetchOrganizations...");
    setLoading(true);
    setError(null);
    
    try {
      console.log("useSuperAdminData: Making Supabase query to organizations table...");
      const { data, error: fetchError } = await supabase
        .from('organizations')
        .select('*')
        .order('name');
      
      console.log("useSuperAdminData: Supabase response:", { data, fetchError });
      
      if (fetchError) {
        console.error("useSuperAdminData: Error fetching organizations:", fetchError);
        setError("Failed to load organizations");
        return;
      }
      
      if (data) {
        console.log("useSuperAdminData: Raw organizations data:", data);
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
        console.log("useSuperAdminData: Transformed organizations data:", transformedData);
        setOrganizations(transformedData);
        console.log("useSuperAdminData: Organizations state updated with", transformedData.length, "organizations");
      } else {
        console.log("useSuperAdminData: No data returned from query");
        setOrganizations([]);
      }
    } catch (error) {
      console.error("useSuperAdminData: Organizations fetch error:", error);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
      console.log("useSuperAdminData: fetchOrganizations completed");
    }
  }, []); // No dependencies
  
  useEffect(() => {
    let isMounted = true;
    
    const initializeSuperAdminData = async () => {
      console.log("useSuperAdminData: Initializing super admin data...");
      
      // First, get user session - if no session, don't bother checking admin status
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.log("useSuperAdminData: No session found");
        if (isMounted) {
          setStatusChecked(true);
          setIsAllowed(false);
          setLoading(false);
        }
        return;
      }
      
      try {
        // Check if the user is an admin
        const isAdmin = await checkSuperAdminStatus();
          
        if (!isMounted) return;
        
        // If admin, fetch organizations
        if (isAdmin) {
          console.log("useSuperAdminData: User is admin, fetching organizations...");
          await fetchOrganizations();
        } else {
          console.log("useSuperAdminData: User is not admin");
          setLoading(false);
        }
      } catch (error) {
        console.error("useSuperAdminData: Error initializing admin data:", error);
        if (isMounted) {
          setError("Failed to check admin status");
          setStatusChecked(true);
          setIsAllowed(false);
          setLoading(false);
        }
      }
    };
    
    initializeSuperAdminData();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only run once
  
  const refetch = useCallback(() => {
    if (isAllowed) {
      fetchOrganizations();
    }
  }, [isAllowed, fetchOrganizations]);
  
  return {
    organizations,
    loading,
    error,
    isAllowed,
    statusChecked,
    fetchOrganizations: refetch
  };
};
