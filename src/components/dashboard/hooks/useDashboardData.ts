
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Organization {
  id: string;
  name: string;
  subdomain?: string;
  website_enabled?: boolean;
}

export interface DashboardStats {
  totalMembers: number;
  upcomingEvents: number;
  monthlyDonations: number;
  recentActivity: number;
}

export const useDashboardData = (organizationId: string | undefined, hasAccess: boolean) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    upcomingEvents: 0,
    monthlyDonations: 0,
    recentActivity: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (hasAccess && organizationId) {
      fetchOrganizationData();
    }
  }, [organizationId, hasAccess]);

  const fetchOrganizationData = async () => {
    if (!organizationId) return;

    try {
      // Fetch organization data
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();

      if (orgError) {
        console.error('Error fetching organization:', orgError);
        toast({
          title: "Error",
          description: "Failed to load organization data",
          variant: "destructive"
        });
        return;
      }

      if (!orgData) {
        console.log("Organization not found");
        toast({
          title: "Error",
          description: "Organization not found",
          variant: "destructive"
        });
        return;
      }

      console.log("Successfully loaded organization:", orgData.name);
      setOrganization(orgData);

      // Fetch dashboard statistics
      await fetchDashboardStats();
    } catch (error) {
      console.error('Error fetching organization data:', error);
      toast({
        title: "Error",
        description: "Failed to load organization data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    if (!organizationId) return;

    try {
      // Get total events count
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .gte('date', new Date().toISOString().split('T')[0]);

      // Get total donations for current month
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const { data: donationsData } = await supabase
        .from('donations')
        .select('amount')
        .eq('organization_id', organizationId)
        .gte('donation_date', `${currentMonth}-01`)
        .lt('donation_date', `${currentMonth}-32`);

      const monthlyTotal = donationsData?.reduce((sum, donation) => sum + Number(donation.amount), 0) || 0;

      setStats({
        totalMembers: 0, // We'll implement member management next
        upcomingEvents: eventsCount || 0,
        monthlyDonations: monthlyTotal,
        recentActivity: 5 // Placeholder
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  return { organization, stats, loading };
};
