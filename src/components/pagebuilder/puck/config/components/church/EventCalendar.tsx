
import React, { useEffect, useState } from 'react';
import { ComponentConfig } from '@measured/puck';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/components/context/TenantContext';
import { format, parseISO } from 'date-fns';

interface EventCalendarProps {
  title: string;
  maxEvents: number;
  showPastEvents: boolean;
  layout: 'list' | 'card' | 'minimal';
  primaryColor: string;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  start_time: string;
  end_time: string;
  location?: string;
  category: string;
}

const EventCalendar: React.FC<EventCalendarProps> = ({
  title = 'Upcoming Events',
  maxEvents = 5,
  showPastEvents = false,
  layout = 'card',
  primaryColor = '#3b82f6'
}) => {
  const { organizationId } = useTenantContext();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) return;

    const fetchEvents = async () => {
      try {
        const query = supabase
          .from('events')
          .select('*')
          .eq('organization_id', organizationId)
          .order('date', { ascending: true })
          .limit(maxEvents);

        if (!showPastEvents) {
          query.gte('date', new Date().toISOString().split('T')[0]);
        }

        const { data } = await query;
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [organizationId, maxEvents, showPastEvents]);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-6">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const layoutClasses = {
    list: 'space-y-3',
    card: 'grid gap-4 md:grid-cols-2 lg:grid-cols-3',
    minimal: 'space-y-2'
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 
        className="text-2xl font-bold mb-6 flex items-center gap-2"
        style={{ color: primaryColor }}
      >
        <Calendar className="h-6 w-6" />
        {title}
      </h3>
      
      <div className={layoutClasses[layout]}>
        {events.map((event) => (
          <div 
            key={event.id}
            className={`border rounded-lg hover:shadow-md transition-shadow ${
              layout === 'minimal' ? 'p-3' : 'p-4'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-lg">{event.title}</h4>
              <span 
                className="text-xs px-2 py-1 rounded-full"
                style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
              >
                {event.category}
              </span>
            </div>
            
            <div className="text-gray-600 space-y-1">
              <p className="flex items-center gap-1 text-sm">
                <Calendar className="h-4 w-4" />
                {format(parseISO(event.date), 'MMMM d, yyyy')}
              </p>
              
              <p className="flex items-center gap-1 text-sm">
                <Clock className="h-4 w-4" />
                {event.start_time} - {event.end_time}
              </p>
              
              {event.location && (
                <p className="flex items-center gap-1 text-sm">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </p>
              )}
            </div>
            
            {event.description && layout !== 'minimal' && (
              <p className="text-gray-700 mt-3 text-sm line-clamp-2">
                {event.description}
              </p>
            )}
          </div>
        ))}
      </div>
      
      {events.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          No events available. Create events in your church management dashboard.
        </p>
      )}
    </div>
  );
};

export const eventCalendarConfig: ComponentConfig<EventCalendarProps> = {
  fields: {
    title: { type: 'text' },
    maxEvents: { type: 'number' },
    showPastEvents: { type: 'radio', options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' }
    ]},
    layout: { 
      type: 'select', 
      options: [
        { value: 'list', label: 'List' },
        { value: 'card', label: 'Card Grid' },
        { value: 'minimal', label: 'Minimal' }
      ]
    },
    primaryColor: { type: 'text' }
  },
  defaultProps: {
    title: 'Upcoming Events',
    maxEvents: 5,
    showPastEvents: false,
    layout: 'card',
    primaryColor: '#3b82f6'
  },
  render: EventCalendar
};

export default EventCalendar;
