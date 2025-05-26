
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
  endType: 'never' | 'date' | 'count';
  endDate?: string;
  endCount?: number;
}

interface RecurrenceConfigProps {
  pattern: RecurrencePattern;
  onChange: (pattern: RecurrencePattern) => void;
}

const RecurrenceConfig: React.FC<RecurrenceConfigProps> = ({ pattern, onChange }) => {
  const updatePattern = (updates: Partial<RecurrencePattern>) => {
    onChange({ ...pattern, ...updates });
  };

  const toggleDayOfWeek = (day: number) => {
    const currentDays = pattern.daysOfWeek || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort();
    updatePattern({ daysOfWeek: newDays });
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Recurrence Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              value={pattern.frequency}
              onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'yearly') => 
                updatePattern({ frequency: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="interval">
              Repeat every {pattern.interval} {pattern.frequency === 'daily' ? 'day(s)' : 
                            pattern.frequency === 'weekly' ? 'week(s)' : 
                            pattern.frequency === 'monthly' ? 'month(s)' : 'year(s)'}
            </Label>
            <Input
              id="interval"
              type="number"
              min="1"
              max="99"
              value={pattern.interval}
              onChange={(e) => updatePattern({ interval: Math.max(1, parseInt(e.target.value) || 1) })}
            />
          </div>
        </div>

        {pattern.frequency === 'weekly' && (
          <div>
            <Label>Days of the week</Label>
            <div className="flex gap-2 mt-2">
              {dayNames.map((day, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <Checkbox
                    id={`day-${index}`}
                    checked={pattern.daysOfWeek?.includes(index) || false}
                    onCheckedChange={() => toggleDayOfWeek(index)}
                  />
                  <Label htmlFor={`day-${index}`} className="text-xs">
                    {day}
                  </Label>
                </div>
              ))}
            </div>
            {(!pattern.daysOfWeek || pattern.daysOfWeek.length === 0) && (
              <p className="text-xs text-amber-600 mt-1">
                Please select at least one day of the week
              </p>
            )}
          </div>
        )}

        <div>
          <Label>End recurrence</Label>
          <div className="space-y-3 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="never"
                checked={pattern.endType === 'never'}
                onCheckedChange={() => updatePattern({ endType: 'never' })}
              />
              <Label htmlFor="never">Never</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="date"
                checked={pattern.endType === 'date'}
                onCheckedChange={() => updatePattern({ endType: 'date' })}
              />
              <Label htmlFor="date">On date:</Label>
              {pattern.endType === 'date' && (
                <Input
                  type="date"
                  value={pattern.endDate || ''}
                  onChange={(e) => updatePattern({ endDate: e.target.value })}
                  className="w-auto"
                />
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="count"
                checked={pattern.endType === 'count'}
                onCheckedChange={() => updatePattern({ endType: 'count' })}
              />
              <Label htmlFor="count">After:</Label>
              {pattern.endType === 'count' && (
                <div className="flex items-center space-x-1">
                  <Input
                    type="number"
                    min="1"
                    max="999"
                    value={pattern.endCount || 1}
                    onChange={(e) => updatePattern({ endCount: parseInt(e.target.value) || 1 })}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-500">occurrences</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecurrenceConfig;
