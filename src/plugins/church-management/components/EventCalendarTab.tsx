
import React, { useEffect, useState } from 'react';
import { Calendar, AlertTriangle, Loader2 } from 'lucide-react';
import { useOrgApi } from '@/hooks/useOrgApi';

// Simplified Event type for this example
interface Event {
  id: string;
  title: string | null; // Assuming title can be nullable as per Supabase schema
  // Add other event properties if needed for display, e.g., date
}

const EventCalendarTab: React.FC = () => {
  const { getEvents, isContextReady } = useOrgApi(); // isContextReady can be used to delay fetch
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure the API context is ready before attempting to fetch data
    if (!isContextReady) {
      // You might want to set loading to true here or handle this state appropriately
      // For now, we'll just prevent fetching if context isn't ready.
      // The useOrgApi hook itself will throw an error if called too early,
      // but this is an additional safeguard or way to manage UI state.
      setLoading(false); // Or true, depending on desired UX before context is ready
      // setError("Organization context not yet ready."); // Optional
      return;
    }

    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: apiError } = await getEvents();
        if (apiError) {
          console.error('Error fetching events:', apiError);
          setError(apiError.message || 'Failed to fetch events.');
          setEvents([]);
        } else {
          // Filter out events with null titles for cleaner display, or handle as needed
          setEvents((data as Event[] | null)?.filter(event => event.title !== null) || []);
        }
      } catch (err: any) {
        console.error('Exception fetching events:', err);
        setError(err.message || 'An unexpected error occurred.');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [getEvents, isContextReady]); // Depend on getEvents and isContextReady

  return (
    <div className="p-4 border-b">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="h-4 w-4 text-green-600" />
        <span className="font-medium text-sm">Event Calendar</span>
      </div>
      <p className="text-xs text-gray-600 mb-4">
        Upcoming church events and activities:
      </p>

      {loading && (
        <div className="flex items-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading events...
        </div>
      )}

      {error && (
        <div className="flex items-center text-sm text-red-600">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Error: {error}
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <p className="text-sm text-muted-foreground">No events found.</p>
      )}

      {!loading && !error && events.length > 0 && (
        <ul className="list-disc pl-5 space-y-1 text-sm">
          {events.map((event) => (
            <li key={event.id}>{event.title || 'Event without title'}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EventCalendarTab;
