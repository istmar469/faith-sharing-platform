
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
  const { pageElements } = usePageBuilder();
  
  // For EditorJS format, we don't have selectable elements in the same way
  const selectedElement = null;
  const [activeTab, setActiveTab] = useState<string>("typography");

  // Initialize form with default values
  const form = useForm({
    defaultValues: {
      fontFamily: 'inter',
      fontSize: 'md',
      fontWeight: 'normal',
      textColor: '#1a202c',
      backgroundColor: '#ffffff',
      backgroundType: 'solid',
      backgroundGradient: predefinedGradients[0],
      backgroundImage: '',
      padding: 'medium',
      margin: '0',
      width: 'full'
    }
  });

  const onSubmit = (values: any) => {
    // No-op for EditorJS integration
  };

  const onFieldChange = () => {
    // No-op for EditorJS integration
  };

  // Only render message if no element is selected
  if (!selectedElement) {
    return (
      <div className="p-4 text-center text-gray-400">
        <p>Styles are managed within the Editor</p>
        <p className="text-sm mt-2">Use the Editor toolbar to customize block styles</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 mt-0 overflow-auto site-styles-sidebar">
      <Form {...form}>
        <form onChange={onFieldChange} className="space-y-3 sm:space-y-4">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="typography" className="flex-1 text-xs sm:text-sm">Typography</TabsTrigger>
              <TabsTrigger value="background" className="flex-1 text-xs sm:text-sm">Background</TabsTrigger>
              <TabsTrigger value="spacing" className="flex-1 text-xs sm:text-sm">Spacing</TabsTrigger>
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
                selectedElementComponent="default"
              />
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
};

export default StylesSidebar;
