
import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

interface EventsCalendarProps {
  showUpcoming?: number;
  isEditable?: boolean;
}

const EventsCalendar: React.FC<EventsCalendarProps> = ({ 
  showUpcoming = 3,
  isEditable = false
}) => {
  // Mock events
  const events = [
    { id: 1, title: 'Sunday Worship', date: 'May 25, 2025', time: '10:00 AM' },
    { id: 2, title: 'Bible Study', date: 'May 27, 2025', time: '7:00 PM' },
    { id: 3, title: 'Youth Group', date: 'May 28, 2025', time: '6:30 PM' }
  ];

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center mb-4">
        <Calendar className="h-5 w-5 mr-2 text-blue-500" />
        <h3 className="font-semibold">Upcoming Events</h3>
      </div>
      
      <div className="space-y-3">
        {events.slice(0, showUpcoming).map(event => (
          <div key={event.id} className="p-3 bg-gray-50 rounded">
            <h4 className="font-medium">{event.title}</h4>
            <p className="text-sm text-gray-500">{event.date} at {event.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsCalendar;
