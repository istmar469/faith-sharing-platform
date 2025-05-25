
import React, { useEffect, useState } from 'react';
import { ComponentConfig } from '@measured/puck';
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/components/context/TenantContext';

interface ChurchStatsProps {
  title: string;
  showAttendance: boolean;
  showEvents: boolean;
  showDonations: boolean;
  layout: 'horizontal' | 'grid' | 'vertical';
  primaryColor: string;
}

interface Stats {
  totalEvents: number;
  recentAttendance: number;
  monthlyDonations: number;
  memberCount: number;
}

const ChurchStats: React.FC<ChurchStatsProps> = ({
  title = 'Church Statistics',
  showAttendance = true,
  showEvents = true,
  showDonations = true,
  layout = 'grid',
  primaryColor = '#3b82f6'
}) => {
  const { organizationId } = useTenantContext();
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    recentAttendance: 0,
    monthlyDonations: 0,
    memberCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) return;

    const fetchStats = async () => {
      try {
        // Get events count
        const { count: eventsCount } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .gte('date', new Date().toISOString().split('T')[0]);

        // Get recent attendance
        const { data: attendanceData } = await supabase
          .from('attendance_records')
          .select('count')
          .eq('organization_id', organizationId)
          .order('date', { ascending: false })
          .limit(1);

        // Get monthly donations
        const currentMonth = new Date().toISOString().slice(0, 7);
        const { data: donationsData } = await supabase
          .from('donations')
          .select('amount')
          .eq('organization_id', organizationId)
          .gte('donation_date', `${currentMonth}-01`)
          .lt('donation_date', `${currentMonth}-32`);

        const monthlyTotal = donationsData?.reduce((sum, donation) => 
          sum + Number(donation.amount), 0) || 0;

        setStats({
          totalEvents: eventsCount || 0,
          recentAttendance: attendanceData?.[0]?.count || 0,
          monthlyDonations: monthlyTotal,
          memberCount: 0 // Will be implemented with member management
        });
      } catch (error) {
        console.error('Error fetching church stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [organizationId]);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-6">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const layoutClasses = {
    horizontal: 'flex flex-wrap gap-4',
    grid: 'grid grid-cols-2 md:grid-cols-4 gap-4',
    vertical: 'space-y-4'
  };

  const statItems = [
    {
      key: 'attendance',
      show: showAttendance,
      icon: Users,
      label: 'Recent Attendance',
      value: stats.recentAttendance,
      color: '#10b981'
    },
    {
      key: 'events',
      show: showEvents,
      icon: Calendar,
      label: 'Upcoming Events',
      value: stats.totalEvents,
      color: '#3b82f6'
    },
    {
      key: 'donations',
      show: showDonations,
      icon: DollarSign,
      label: 'Monthly Donations',
      value: `$${stats.monthlyDonations.toLocaleString()}`,
      color: '#f59e0b'
    }
  ].filter(item => item.show);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 
        className="text-2xl font-bold mb-6 flex items-center gap-2"
        style={{ color: primaryColor }}
      >
        <TrendingUp className="h-6 w-6" />
        {title}
      </h3>
      
      <div className={layoutClasses[layout]}>
        {statItems.map((item) => (
          <div 
            key={item.key}
            className="bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div 
                className="p-2 rounded-full"
                style={{ backgroundColor: `${item.color}20` }}
              >
                <item.icon className="h-5 w-5" style={{ color: item.color }} />
              </div>
            </div>
            
            <div className="text-2xl font-bold mb-1" style={{ color: item.color }}>
              {item.value}
            </div>
            
            <div className="text-sm text-gray-600">{item.label}</div>
          </div>
        ))}
      </div>
      
      {statItems.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          Enable statistics to display church metrics.
        </p>
      )}
    </div>
  );
};

export const churchStatsConfig: ComponentConfig<ChurchStatsProps> = {
  fields: {
    title: { type: 'text' },
    showAttendance: { type: 'radio', options: [
      { value: true, label: 'Show' },
      { value: false, label: 'Hide' }
    ]},
    showEvents: { type: 'radio', options: [
      { value: true, label: 'Show' },
      { value: false, label: 'Hide' }
    ]},
    showDonations: { type: 'radio', options: [
      { value: true, label: 'Show' },
      { value: false, label: 'Hide' }
    ]},
    layout: { 
      type: 'select', 
      options: [
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'grid', label: 'Grid' },
        { value: 'vertical', label: 'Vertical' }
      ]
    },
    primaryColor: { type: 'text' }
  },
  defaultProps: {
    title: 'Church Statistics',
    showAttendance: true,
    showEvents: true,
    showDonations: true,
    layout: 'grid',
    primaryColor: '#3b82f6'
  },
  render: ChurchStats
};

export default ChurchStats;
