
import React, { useEffect, useState } from 'react';
import { ComponentConfig } from '@measured/puck';
import { Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/components/context/TenantContext';

interface ServiceTimesProps {
  title: string;
  showLocation: boolean;
  layout: 'list' | 'grid' | 'compact';
  primaryColor: string;
}

interface ServiceTime {
  name: string;
  time: string;
  day: string;
  location?: string;
}

const ServiceTimes: React.FC<ServiceTimesProps> = ({
  title = 'Service Times',
  showLocation = true,
  layout = 'list',
  primaryColor = '#3b82f6'
}) => {
  const { organizationId } = useTenantContext();
  const [serviceTimes, setServiceTimes] = useState<ServiceTime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) return;

    const fetchServiceTimes = async () => {
      try {
        const { data } = await supabase
          .from('church_info')
          .select('service_times')
          .eq('organization_id', organizationId)
          .single();

        if (data?.service_times) {
          setServiceTimes(data.service_times as ServiceTime[]);
        }
      } catch (error) {
        console.error('Error fetching service times:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceTimes();
  }, [organizationId]);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-6">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const layoutClasses = {
    list: 'space-y-4',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    compact: 'space-y-2'
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 
        className="text-2xl font-bold mb-6 flex items-center gap-2"
        style={{ color: primaryColor }}
      >
        <Clock className="h-6 w-6" />
        {title}
      </h3>
      
      <div className={layoutClasses[layout]}>
        {serviceTimes.map((service, index) => (
          <div 
            key={index}
            className={`${layout === 'compact' ? 'p-3' : 'p-4'} border rounded-lg hover:shadow-md transition-shadow`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-lg">{service.name}</h4>
                <p className="text-gray-600 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {service.day} at {service.time}
                </p>
              </div>
            </div>
            
            {showLocation && service.location && (
              <p className="text-gray-500 mt-2 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {service.location}
              </p>
            )}
          </div>
        ))}
      </div>
      
      {serviceTimes.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          No service times available. Add them in your church settings.
        </p>
      )}
    </div>
  );
};

export const serviceTimesConfig: ComponentConfig<ServiceTimesProps> = {
  fields: {
    title: { type: 'text' },
    showLocation: { type: 'radio', options: [
      { value: true, label: 'Show' },
      { value: false, label: 'Hide' }
    ]},
    layout: { 
      type: 'select', 
      options: [
        { value: 'list', label: 'List' },
        { value: 'grid', label: 'Grid' },
        { value: 'compact', label: 'Compact' }
      ]
    },
    primaryColor: { type: 'text' }
  },
  defaultProps: {
    title: 'Service Times',
    showLocation: true,
    layout: 'list',
    primaryColor: '#3b82f6'
  },
  render: ServiceTimes
};

export default ServiceTimes;
