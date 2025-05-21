
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Palette, PaintBucket, Image as ImageIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { predefinedGradients } from './utils';

interface BackgroundTabProps {
  form: UseFormReturn<any>;
  onFieldChange: () => void;
}

const BackgroundTab: React.FC<BackgroundTabProps> = ({ form, onFieldChange }) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="backgroundType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Background Type</FormLabel>
            <Select 
              value={field.value} 
              onValueChange={(value) => {
                field.onChange(value);
                onFieldChange();
              }}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="solid">
                  <div className="flex items-center">
                    <Palette className="w-4 h-4 mr-2" />
                    Solid Color
                  </div>
                </SelectItem>
                <SelectItem value="gradient">
                  <div className="flex items-center">
                    <PaintBucket className="w-4 h-4 mr-2" />
                    Gradient
                  </div>
                </SelectItem>
                <SelectItem value="image">
                  <div className="flex items-center">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Image
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
      
      {form.watch("backgroundType") === "solid" && (
        <FormField
          control={form.control}
          name="backgroundColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Background Color</FormLabel>
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
      )}
      
      {form.watch("backgroundType") === "gradient" && (
        <FormField
          control={form.control}
          name="backgroundGradient"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Gradient</FormLabel>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {predefinedGradients.map((gradient, index) => (
                  <div
                    key={index}
                    className={`h-12 rounded cursor-pointer border-2 ${
                      field.value === gradient ? 'border-blue-500' : 'border-transparent'
                    }`}
                    style={{ background: gradient }}
                    onClick={() => {
                      field.onChange(gradient);
                      onFieldChange();
                    }}
                  />
                ))}
              </div>
            </FormItem>
          )}
        />
      )}
      
      {form.watch("backgroundType") === "image" && (
        <FormField
          control={form.control}
          name="backgroundImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Image URL</FormLabel>
              <FormControl>
                <Input 
                  value={field.value} 
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    onFieldChange();
                  }}
                  placeholder="Enter image URL" 
                />
              </FormControl>
              <div className="mt-2">
                <div className="text-xs text-gray-500 mb-1">Sample images:</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
                    'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07',
                    'https://images.unsplash.com/photo-1433086966358-54859d0ed716',
                    'https://images.unsplash.com/photo-1493397212122-2b85dda8106b'
                  ].map((url, i) => (
                    <div
                      key={i}
                      className={`h-16 rounded cursor-pointer bg-cover bg-center border ${
                        field.value === url ? 'border-blue-500' : 'border-gray-200'
                      }`}
                      style={{ backgroundImage: `url(${url})` }}
                      onClick={() => {
                        field.onChange(url);
                        onFieldChange();
                      }}
                    />
                  ))}
                </div>
              </div>
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default BackgroundTab;
