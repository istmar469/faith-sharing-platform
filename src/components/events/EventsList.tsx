
import React from 'react';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Event } from '@/services/eventService';

interface EventsListProps {
  events: Event[];
  onEditEvent?: (event: Event) => void;
  onDeleteEvent?: (eventId: string) => void;
  showActions?: boolean;
}

const EventsList: React.FC<EventsListProps> = ({
  events,
  onEditEvent,
  onDeleteEvent,
  showActions = false
}) => {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      service: 'bg-green-100 text-green-800',
      meeting: 'bg-blue-100 text-blue-800',
      'special event': 'bg-yellow-100 text-yellow-800',
      community: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category.toLowerCase()] || colors.other;
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new event.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card key={event.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  {event.featured && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Featured
                    </Badge>
                  )}
                  {!event.published && (
                    <Badge variant="outline">Draft</Badge>
                  )}
                </div>
                <Badge className={getCategoryColor(event.category)}>
                  {event.category}
                </Badge>
              </div>
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: event.color }}
              />
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {event.description && (
              <p className="text-gray-600 mb-4">{event.description}</p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(event.date)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
              </div>
              
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              )}
              
              {event.max_attendees && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Max {event.max_attendees} attendees</span>
                </div>
              )}
            </div>
            
            {event.registration_required && (
              <div className="mt-3">
                <Badge variant="outline" className="text-xs">
                  Registration Required
                  {event.registration_deadline && (
                    <span className="ml-1">by {formatDate(event.registration_deadline)}</span>
                  )}
                </Badge>
              </div>
            )}
            
            {showActions && (onEditEvent || onDeleteEvent) && (
              <div className="flex justify-end gap-2 mt-4">
                {onEditEvent && (
                  <Button variant="outline" size="sm" onClick={() => onEditEvent(event)}>
                    Edit
                  </Button>
                )}
                {onDeleteEvent && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onDeleteEvent(event.id!)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EventsList;
