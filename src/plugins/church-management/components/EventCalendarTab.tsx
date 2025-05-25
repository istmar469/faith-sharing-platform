
import React from 'react';
import { Calendar } from 'lucide-react';

const EventCalendarTab: React.FC = () => {
  return (
    <div className="p-4 border-b">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="h-4 w-4 text-green-600" />
        <span className="font-medium text-sm">Event Calendar</span>
      </div>
      <p className="text-xs text-gray-600">
        Show upcoming church events and activities
      </p>
    </div>
  );
};

export default EventCalendarTab;
