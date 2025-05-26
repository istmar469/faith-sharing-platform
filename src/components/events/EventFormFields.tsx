
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Event, EventCategory } from '@/services/eventService';

interface EventFormFieldsProps {
  formData: Partial<Event>;
  onFormDataChange: (updates: Partial<Event>) => void;
  categories: EventCategory[];
  formErrors: Record<string, string>;
  loading: boolean;
}

const EventFormFields: React.FC<EventFormFieldsProps> = ({
  formData,
  onFormDataChange,
  categories,
  formErrors,
  loading
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <Label htmlFor="title">Event Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => onFormDataChange({ title: e.target.value })}
          required
          disabled={loading}
          className={formErrors.title ? 'border-red-500' : ''}
        />
        {formErrors.title && (
          <p className="text-sm text-red-600 mt-1">{formErrors.title}</p>
        )}
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onFormDataChange({ description: e.target.value })}
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
          onChange={(e) => onFormDataChange({ date: e.target.value })}
          required
          disabled={loading}
          className={formErrors.date ? 'border-red-500' : ''}
        />
        {formErrors.date && (
          <p className="text-sm text-red-600 mt-1">{formErrors.date}</p>
        )}
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => onFormDataChange({ location: e.target.value })}
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="start_time">Start Time *</Label>
        <Input
          id="start_time"
          type="time"
          value={formData.start_time}
          onChange={(e) => onFormDataChange({ start_time: e.target.value })}
          required
          disabled={loading}
          className={formErrors.start_time ? 'border-red-500' : ''}
        />
        {formErrors.start_time && (
          <p className="text-sm text-red-600 mt-1">{formErrors.start_time}</p>
        )}
      </div>

      <div>
        <Label htmlFor="end_time">End Time *</Label>
        <Input
          id="end_time"
          type="time"
          value={formData.end_time}
          onChange={(e) => onFormDataChange({ end_time: e.target.value })}
          required
          disabled={loading}
          className={formErrors.end_time ? 'border-red-500' : ''}
        />
        {formErrors.end_time && (
          <p className="text-sm text-red-600 mt-1">{formErrors.end_time}</p>
        )}
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => onFormDataChange({ category: value })}
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
          onChange={(e) => onFormDataChange({ color: e.target.value })}
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
          onChange={(e) => onFormDataChange({ 
            max_attendees: e.target.value ? parseInt(e.target.value) : undefined 
          })}
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="registration_deadline">Registration Deadline</Label>
        <Input
          id="registration_deadline"
          type="date"
          value={formData.registration_deadline}
          onChange={(e) => onFormDataChange({ registration_deadline: e.target.value })}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default EventFormFields;
