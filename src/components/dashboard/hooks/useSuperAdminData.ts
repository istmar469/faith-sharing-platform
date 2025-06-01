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
      // Get current user session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.log("useSuperAdminData: No session found");
        return false;
      }

      // Method 1: Use the reliable RPC function
      try {
        const { data: rpcResult, error: rpcError } = await supabase.rpc('direct_super_admin_check');
        if (!rpcError && rpcResult === true) {
          console.log("useSuperAdminData: RPC confirms super admin status");
          return true;
        }
      } catch (rpcException) {
        console.log("useSuperAdminData: RPC function failed:", rpcException);
      }

      // Method 2: Check the super_admins table directly
      const { data: superAdminData, error: superAdminError } = await supabase
        .from('super_admins')
        .select('user_id')
        .eq('user_id', sessionData.session.user.id)
        .limit(1);
      
      if (!superAdminError && superAdminData && superAdminData.length > 0) {
        console.log("useSuperAdminData: super_admins table confirms admin status");
        return true;
      }

      // Method 3: Check organization_members table as fallback
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', sessionData.session.user.id)
        .eq('role', 'super_admin')
        .limit(1);
      
      if (!memberError && memberData && memberData.length > 0) {
        console.log("useSuperAdminData: organization_members table confirms admin status");
        return true;
      }

      console.log("useSuperAdminData: No admin status found");
      return false;
    } catch (err) {
      console.error("useSuperAdminData: Admin check error:", err);
      return false;
    }
  }, []);
  
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
        setLoading(false);
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
