
import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { ComponentConfig } from '@measured/puck';
import { supabase } from '@/integrations/supabase/client';

interface ServiceTime {
  name: string;
  time: string;
  day: string;
}

export interface ServiceTimesProps {
  title?: string;
  layout?: 'list' | 'grid' | 'card';
  showIcon?: boolean;
  backgroundColor?: string;
  textColor?: string;
  customTimes?: ServiceTime[];
  organizationId?: string;
}

const ServiceTimes: React.FC<ServiceTimesProps> = ({
  title = 'Service Times',
  layout = 'list',
  showIcon = true,
  backgroundColor = 'white',
  textColor = 'gray-900',
  customTimes = [],
  organizationId
}) => {
  const [serviceTimes, setServiceTimes] = useState<ServiceTime[]>(customTimes);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchServiceTimes = async () => {
      if (!organizationId || customTimes.length > 0) {
        setServiceTimes(customTimes);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('church_info')
          .select('service_times')
          .eq('organization_id', organizationId)
          .maybeSingle();

        if (error) throw error;

        if (data?.service_times && Array.isArray(data.service_times)) {
          const times = data.service_times as unknown as ServiceTime[];
          setServiceTimes(times.filter(time => 
            time && 
            typeof time.name === 'string' && 
            typeof time.time === 'string' && 
            typeof time.day === 'string'
          ));
        } else {
          setServiceTimes([]);
        }
      } catch (error) {
        console.error('Error fetching service times:', error);
        setServiceTimes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceTimes();
  }, [organizationId, customTimes]);

  if (loading) {
    return (
      <div className={`bg-${backgroundColor} text-${textColor} p-6 rounded-lg`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const layoutClasses = {
    list: 'space-y-2',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    card: 'grid grid-cols-1 md:grid-cols-3 gap-4'
  };

  return (
    <div className={`bg-${backgroundColor} text-${textColor} p-6 rounded-lg shadow-sm`}>
      <div className="flex items-center gap-2 mb-4">
        {showIcon && <Clock className="h-6 w-6 text-blue-600" />}
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      
      {serviceTimes.length === 0 ? (
        <p className="text-gray-500">No service times available</p>
      ) : (
        <div className={layoutClasses[layout]}>
          {serviceTimes.map((service, index) => (
            <div
              key={index}
              className={`${layout === 'card' ? 'p-4 border rounded-lg' : 'flex justify-between items-center'}`}
            >
              <div className={layout === 'card' ? 'text-center' : ''}>
                <div className="font-medium">{service.name}</div>
                <div className="text-sm text-gray-600">{service.day}</div>
                <div className="text-blue-600 font-semibold">{service.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const serviceTimesConfig: ComponentConfig<ServiceTimesProps> = {
  fields: {
    title: {
      type: 'text',
      label: 'Title'
    },
    layout: {
      type: 'select',
      label: 'Layout',
      options: [
        { label: 'List', value: 'list' },
        { label: 'Grid', value: 'grid' },
        { label: 'Card', value: 'card' }
      ]
    },
    showIcon: {
      type: 'radio',
      label: 'Show Icon',
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
    }
  },
  render: (props) => <ServiceTimes {...props} />
};

export default ServiceTimes;
