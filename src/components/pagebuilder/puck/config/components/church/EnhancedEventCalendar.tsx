
import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, Users, Filter, Grid, List, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { ComponentConfig } from '@measured/puck';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/components/context/TenantContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Event {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location?: string;
  description?: string;
  category: string;
  color?: string;
  featured: boolean;
  max_attendees?: number;
}

export interface EnhancedEventCalendarProps {
  title?: string;
  layout?: 'list' | 'grid' | 'calendar' | 'timeline';
  showFilters?: boolean;
  maxEvents?: number;
  showIcon?: boolean;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  showCreateButton?: boolean;
  compactMode?: boolean;
}

const EnhancedEventCalendar: React.FC<EnhancedEventCalendarProps> = ({
  title = 'Upcoming Events',
  layout = 'grid',
  showFilters = true,
  maxEvents = 6,
  showIcon = true,
  backgroundColor = 'white',
  textColor = 'gray-900',
  accentColor = 'blue-600',
  showCreateButton = false,
  compactMode = false
}) => {
  const { organizationId } = useTenantContext();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

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
          .eq('published', true)
          .gte('date', new Date().toISOString().split('T')[0])
          .order('date', { ascending: true })
          .order('start_time', { ascending: true })
          .limit(maxEvents * 2); // Fetch more for filtering

        if (error) throw error;
        
        const eventData = data || [];
        setEvents(eventData);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(eventData.map(event => event.category))];
        setCategories(uniqueCategories);
        
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [organizationId, maxEvents]);

  useEffect(() => {
    let filtered = events;
    
    if (selectedCategory !== 'all') {
      filtered = events.filter(event => event.category === selectedCategory);
    }
    
    // Limit to maxEvents after filtering
    filtered = filtered.slice(0, maxEvents);
    
    setFilteredEvents(filtered);
  }, [events, selectedCategory, maxEvents]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: compactMode ? 'short' : 'long',
      month: compactMode ? 'short' : 'long',
      day: 'numeric',
      year: currentDate.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'service': 'bg-blue-100 text-blue-800 border-blue-200',
      'meeting': 'bg-green-100 text-green-800 border-green-200',
      'special event': 'bg-purple-100 text-purple-800 border-purple-200',
      'community': 'bg-orange-100 text-orange-800 border-orange-200',
      'other': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[category.toLowerCase()] || colors.other;
  };

  if (loading) {
    return (
      <div className={`bg-${backgroundColor} text-${textColor} p-6 rounded-xl shadow-sm border`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const containerClasses = {
    list: 'space-y-4',
    grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
    calendar: 'grid grid-cols-7 gap-2',
    timeline: 'space-y-6 relative'
  };

  const EventCard: React.FC<{ event: Event; isCompact?: boolean }> = ({ event, isCompact = false }) => (
    <Card className={`group hover:shadow-lg transition-all duration-300 border-l-4 ${isCompact ? 'p-3' : ''}`} 
          style={{ borderLeftColor: event.color || '#3b82f6' }}>
      <CardContent className={isCompact ? 'p-3' : 'p-4'}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className={`font-semibold ${isCompact ? 'text-sm' : 'text-lg'} text-gray-900 group-hover:text-${accentColor} transition-colors`}>
              {event.title}
            </h4>
            <Badge className={`${getCategoryColor(event.category)} text-xs mt-1`}>
              {event.category}
            </Badge>
          </div>
          {event.featured && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
              Featured
            </Badge>
          )}
        </div>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{formatDate(event.date)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
          </div>
          
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          
          {event.max_attendees && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span>Max {event.max_attendees} attendees</span>
            </div>
          )}
        </div>
        
        {event.description && !isCompact && (
          <p className="text-sm text-gray-500 mt-3 line-clamp-2">
            {event.description}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className={`bg-${backgroundColor} text-${textColor} p-6 rounded-xl shadow-sm border`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {showIcon && (
            <div className={`p-2 rounded-lg bg-${accentColor} bg-opacity-10`}>
              <Calendar className={`h-6 w-6 text-${accentColor}`} />
            </div>
          )}
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {showCreateButton && (
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && categories.length > 0 && (
        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by category:</span>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Events Display */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">No upcoming events</h3>
          <p className="text-gray-400">
            {selectedCategory !== 'all' 
              ? `No events found in the "${selectedCategory}" category.`
              : 'Check back soon for new events!'
            }
          </p>
          {showCreateButton && (
            <Button className="mt-4" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Event
            </Button>
          )}
        </div>
      ) : (
        <div className={containerClasses[layout]}>
          {layout === 'timeline' && (
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          )}
          
          {filteredEvents.map((event, index) => (
            <div key={event.id} className={layout === 'timeline' ? 'relative pl-8' : ''}>
              {layout === 'timeline' && (
                <div className={`absolute left-2 w-3 h-3 rounded-full bg-${accentColor} -translate-x-1/2 mt-6`}></div>
              )}
              <EventCard event={event} isCompact={compactMode || layout === 'timeline'} />
            </div>
          ))}
        </div>
      )}
      
      {/* Load More */}
      {events.length > maxEvents && (
        <div className="text-center mt-6">
          <Button variant="outline" size="sm">
            View All Events ({events.length} total)
          </Button>
        </div>
      )}
    </div>
  );
};

export const enhancedEventCalendarConfig: ComponentConfig<EnhancedEventCalendarProps> = {
  fields: {
    title: {
      type: 'text',
      label: 'Title'
    },
    layout: {
      type: 'select',
      label: 'Layout Style',
      options: [
        { label: 'Grid View', value: 'grid' },
        { label: 'List View', value: 'list' },
        { label: 'Timeline View', value: 'timeline' }
      ]
    },
    showFilters: {
      type: 'radio',
      label: 'Show Category Filters',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    },
    maxEvents: {
      type: 'number',
      label: 'Maximum Events to Display'
    },
    showIcon: {
      type: 'radio',
      label: 'Show Calendar Icon',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    },
    compactMode: {
      type: 'radio',
      label: 'Compact Mode',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    },
    accentColor: {
      type: 'select',
      label: 'Accent Color',
      options: [
        { label: 'Blue', value: 'blue-600' },
        { label: 'Green', value: 'green-600' },
        { label: 'Purple', value: 'purple-600' },
        { label: 'Orange', value: 'orange-600' },
        { label: 'Red', value: 'red-600' }
      ]
    }
  },
  render: (props) => <EnhancedEventCalendar {...props} />
};

export default EnhancedEventCalendar;
