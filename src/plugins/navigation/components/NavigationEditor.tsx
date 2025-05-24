
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigation } from 'lucide-react';
import { NavigationSettings } from '../NavigationPlugin';
import { usePluginSystemContext } from '@/components/dashboard/PluginSystemProvider';
import NavigationBuilderTab from './NavigationBuilderTab';
import NavigationSettingsTab from './NavigationSettingsTab';
import NavigationPreviewTab from './NavigationPreviewTab';

interface NavigationEditorProps {
  organizationId: string;
}

const NavigationEditor: React.FC<NavigationEditorProps> = ({ organizationId }) => {
  const { plugins } = usePluginSystemContext();
  const [settings, setSettings] = useState<NavigationSettings>({
    items: [],
    style: 'horizontal',
    mobileBreakpoint: 768,
    showLogo: true,
    logoText: 'My Site'
  });
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Get the navigation plugin instance
  const navigationPlugin = plugins.find(p => p.config.id === 'navigation-manager');

  useEffect(() => {
    if (navigationPlugin) {
      loadSettings();
    }
  }, [navigationPlugin]);

  const loadSettings = () => {
    // This would load from the plugin's state manager
    const mockSettings: NavigationSettings = {
      items: [
        { id: '1', label: 'Home', path: '/', order: 1 },
        { id: '2', label: 'About', path: '/about', order: 2 },
        { id: '3', label: 'Services', path: '/services', order: 3, children: [
          { id: '3-1', label: 'Web Design', path: '/services/web-design', order: 1 },
          { id: '3-2', label: 'Development', path: '/services/development', order: 2 }
        ]},
        { id: '4', label: 'Contact', path: '/contact', order: 4 }
      ],
      style: 'horizontal',
      mobileBreakpoint: 768,
      showLogo: true,
      logoText: 'My Site'
    };
    setSettings(mockSettings);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          <CardTitle>Navigation Manager</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="builder" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="builder">Builder</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="builder">
            <NavigationBuilderTab
              settings={settings}
              onUpdateSettings={setSettings}
              draggedItem={draggedItem}
              onSetDraggedItem={setDraggedItem}
            />
          </TabsContent>
          
          <TabsContent value="settings">
            <NavigationSettingsTab
              settings={settings}
              onUpdateSettings={setSettings}
            />
          </TabsContent>
          
          <TabsContent value="preview">
            <NavigationPreviewTab
              settings={settings}
              previewMode={previewMode}
              onSetPreviewMode={setPreviewMode}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NavigationEditor;
