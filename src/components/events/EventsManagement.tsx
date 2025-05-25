
import React, { useState } from 'react';
import { Plus, Filter, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useTenantContext } from '@/components/context/TenantContext';
import { useEvents } from '@/hooks/useEvents';
import { useEventCategories } from '@/hooks/useEventCategories';
import { Event, createEvent, updateEvent, deleteEvent } from '@/services/eventService';
import EventForm from './EventForm';
import EventsList from './EventsList';

const EventsManagement: React.FC = () => {
  const { organizationId } = useTenantContext();
  const { events, loading: eventsLoading, refetch } = useEvents(organizationId);
  const { categories } = useEventCategories(organizationId);
  const { toast } = useToast();
  
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setShowForm(true);
    setShowSuccess(false);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowForm(true);
    setShowSuccess(false);
  };

  const handleSubmitEvent = async (eventData: Event) => {
    if (!organizationId) return;

    setFormLoading(true);
    console.log('EventsManagement: Starting event save process', { eventTitle: eventData.title });
    
    try {
      if (editingEvent) {
        console.log('EventsManagement: Updating existing event', editingEvent.id);
        await updateEvent(editingEvent.id!, eventData);
        
        // Show success state with enhanced feedback
        setShowSuccess(true);
        toast({
          title: '✅ Event Updated Successfully!',
          description: `"${eventData.title}" has been updated and saved.`,
          duration: 5000,
        });
        
        console.log('EventsManagement: Event updated successfully');
      } else {
        console.log('EventsManagement: Creating new event');
        const newEvent = await createEvent(eventData);
        
        // Show success state with enhanced feedback
        setShowSuccess(true);
        toast({
          title: '🎉 Event Created Successfully!',
          description: `"${eventData.title}" has been created and saved. You can now view it in your events list.`,
          duration: 5000,
        });
        
        console.log('EventsManagement: Event created successfully', newEvent.id);
      }
      
      // Wait 2 seconds to show success state before closing
      setTimeout(() => {
        setShowForm(false);
        setEditingEvent(null);
        setShowSuccess(false);
      }, 2000);
      
      // Refresh the events list
      await refetch();
      console.log('EventsManagement: Events list refreshed');
      
    } catch (error) {
      console.error('EventsManagement: Error saving event:', error);
      setShowSuccess(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: '❌ Error Saving Event',
        description: `Failed to save "${eventData.title}". ${errorMessage}. Please try again.`,
        variant: 'destructive',
        duration: 7000,
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await deleteEvent(eventId);
      toast({
        title: '🗑️ Event Deleted',
        description: 'Event has been successfully deleted.',
        duration: 4000,
      });
      await refetch();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete event. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingEvent(null);
    setShowSuccess(false);
  };

  if (showForm) {
    return (
      <div className="relative">
        {/* Success Overlay */}
        {showSuccess && (
          <div className="fixed inset-0 bg-green-50 bg-opacity-90 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-green-200 text-center animate-scale-in">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4 animate-bounce" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                {editingEvent ? 'Event Updated!' : 'Event Created!'}
              </h3>
              <p className="text-green-600">
                Redirecting back to events list...
              </p>
            </div>
          </div>
        )}
        
        <EventForm
          event={editingEvent || undefined}
          categories={categories}
          onSubmit={handleSubmitEvent}
          onCancel={handleCancelForm}
          loading={formLoading}
          showSuccess={showSuccess}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Events Management</h2>
        <Button onClick={handleCreateEvent}>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name.toLowerCase()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {eventsLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading events...</p>
        </div>
      ) : (
        <EventsList
          events={filteredEvents}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
          showActions={true}
        />
      )}
    </div>
  );
};

export default EventsManagement;
