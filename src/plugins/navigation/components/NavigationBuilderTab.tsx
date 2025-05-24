
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NavigationSettings, NavigationItem } from '../NavigationPlugin';
import NavigationItemEditor from './NavigationItemEditor';
import { toast } from 'sonner';

interface NavigationBuilderTabProps {
  settings: NavigationSettings;
  onUpdateSettings: (settings: NavigationSettings) => void;
  draggedItem: string | null;
  onSetDraggedItem: (itemId: string | null) => void;
}

const NavigationBuilderTab: React.FC<NavigationBuilderTabProps> = ({
  settings,
  onUpdateSettings,
  draggedItem,
  onSetDraggedItem
}) => {
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    onSetDraggedItem(itemId);
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

      onUpdateSettings({ ...settings, items: newItems });
      toast.success('Navigation order updated');
    }
    
    onSetDraggedItem(null);
  };

  const addNavigationItem = () => {
    const newItem: NavigationItem = {
      id: `nav-${Date.now()}`,
      label: 'New Item',
      path: '/new-item',
      order: settings.items.length + 1
    };
    
    onUpdateSettings({
      ...settings,
      items: [...settings.items, newItem]
    });
    toast.success('Navigation item added');
  };

  const updateNavigationItem = (id: string, updates: Partial<NavigationItem>) => {
    const newItems = settings.items.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    onUpdateSettings({ ...settings, items: newItems });
  };

  const deleteNavigationItem = (id: string) => {
    const newItems = settings.items.filter(item => item.id !== id);
    onUpdateSettings({ ...settings, items: newItems });
    toast.success('Navigation item deleted');
  };

  return (
    <div className="space-y-4">
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
            <NavigationItemEditor
              key={item.id}
              item={item}
              onUpdate={updateNavigationItem}
              onDelete={deleteNavigationItem}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isDragged={draggedItem === item.id}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default NavigationBuilderTab;
