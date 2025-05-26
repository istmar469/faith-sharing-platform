import { supabase } from '@/integrations/supabase/client';

export interface Event {
  id?: string;
  organization_id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD format
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  location?: string;
  category: string;
  color?: string;
  is_recurring: boolean;
  recurrence_pattern?: any; // JSON object for recurring rules
  max_attendees?: number;
  registration_required: boolean;
  registration_deadline?: string; // YYYY-MM-DD format
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  published: boolean;
  featured: boolean;
}

export interface EventRegistration {
  id?: string;
  event_id: string;
  organization_id: string;
  attendee_name: string;
  attendee_email: string;
  attendee_phone?: string;
  registration_date?: string;
  status: 'confirmed' | 'cancelled' | 'waitlist';
  notes?: string;
  created_at?: string;
}

export interface EventCategory {
  id?: string;
  organization_id: string;
  name: string;
  color: string;
  description?: string;
  created_at?: string;
}

export interface EventTemplate {
  id?: string;
  organization_id: string;
  name: string;
  template_data: any; // JSON object with event template data
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

// Event CRUD operations
export async function createEvent(event: Event): Promise<Event> {
  console.log('EventService: Creating event:', event.title);
  console.log('EventService: Event data:', {
    title: event.title,
    isRecurring: event.is_recurring,
    recurrencePattern: event.recurrence_pattern
  });
  
  try {
    const { data, error } = await supabase
      .from('events')
      .insert({
        organization_id: event.organization_id,
        title: event.title,
        description: event.description,
        date: event.date,
        start_time: event.start_time,
        end_time: event.end_time,
        location: event.location,
        category: event.category,
        color: event.color || '#3b82f6',
        is_recurring: event.is_recurring,
        recurrence_pattern: event.recurrence_pattern,
        max_attendees: event.max_attendees,
        registration_required: event.registration_required,
        registration_deadline: event.registration_deadline,
        published: event.published,
        featured: event.featured
      })
      .select()
      .single();

    if (error) {
      console.error('EventService: Database error creating event:', error);
      console.error('EventService: Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Failed to create event: ${error.message}`);
    }

    console.log('EventService: Event created successfully:', data.id);
    return data;
  } catch (error) {
    console.error('EventService: Unexpected error creating event:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while creating the event');
  }
}

export async function getEvent(id: string): Promise<Event | null> {
  console.log('EventService: Fetching event:', id);
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('EventService: Error fetching event:', error);
    throw error;
  }

  return data;
}

export async function getOrganizationEvents(organizationId: string): Promise<Event[]> {
  console.log('EventService: Fetching events for organization:', organizationId);
  
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('organization_id', organizationId)
      .order('date', { ascending: true });

    if (error) {
      console.error('EventService: Error fetching organization events:', error);
      throw new Error(`Failed to fetch events: ${error.message}`);
    }

    console.log(`EventService: Successfully fetched ${data.length} events`);
    return data || [];
  } catch (error) {
    console.error('EventService: Unexpected error fetching events:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching events');
  }
}

export async function getPublishedEvents(organizationId: string): Promise<Event[]> {
  console.log('EventService: Fetching published events for organization:', organizationId);
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('published', true)
    .order('date', { ascending: true });

  if (error) {
    console.error('EventService: Error fetching published events:', error);
    throw error;
  }

  return data || [];
}

export async function updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
  console.log('EventService: Updating event:', id);
  console.log('EventService: Update data:', {
    isRecurring: updates.is_recurring,
    recurrencePattern: updates.recurrence_pattern
  });
  
  try {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('EventService: Error updating event:', error);
      throw new Error(`Failed to update event: ${error.message}`);
    }

    console.log('EventService: Event updated successfully');
    return data;
  } catch (error) {
    console.error('EventService: Unexpected error updating event:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while updating the event');
  }
}

export async function deleteEvent(id: string): Promise<boolean> {
  console.log('EventService: Deleting event:', id);
  
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('EventService: Error deleting event:', error);
    throw error;
  }

  console.log('EventService: Event deleted successfully');
  return true;
}

// Event Registration CRUD operations
export async function createEventRegistration(registration: EventRegistration): Promise<EventRegistration> {
  console.log('EventService: Creating event registration for:', registration.attendee_email);
  
  const { data, error } = await supabase
    .from('event_registrations')
    .insert(registration)
    .select()
    .single();

  if (error) {
    console.error('EventService: Error creating registration:', error);
    throw error;
  }

  console.log('EventService: Registration created successfully');
  return data as EventRegistration;
}

export async function getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
  console.log('EventService: Fetching registrations for event:', eventId);
  
  const { data, error } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', eventId)
    .order('registration_date', { ascending: false });

  if (error) {
    console.error('EventService: Error fetching registrations:', error);
    throw error;
  }

  return (data || []) as EventRegistration[];
}

export async function updateEventRegistration(id: string, updates: Partial<EventRegistration>): Promise<EventRegistration> {
  console.log('EventService: Updating registration:', id);
  
  const { data, error } = await supabase
    .from('event_registrations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('EventService: Error updating registration:', error);
    throw error;
  }

  return data as EventRegistration;
}

// Event Category CRUD operations
export async function getEventCategories(organizationId: string): Promise<EventCategory[]> {
  console.log('EventService: Fetching categories for organization:', organizationId);
  
  const { data, error } = await supabase
    .from('event_categories')
    .select('*')
    .eq('organization_id', organizationId)
    .order('name');

  if (error) {
    console.error('EventService: Error fetching categories:', error);
    throw error;
  }

  return data || [];
}

export async function createEventCategory(category: EventCategory): Promise<EventCategory> {
  console.log('EventService: Creating category:', category.name);
  
  const { data, error } = await supabase
    .from('event_categories')
    .insert(category)
    .select()
    .single();

  if (error) {
    console.error('EventService: Error creating category:', error);
    throw error;
  }

  return data;
}

// Event Template CRUD operations
export async function getEventTemplates(organizationId: string): Promise<EventTemplate[]> {
  console.log('EventService: Fetching templates for organization:', organizationId);
  
  const { data, error } = await supabase
    .from('event_templates')
    .select('*')
    .eq('organization_id', organizationId)
    .order('name');

  if (error) {
    console.error('EventService: Error fetching templates:', error);
    throw error;
  }

  return data || [];
}

export async function createEventTemplate(template: EventTemplate): Promise<EventTemplate> {
  console.log('EventService: Creating template:', template.name);
  
  const { data, error } = await supabase
    .from('event_templates')
    .insert(template)
    .select()
    .single();

  if (error) {
    console.error('EventService: Error creating template:', error);
    throw error;
  }

  return data;
}

// Utility functions
export async function getEventsInDateRange(
  organizationId: string, 
  startDate: string, 
  endDate: string
): Promise<Event[]> {
  console.log('EventService: Fetching events in date range:', startDate, 'to', endDate);
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('published', true)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) {
    console.error('EventService: Error fetching events in date range:', error);
    throw error;
  }

  return data || [];
}

export async function getFeaturedEvents(organizationId: string): Promise<Event[]> {
  console.log('EventService: Fetching featured events for organization:', organizationId);
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('published', true)
    .eq('featured', true)
    .order('date', { ascending: true });

  if (error) {
    console.error('EventService: Error fetching featured events:', error);
    throw error;
  }

  return data || [];
}
