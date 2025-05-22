
import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EventsCalendarProps {
  showUpcoming?: number;
  isEditable?: boolean;
  onShowUpcomingChange?: (value: number) => void;
}

const EventsCalendar: React.FC<EventsCalendarProps> = ({ 
  showUpcoming = 3,
  isEditable = false,
  onShowUpcomingChange
}) => {
  // State for editable showUpcoming value
  const [editingCount, setEditingCount] = useState(false);
  const [countValue, setCountValue] = useState(showUpcoming);

  // Mock events
  const events = [
    { id: 1, title: 'Sunday Worship', date: 'May 25, 2025', time: '10:00 AM' },
    { id: 2, title: 'Bible Study', date: 'May 27, 2025', time: '7:00 PM' },
    { id: 3, title: 'Youth Group', date: 'May 28, 2025', time: '6:30 PM' }
  ];

  const handleSaveCount = () => {
    const numValue = parseInt(countValue.toString(), 10);
    if (onShowUpcomingChange && !isNaN(numValue)) {
      onShowUpcomingChange(numValue);
    }
    setEditingCount(false);
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-500" />
          <h3 className="font-semibold">Upcoming Events</h3>
        </div>
        
        {isEditable && (
          <div className="flex items-center">
            {editingCount ? (
              <div className="flex items-center gap-2">
                <Input 
                  type="number" 
                  min="1" 
                  max="10" 
                  value={countValue} 
                  onChange={(e) => setCountValue(Number(e.target.value))} 
                  className="w-16"
                />
                <Button size="sm" onClick={handleSaveCount}>Save</Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setEditingCount(true)}
              >
                Show: {showUpcoming}
              </Button>
            )}
          </div>
        )}
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
