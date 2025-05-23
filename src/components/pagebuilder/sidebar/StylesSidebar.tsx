
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form } from "@/components/ui/form";
import { usePageBuilder } from '../context/PageBuilderContext';

const StylesSidebar: React.FC = () => {
  const { selectedElementId, pageElements, updateElement } = usePageBuilder();
  
  // For EditorJS format, we don't have selectable elements in the same way
  // We would need to work with blocks if we wanted to style individual blocks
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
      backgroundGradient: '',
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

  // Show message about EditorJS styling
  const blockCount = pageElements?.blocks?.length || 0;

  return (
    <div className="p-3 sm:p-4 mt-0 overflow-auto site-styles-sidebar">
      <div className="text-center text-gray-400 p-4">
        <p>Styles are managed within the Editor</p>
        <p className="text-sm mt-2">Use the Editor toolbar to customize block styles</p>
        {blockCount > 0 && (
          <p className="text-xs mt-2 text-gray-500">
            Current page has {blockCount} content block{blockCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
};

export default StylesSidebar;
