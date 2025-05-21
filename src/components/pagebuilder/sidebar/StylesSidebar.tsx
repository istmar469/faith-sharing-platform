
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette, Gradient, Image as ImageIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { usePageBuilder } from '../context/PageBuilderContext';
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";

const StylesSidebar: React.FC = () => {
  const { selectedElementId, pageElements, updateElement } = usePageBuilder();
  const selectedElement = pageElements.find(element => element.id === selectedElementId);
  const [activeTab, setActiveTab] = useState<string>("typography");

  // Generate a list of predefined gradients
  const predefinedGradients = [
    'linear-gradient(90deg, #f6d365 0%, #fda085 100%)',
    'linear-gradient(90deg, #a1c4fd 0%, #c2e9fb 100%)',
    'linear-gradient(90deg, #d4fc79 0%, #96e6a1 100%)',
    'linear-gradient(90deg, #84fab0 0%, #8fd3f4 100%)',
    'linear-gradient(90deg, #fccb90 0%, #d57eeb 100%)',
    'linear-gradient(90deg, #e0c3fc 0%, #8ec5fc 100%)'
  ];

  // Initialize form with current element values or defaults
  const form = useForm({
    defaultValues: {
      // Typography
      fontFamily: selectedElement?.props?.fontFamily || 'inter',
      fontSize: selectedElement?.props?.fontSize || 'md',
      fontWeight: selectedElement?.props?.fontWeight || 'normal',
      
      // Colors
      textColor: selectedElement?.props?.textColor || '#1a202c',
      backgroundColor: selectedElement?.props?.backgroundColor || '#ffffff',
      
      // Background
      backgroundType: selectedElement?.props?.backgroundType || 'solid',
      backgroundGradient: selectedElement?.props?.backgroundGradient || predefinedGradients[0],
      backgroundImage: selectedElement?.props?.backgroundImage || '',
      
      // Spacing
      padding: selectedElement?.props?.padding || 'medium',
      margin: selectedElement?.props?.margin || '0',
      
      // Container specific
      width: selectedElement?.props?.width || 'full'
    }
  });

  const onSubmit = (values: any) => {
    if (selectedElementId) {
      updateElement(selectedElementId, {
        props: {
          ...selectedElement?.props,
          ...values
        }
      });
    }
  };

  // Handle field change and immediately submit the form
  const handleFieldChange = () => {
    form.handleSubmit(onSubmit)();
  };

  // Only render form if an element is selected
  if (!selectedElement) {
    return (
      <div className="p-4 text-center text-gray-400">
        Select an element to edit its styles
      </div>
    );
  }

  return (
    <div className="p-4 mt-0 overflow-auto">
      <Form {...form}>
        <form onChange={handleFieldChange} className="space-y-4">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="typography" className="flex-1">Typography</TabsTrigger>
              <TabsTrigger value="background" className="flex-1">Background</TabsTrigger>
              <TabsTrigger value="spacing" className="flex-1">Spacing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="typography" className="space-y-4">
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
                          handleFieldChange();
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
                            handleFieldChange();
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
                            handleFieldChange();
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
                            handleFieldChange();
                          }}
                          className="h-6 flex-1 ml-2" 
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
            </TabsContent>
            
            <TabsContent value="background" className="space-y-4">
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
                        handleFieldChange();
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
                            <Gradient className="w-4 h-4 mr-2" />
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
                              handleFieldChange();
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
                              handleFieldChange();
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
                            handleFieldChange();
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
                                handleFieldChange();
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              )}
            </TabsContent>
            
            <TabsContent value="spacing" className="space-y-4">
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
                        handleFieldChange();
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
              {selectedElement.component === "Container" && (
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
                          handleFieldChange();
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
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
};

export default StylesSidebar;
