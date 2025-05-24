
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Navigation, 
  GripVertical, 
  Plus, 
  Trash2, 
  ExternalLink,
  Monitor,
  Smartphone,
  Settings
} from 'lucide-react';
import { NavigationItem, NavigationSettings } from '../NavigationPlugin';
import { usePluginSystemContext } from '@/components/dashboard/PluginSystemProvider';
import { toast } from 'sonner';

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
      // Get settings from plugin state (this would be implemented in the plugin registry)
      // For now, we'll use mock data
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

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const newItems = [...settings.items];
    const draggedIndex = newItems.findIndex(item => item.id === draggedItem);
    const targetIndex = newItems.findIndex(item => item.id === targetId);

    if (draggedIndex > -1 && targetIndex > -1) {
      const [draggedElement] = newItems.splice(draggedIndex, 1);
      newItems.splice(targetIndex, 0, draggedElement);
      
      // Update order numbers
      newItems.forEach((item, index) => {
        item.order = index + 1;
      });

      setSettings({ ...settings, items: newItems });
      toast.success('Navigation order updated');
    }
    
    setDraggedItem(null);
  };

  const addNavigationItem = () => {
    const newItem: NavigationItem = {
      id: `nav-${Date.now()}`,
      label: 'New Item',
      path: '/new-item',
      order: settings.items.length + 1
    };
    
    setSettings({
      ...settings,
      items: [...settings.items, newItem]
    });
    toast.success('Navigation item added');
  };

  const updateNavigationItem = (id: string, updates: Partial<NavigationItem>) => {
    const newItems = settings.items.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    setSettings({ ...settings, items: newItems });
  };

  const deleteNavigationItem = (id: string) => {
    const newItems = settings.items.filter(item => item.id !== id);
    setSettings({ ...settings, items: newItems });
    toast.success('Navigation item deleted');
  };

  const renderNavigationPreview = () => {
    const isMobile = previewMode === 'mobile';
    
    return (
      <div className={`border rounded-lg p-4 ${isMobile ? 'w-80' : 'w-full'}`}>
        <div className={`flex items-center ${settings.style === 'horizontal' && !isMobile ? 'justify-between' : 'flex-col space-y-4'}`}>
          {settings.showLogo && (
            <div className="font-bold text-lg">
              {settings.logoText}
            </div>
          )}
          
          <nav className={isMobile ? 'w-full' : ''}>
            <ul className={`flex ${settings.style === 'horizontal' && !isMobile ? 'space-x-6' : 'flex-col space-y-2'}`}>
              {settings.items.map((item) => (
                <li key={item.id} className="relative group">
                  <a 
                    href={item.path}
                    className="hover:text-blue-600 transition-colors flex items-center gap-1"
                    onClick={(e) => e.preventDefault()}
                  >
                    {item.label}
                    {item.isExternal && <ExternalLink className="h-3 w-3" />}
                  </a>
                  {item.children && item.children.length > 0 && (
                    <ul className={`${isMobile ? 'ml-4 mt-2' : 'absolute top-full left-0 hidden group-hover:block bg-white border rounded shadow-lg py-2 min-w-48'}`}>
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <a 
                            href={child.path}
                            className="block px-4 py-2 hover:bg-gray-100 transition-colors"
                            onClick={(e) => e.preventDefault()}
                          >
                            {child.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    );
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
          
          <TabsContent value="builder" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Navigation Items</h3>
              <Button onClick={addNavigationItem} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
            
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {settings.items.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, item.id)}
                    className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-move"
                  >
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={item.label}
                          onChange={(e) => updateNavigationItem(item.id, { label: e.target.value })}
                          placeholder="Label"
                          className="flex-1"
                        />
                        <Input
                          value={item.path}
                          onChange={(e) => updateNavigationItem(item.id, { path: e.target.value })}
                          placeholder="Path"
                          className="flex-1"
                        />
                      </div>
                      
                      {item.children && item.children.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {item.children.length} sub-items
                        </Badge>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNavigationItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-logo">Show Logo</Label>
                <Switch
                  id="show-logo"
                  checked={settings.showLogo}
                  onCheckedChange={(checked) => setSettings({ ...settings, showLogo: checked })}
                />
              </div>
              
              {settings.showLogo && (
                <div className="space-y-2">
                  <Label htmlFor="logo-text">Logo Text</Label>
                  <Input
                    id="logo-text"
                    value={settings.logoText || ''}
                    onChange={(e) => setSettings({ ...settings, logoText: e.target.value })}
                    placeholder="Enter logo text"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Navigation Style</Label>
                <div className="flex gap-2">
                  <Button
                    variant={settings.style === 'horizontal' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSettings({ ...settings, style: 'horizontal' })}
                  >
                    Horizontal
                  </Button>
                  <Button
                    variant={settings.style === 'vertical' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSettings({ ...settings, style: 'vertical' })}
                  >
                    Vertical
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mobile-breakpoint">Mobile Breakpoint (px)</Label>
                <Input
                  id="mobile-breakpoint"
                  type="number"
                  value={settings.mobileBreakpoint}
                  onChange={(e) => setSettings({ ...settings, mobileBreakpoint: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Navigation Preview</h3>
              <div className="flex gap-2">
                <Button
                  variant={previewMode === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('desktop')}
                >
                  <Monitor className="h-4 w-4 mr-1" />
                  Desktop
                </Button>
                <Button
                  variant={previewMode === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('mobile')}
                >
                  <Smartphone className="h-4 w-4 mr-1" />
                  Mobile
                </Button>
              </div>
            </div>
            
            <div className="border-2 border-dashed border-gray-200 p-4 rounded-lg">
              {renderNavigationPreview()}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NavigationEditor;
