
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Event } from '@/services/eventService';
import RecurrenceConfig, { RecurrencePattern } from './RecurrenceConfig';

interface EventFormSwitchesProps {
  formData: Partial<Event>;
  onFormDataChange: (updates: Partial<Event>) => void;
  recurrencePattern: RecurrencePattern;
  onRecurrencePatternChange: (pattern: RecurrencePattern) => void;
  formErrors: Record<string, string>;
  loading: boolean;
}

const EventFormSwitches: React.FC<EventFormSwitchesProps> = ({
  formData,
  onFormDataChange,
  recurrencePattern,
  onRecurrencePatternChange,
  formErrors,
  loading
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="registration_required"
          checked={formData.registration_required}
          onCheckedChange={(checked) => onFormDataChange({ registration_required: checked })}
          disabled={loading}
        />
        <Label htmlFor="registration_required">Require Registration</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_recurring"
          checked={formData.is_recurring}
          onCheckedChange={(checked) => {
            onFormDataChange({ is_recurring: checked });
            // Reset recurrence pattern when toggling off
            if (!checked) {
              onRecurrencePatternChange({
                frequency: 'weekly',
                interval: 1,
                daysOfWeek: [new Date().getDay()],
                endType: 'never'
              });
            }
          }}
          disabled={loading}
        />
        <Label htmlFor="is_recurring">Recurring Event</Label>
      </div>

      {formData.is_recurring && (
        <div className="space-y-4">
          <RecurrenceConfig
            pattern={recurrencePattern}
            onChange={onRecurrencePatternChange}
          />
          {formErrors.recurrence && (
            <p className="text-sm text-red-600">{formErrors.recurrence}</p>
          )}
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Switch
          id="published"
          checked={formData.published}
          onCheckedChange={(checked) => onFormDataChange({ published: checked })}
          disabled={loading}
        />
        <Label htmlFor="published">Publish Event</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="featured"
          checked={formData.featured}
          onCheckedChange={(checked) => onFormDataChange({ featured: checked })}
          disabled={loading}
        />
        <Label htmlFor="featured">Featured Event</Label>
      </div>
    </div>
  );
};

export default EventFormSwitches;
