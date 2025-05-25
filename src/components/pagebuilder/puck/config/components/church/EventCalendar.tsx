
import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { ComponentConfig } from '@measured/puck';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/components/context/TenantContext';

interface Event {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location?: string;
  description?: string;
  category: string;
}

export interface EventCalendarProps {
  title?: string;
  layout?: 'list' | 'grid' | 'compact';
  showIcon?: boolean;
  maxEvents?: number;
  backgroundColor?: string;
  textColor?: string;
}

const EventCalendar: React.FC<EventCalendarProps> = ({
  title = 'Upcoming Events',
  layout = 'list',
  showIcon = true,
  maxEvents = 5,
  backgroundColor = 'white',
  textColor = 'gray-900'
}) => {
  const { organizationId } = useTenantContext();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!organizationId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('organization_id', organizationId)
          .gte('date', new Date().toISOString().split('T')[0])
          .order('date', { ascending: true })
          .limit(maxEvents);

        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [organizationId, maxEvents]);

  if (loading) {
    return (
      <div className={`bg-${backgroundColor} text-${textColor} p-6 rounded-lg`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded p-4">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const layoutClasses = {
    list: 'space-y-4',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    compact: 'space-y-2'
  };

  return (
    <div className={`bg-${backgroundColor} text-${textColor} p-6 rounded-lg shadow-sm`}>
      <div className="flex items-center gap-2 mb-4">
        {showIcon && <Calendar className="h-6 w-6 text-green-600" />}
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>

      {events.length === 0 ? (
        <p className="text-gray-500">No upcoming events</p>
      ) : (
        <div className={layoutClasses[layout]}>
          {events.map((event) => (
            <div
              key={event.id}
              className={`${layout === 'compact' ? 'border-l-4 border-green-500 pl-4' : 'border rounded-lg p-4'} hover:shadow-md transition-shadow`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-lg">{event.title}</h4>
                <span className="text-sm text-green-600 font-medium">
                  {formatDate(event.date)}
                </span>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
                </div>
                
                {event.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
              
              {event.description && layout !== 'compact' && (
                <p className="text-sm text-gray-700 mt-2">{event.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const eventCalendarConfig: ComponentConfig<EventCalendarProps> = {
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
        { label: 'Compact', value: 'compact' }
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
    maxEvents: {
      type: 'number',
      label: 'Max Events to Display'
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
  render: (props) => <EventCalendar {...props} />
};

export default EventCalendar;
