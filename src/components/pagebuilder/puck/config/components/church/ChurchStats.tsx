import React, { useEffect, useState } from 'react';
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { ComponentConfig } from '@measured/puck';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/components/context/TenantContext';

interface StatsData {
  totalMembers: number;
  monthlyEvents: number;
  monthlyDonations: number;
  avgAttendance: number;
}

export interface ChurchStatsProps {
  title?: string;
  layout?: 'grid' | 'horizontal' | 'minimal';
  showIcons?: boolean;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  organizationId?: string;
}

const ChurchStatsWrapper: React.FC<ChurchStatsProps> = (props) => {
  let organizationId: string | null = props.organizationId || null;
  
  if (!organizationId) {
    try {
      const { organizationId: contextOrgId } = useTenantContext();
      organizationId = contextOrgId;
    } catch (error) {
      organizationId = null;
    }
  }
  
  return <ChurchStats {...props} organizationId={organizationId} />;
};

const ChurchStats: React.FC<ChurchStatsProps> = ({
  title = 'Church Statistics',
  layout = 'grid',
  showIcons = true,
  backgroundColor = 'white',
  textColor = 'gray-900',
  accentColor = 'indigo-600',
  organizationId
}) => {
  const [stats, setStats] = useState<StatsData>({
    totalMembers: 0,
    monthlyEvents: 0,
    monthlyDonations: 0,
    avgAttendance: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!organizationId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch organization members count
        const { count: membersCount } = await supabase
          .from('organization_members')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId);

        // Fetch this month's events
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        const { count: eventsCount } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .gte('date', startOfMonth.toISOString().split('T')[0]);

        // Fetch this month's donations
        const { data: donationsData } = await supabase
          .from('donations')
          .select('amount')
          .eq('organization_id', organizationId)
          .gte('donation_date', startOfMonth.toISOString().split('T')[0]);

        const totalDonations = donationsData?.reduce((sum, donation) => 
          sum + parseFloat(donation.amount.toString()), 0) || 0;

        // Fetch average attendance (last 3 months)
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const { data: attendanceData } = await supabase
          .from('attendance_records')
          .select('count')
          .eq('organization_id', organizationId)
          .gte('date', threeMonthsAgo.toISOString().split('T')[0]);

        const avgAttendance = attendanceData?.length ? 
          Math.round(attendanceData.reduce((sum, record) => sum + record.count, 0) / attendanceData.length) : 0;

        setStats({
          totalMembers: membersCount || 0,
          monthlyEvents: eventsCount || 0,
          monthlyDonations: totalDonations,
          avgAttendance
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
      <div className={`bg-${backgroundColor} text-${textColor} p-6 rounded-lg`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statsItems = [
    {
      icon: Users,
      label: 'Total Members',
      value: stats.totalMembers,
      format: (val: number) => val.toString()
    },
    {
      icon: Calendar,
      label: 'Monthly Events',
      value: stats.monthlyEvents,
      format: (val: number) => val.toString()
    },
    {
      icon: DollarSign,
      label: 'Monthly Donations',
      value: stats.monthlyDonations,
      format: (val: number) => `$${val.toLocaleString()}`
    },
    {
      icon: TrendingUp,
      label: 'Avg Attendance',
      value: stats.avgAttendance,
      format: (val: number) => val.toString()
    }
  ];

  const layoutClasses = {
    grid: 'grid grid-cols-2 md:grid-cols-4 gap-4',
    horizontal: 'flex flex-wrap justify-center gap-8',
    minimal: 'flex flex-wrap justify-center gap-12'
  };

  return (
    <div className={`bg-${backgroundColor} text-${textColor} p-6 rounded-lg shadow-sm`}>
      <h3 className="text-xl font-semibold mb-6 text-center">{title}</h3>
      
      <div className={layoutClasses[layout]}>
        {statsItems.map((item, index) => {
          const IconComponent = item.icon;
          
          return (
            <div key={index} className="text-center">
              {showIcons && (
                <IconComponent className={`h-8 w-8 text-${accentColor} mx-auto mb-2`} />
              )}
              <div className={`text-2xl md:text-3xl font-bold text-${accentColor} mb-1`}>
                {item.format(item.value)}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const churchStatsConfig: ComponentConfig<ChurchStatsProps> = {
  fields: {
    title: {
      type: 'text',
      label: 'Title'
    },
    layout: {
      type: 'select',
      label: 'Layout',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Minimal', value: 'minimal' }
      ]
    },
    showIcons: {
      type: 'radio',
      label: 'Show Icons',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    },
    backgroundColor: {
      type: 'text',
      label: 'Background Color'
    },
    textColor: {
      type: 'text',
      label: 'Text Color'
    },
    accentColor: {
      type: 'text',
      label: 'Accent Color'
    }
  },
  render: (props) => <ChurchStatsWrapper {...props} />
};

export default ChurchStats;
