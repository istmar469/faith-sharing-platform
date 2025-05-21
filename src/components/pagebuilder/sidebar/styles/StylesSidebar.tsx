
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form } from "@/components/ui/form";
import { usePageBuilder } from '../../context/PageBuilderContext';
import { predefinedGradients, handleFieldChange } from './utils';
import TypographyTab from './TypographyTab';
import BackgroundTab from './BackgroundTab';
import SpacingTab from './SpacingTab';

const StylesSidebar: React.FC = () => {
  const { selectedElementId, pageElements, updateElement } = usePageBuilder();
  const selectedElement = pageElements.find(element => element.id === selectedElementId);
  const [activeTab, setActiveTab] = useState<string>("typography");

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
  const onFieldChange = () => {
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
        <form onChange={onFieldChange} className="space-y-4">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="typography" className="flex-1">Typography</TabsTrigger>
              <TabsTrigger value="background" className="flex-1">Background</TabsTrigger>
              <TabsTrigger value="spacing" className="flex-1">Spacing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="typography">
              <TypographyTab 
                form={form} 
                onFieldChange={onFieldChange}
              />
            </TabsContent>
            
            <TabsContent value="background">
              <BackgroundTab 
                form={form} 
                onFieldChange={onFieldChange}
              />
            </TabsContent>
            
            <TabsContent value="spacing">
              <SpacingTab 
                form={form} 
                onFieldChange={onFieldChange}
                selectedElementComponent={selectedElement.component}
              />
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
};

export default StylesSidebar;
