
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import SideNav from './SideNav';
import OrganizationsTable from './OrganizationsTable';
import { OrganizationData } from './types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

/**
 * Dashboard component for super admins
 */
const SuperAdminDashboard: React.FC = () => {
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAllowed, setIsAllowed] = useState(false);
  const [statusChecked, setStatusChecked] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is a super admin
  useEffect(() => {
    const checkSuperAdminStatus = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_single_super_admin_status');

        if (error) {
          console.error("Error checking super admin status:", error);
          toast({
            title: "Authentication Error",
            description: "Could not verify your admin status",
            variant: "destructive"
          });
          setError(error.message);
          setIsAllowed(false);
          setStatusChecked(true);
          return;
        }

        console.log("Super admin status response:", data);
        
        // Check if data contains is_super_admin property
        if (data && data.is_super_admin) {
          setIsAllowed(true);
          fetchOrganizations();
        } else {
          setIsAllowed(false);
          toast({
            title: "Access Denied",
            description: "You don't have super admin privileges",
            variant: "destructive"
          });
        }
        setStatusChecked(true);
      } catch (err) {
        console.error("Exception in super admin check:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatusChecked(true);
      }
    };

    checkSuperAdminStatus();
  }, [toast]);

  // Fetch all organizations if user is super admin
  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      // First try the special super admin function
      const { data, error } = await supabase
        .rpc('get_all_organizations_for_super_admin');
        
      if (error) {
        console.error("Error fetching organizations via RPC:", error);
        toast({
          title: "Error",
          description: "Failed to fetch organizations. Trying fallback method.",
          variant: "destructive"
        });
        
        // Fallback to direct table query
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('organizations')
          .select('*');
          
        if (fallbackError) {
          throw new Error(fallbackError.message);
        }
        
        if (fallbackData) {
          const orgsWithRoles = fallbackData.map(org => ({
            ...org,
            role: 'super_admin' // Add role since we know they're super admin
          }));
          setOrganizations(orgsWithRoles);
        }
      } else if (data) {
        console.log("Organizations fetched:", data);
        setOrganizations(data);
      }
    } catch (err) {
      console.error("Error fetching organizations:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch organizations");
      toast({
        title: "Error",
        description: "Could not load organizations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const filteredOrganizations = organizations.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOrgClick = (orgId: string) => {
    navigate(`/tenant-dashboard/${orgId}`);
  };

  // Show loading screen until status check is complete
  if (!statusChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Checking permissions...</span>
      </div>
    );
  }
  
  // If not a super admin, redirect to their first organization or show access denied
  if (!isAllowed) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-6">You do not have permission to view this page.</p>
        <Button onClick={() => navigate('/')}>
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <SideNav />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Super Admin Dashboard</h1>
        
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => fetchOrganizations()}>
            Refresh
          </Button>
          <Button variant="outline" onClick={() => navigate('/diagnostic')}>
            Diagnostics
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading organizations...</span>
          </div>
        ) : error ? (
          <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-800">
            {error}
          </div>
        ) : (
          <OrganizationsTable 
            organizations={filteredOrganizations} 
            onOrgClick={handleOrgClick} 
          />
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
