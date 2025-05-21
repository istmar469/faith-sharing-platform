
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { handleFieldChange } from './utils';

interface TypographyTabProps {
  form: UseFormReturn<any>;
  onFieldChange: () => void;
}

const TypographyTab: React.FC<TypographyTabProps> = ({ form, onFieldChange }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <FormField
          control={form.control}
          name="fontFamily"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Font Family</FormLabel>
              <Select 
                value={field.value} 
                onValueChange={(value) => {
                  field.onChange(value);
                  onFieldChange();
                }}
              >
                <FormControl>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="inter">Inter</SelectItem>
                  <SelectItem value="roboto">Roboto</SelectItem>
                  <SelectItem value="opensans">Open Sans</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="fontSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Size</FormLabel>
                <Select 
                  value={field.value} 
                  onValueChange={(value) => {
                    field.onChange(value);
                    onFieldChange();
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fontWeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Weight</FormLabel>
                <Select 
                  value={field.value} 
                  onValueChange={(value) => {
                    field.onChange(value);
                    onFieldChange();
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select weight" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
      </div>
      
      <FormField
        control={form.control}
        name="textColor"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Text Color</FormLabel>
            <div className="flex mt-1">
              <div 
                className="h-6 w-6 rounded border border-gray-200" 
                style={{ backgroundColor: field.value }}
              />
              <FormControl>
                <Input 
                  value={field.value} 
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    onFieldChange();
                  }}
                  className="h-6 flex-1 ml-2" 
                />
              </FormControl>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};

export default TypographyTab;
