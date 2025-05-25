
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader } from 'lucide-react';
import { Event, EventCategory } from '@/services/eventService';
import { useTenantContext } from '@/components/context/TenantContext';

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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organizationId) {
      console.error('EventForm: No organization ID available');
      return;
    }

    setIsSubmitting(true);
    console.log('EventForm: Form submitted', { title: formData.title });

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
      registration_required: formData.registration_required!,
      published: formData.published!,
      featured: formData.featured!
    };

    try {
      await onSubmit(eventData);
      console.log('EventForm: Form submission completed successfully');
    } catch (error) {
      console.error('EventForm: Form submission failed:', error);
      setIsSubmitting(false);
    }
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                disabled={loading}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="end_time">End Time *</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name.toLowerCase()}>
                      {category.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="color">Event Color</Label>
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="max_attendees">Max Attendees</Label>
              <Input
                id="max_attendees"
                type="number"
                min="1"
                value={formData.max_attendees || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  max_attendees: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="registration_deadline">Registration Deadline</Label>
              <Input
                id="registration_deadline"
                type="date"
                value={formData.registration_deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, registration_deadline: e.target.value }))}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="registration_required"
                checked={formData.registration_required}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, registration_required: checked }))}
                disabled={loading}
              />
              <Label htmlFor="registration_required">Require Registration</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_recurring"
                checked={formData.is_recurring}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_recurring: checked }))}
                disabled={loading}
              />
              <Label htmlFor="is_recurring">Recurring Event</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                disabled={loading}
              />
              <Label htmlFor="published">Publish Event</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                disabled={loading}
              />
              <Label htmlFor="featured">Featured Event</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
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
        </form>
      </CardContent>
    </Card>
  );
};

export default EventForm;
