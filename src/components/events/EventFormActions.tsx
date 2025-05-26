
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { Event } from '@/services/eventService';

interface EventFormActionsProps {
  event?: Event;
  loading: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
}

const EventFormActions: React.FC<EventFormActionsProps> = ({
  event,
  loading,
  isSubmitting,
  onCancel
}) => {
  return (
    <div className="flex justify-end space-x-2">
      <Button type="button" variant="outline" onClick={onCancel} disabled={loading || isSubmitting}>
        Cancel
      </Button>
      <Button type="submit" disabled={loading || isSubmitting}>
        {loading || isSubmitting ? (
          <>
            <Loader className="h-4 w-4 mr-2 animate-spin" />
            {event ? 'Updating...' : 'Creating...'}
          </>
        ) : (
          event ? 'Update Event' : 'Create Event'
        )}
      </Button>
    </div>
  );
};

export default EventFormActions;
