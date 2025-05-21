
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

interface SpacingTabProps {
  form: UseFormReturn<any>;
  onFieldChange: () => void;
  selectedElementComponent: string;
}

const SpacingTab: React.FC<SpacingTabProps> = ({ form, onFieldChange, selectedElementComponent }) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="padding"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Padding</FormLabel>
            <Select 
              value={field.value} 
              onValueChange={(value) => {
                field.onChange(value);
                onFieldChange();
              }}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select padding" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      {/* Container-specific width control */}
      {selectedElementComponent === "Container" && (
        <FormField
          control={form.control}
          name="width"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Container Width</FormLabel>
              <Select 
                value={field.value} 
                onValueChange={(value) => {
                  field.onChange(value);
                  onFieldChange();
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select width" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="full">Full Width</SelectItem>
                  <SelectItem value="wide">Wide</SelectItem>
                  <SelectItem value="narrow">Narrow</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default SpacingTab;
