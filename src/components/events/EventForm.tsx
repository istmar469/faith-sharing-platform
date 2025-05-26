
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader } from 'lucide-react';
import { Event, EventCategory } from '@/services/eventService';
import { useTenantContext } from '@/components/context/TenantContext';
import { RecurrencePattern } from './RecurrenceConfig';
import { toast } from 'sonner';
import EventFormFields from './EventFormFields';
import EventFormSwitches from './EventFormSwitches';
import EventFormActions from './EventFormActions';

interface EventFormProps {
  event?: Event;
  categories: EventCategory[];
  onSubmit: (event: Event) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  showSuccess?: boolean;
}

const EventForm: React.FC<EventFormProps> = ({
  event,
  categories,
  onSubmit,
  onCancel,
  loading = false,
  showSuccess = false
}) => {
  const { organizationId } = useTenantContext();
  
  const [formData, setFormData] = useState<Partial<Event>>({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date || '',
    start_time: event?.start_time || '',
    end_time: event?.end_time || '',
    location: event?.location || '',
    category: event?.category || 'other',
    color: event?.color || '#3b82f6',
    is_recurring: event?.is_recurring || false,
    max_attendees: event?.max_attendees || undefined,
    registration_required: event?.registration_required || false,
    registration_deadline: event?.registration_deadline || '',
    published: event?.published ?? true,
    featured: event?.featured || false
  });

  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>(() => {
    if (event?.recurrence_pattern && typeof event.recurrence_pattern === 'object') {
      return event.recurrence_pattern as RecurrencePattern;
    }
    return {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: [new Date().getDay()], // Default to current day
      endType: 'never'
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Helper function to clean up date fields
  const cleanDateValue = (dateValue: string | undefined): string | undefined => {
    if (!dateValue || dateValue.trim() === '') {
      return undefined;
    }
    return dateValue;
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      errors.title = 'Event title is required';
    }

    if (!formData.date) {
      errors.date = 'Event date is required';
    }

    if (!formData.start_time) {
      errors.start_time = 'Start time is required';
    }

    if (!formData.end_time) {
      errors.end_time = 'End time is required';
    }

    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      errors.end_time = 'End time must be after start time';
    }

    if (formData.is_recurring) {
      if (recurrencePattern.frequency === 'weekly' && (!recurrencePattern.daysOfWeek || recurrencePattern.daysOfWeek.length === 0)) {
        errors.recurrence = 'Please select at least one day of the week for weekly recurrence';
      }

      if (recurrencePattern.endType === 'date' && !recurrencePattern.endDate) {
        errors.recurrence = 'Please specify an end date for the recurrence';
      }

      if (recurrencePattern.endType === 'count' && (!recurrencePattern.endCount || recurrencePattern.endCount < 1)) {
        errors.recurrence = 'Please specify a valid number of occurrences';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organizationId) {
      console.error('EventForm: No organization ID available');
      toast.error('Organization context is required');
      return;
    }

    if (!validateForm()) {
      console.error('EventForm: Form validation failed', formErrors);
      toast.error('Please fix the form errors before submitting');
      return;
    }

    setIsSubmitting(true);
    console.log('EventForm: Form submitted', { 
      title: formData.title, 
      isRecurring: formData.is_recurring,
      recurrencePattern: formData.is_recurring ? recurrencePattern : null
    });

    try {
      const eventData: Event = {
        ...event,
        ...formData,
        organization_id: organizationId,
        title: formData.title!,
        date: formData.date!,
        start_time: formData.start_time!,
        end_time: formData.end_time!,
        category: formData.category!,
        is_recurring: formData.is_recurring!,
        recurrence_pattern: formData.is_recurring ? recurrencePattern : null,
        registration_required: formData.registration_required!,
        published: formData.published!,
        featured: formData.featured!,
        // Clean up optional date fields - convert empty strings to undefined
        registration_deadline: cleanDateValue(formData.registration_deadline)
      };

      console.log('EventForm: Cleaned event data being submitted:', {
        title: eventData.title,
        registration_deadline: eventData.registration_deadline,
        is_recurring: eventData.is_recurring
      });

      await onSubmit(eventData);
      console.log('EventForm: Form submission completed successfully');
    } catch (error) {
      console.error('EventForm: Form submission failed:', error);
      
      // Show specific error message if available
      let errorMessage = 'Failed to save event. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      // Always reset submitting state to allow user to try again
      setIsSubmitting(false);
    }
  };

  const handleFormDataChange = (updates: Partial<Event>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Show success state during the success animation
  if (showSuccess) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            {event ? 'Event Updated Successfully!' : 'Event Created Successfully!'}
          </h2>
          <p className="text-green-600">
            Your event has been saved and will appear in your events list.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {loading && <Loader className="h-5 w-5 animate-spin" />}
          {event ? 'Edit Event' : 'Create New Event'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <EventFormFields
            formData={formData}
            onFormDataChange={handleFormDataChange}
            categories={categories}
            formErrors={formErrors}
            loading={loading}
          />

          <EventFormSwitches
            formData={formData}
            onFormDataChange={handleFormDataChange}
            recurrencePattern={recurrencePattern}
            onRecurrencePatternChange={setRecurrencePattern}
            formErrors={formErrors}
            loading={loading}
          />

          <EventFormActions
            event={event}
            loading={loading}
            isSubmitting={isSubmitting}
            onCancel={onCancel}
          />
        </form>
      </CardContent>
    </Card>
  );
};

export default EventForm;
