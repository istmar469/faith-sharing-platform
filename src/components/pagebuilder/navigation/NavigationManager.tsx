
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, GripVertical, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { NavigationItem } from '../puck/config/components/EnhancedHeader';

interface NavigationManagerProps {
  organizationId: string;
  navigationItems: NavigationItem[];
  onNavigationChange: (items: NavigationItem[]) => void;
}

const NavigationManager: React.FC<NavigationManagerProps> = ({
  organizationId,
  navigationItems,
  onNavigationChange
}) => {
  const [items, setItems] = useState<NavigationItem[]>(navigationItems);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemHref, setNewItemHref] = useState('');

  useEffect(() => {
    setItems(navigationItems);
  }, [navigationItems]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setItems(newItems);
    onNavigationChange(newItems);
  };

  const addNavigationItem = () => {
    if (!newItemLabel.trim() || !newItemHref.trim()) return;

    const newItem: NavigationItem = {
      id: `nav-${Date.now()}`,
      label: newItemLabel,
      href: newItemHref,
      target: newItemHref.startsWith('http') ? '_blank' : '_self',
      isExternal: newItemHref.startsWith('http')
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    onNavigationChange(updatedItems);
    setNewItemLabel('');
    setNewItemHref('');
  };

  const removeNavigationItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    onNavigationChange(updatedItems);
  };

  const toggleItemVisibility = (id: string) => {
    const updatedItems = items.map(item => 
      item.id === id 
        ? { ...item, isVisible: !item.isVisible }
        : item
    );
    setItems(updatedItems);
    onNavigationChange(updatedItems);
  };

  const updateNavigationItem = (id: string, field: keyof NavigationItem, value: any) => {
    const updatedItems = items.map(item => 
      item.id === id 
        ? { ...item, [field]: value }
        : item
    );
    setItems(updatedItems);
    onNavigationChange(updatedItems);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Navigation Menu Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Item */}
        <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium">Add Navigation Item</h4>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Label"
              value={newItemLabel}
              onChange={(e) => setNewItemLabel(e.target.value)}
            />
            <Input
              placeholder="URL or path"
              value={newItemHref}
              onChange={(e) => setNewItemHref(e.target.value)}
            />
          </div>
          <Button onClick={addNavigationItem} size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Navigation Items List */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="navigation-items">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="p-3 bg-white border rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                            </div>
                            <Input
                              value={item.label}
                              onChange={(e) => updateNavigationItem(item.id, 'label', e.target.value)}
                              className="flex-1"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            {item.isExternal && <ExternalLink className="h-4 w-4 text-gray-400" />}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleItemVisibility(item.id)}
                            >
                              {item.isVisible !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeNavigationItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Input
                          value={item.href}
                          onChange={(e) => updateNavigationItem(item.id, 'href', e.target.value)}
                          placeholder="URL or path"
                          className="text-sm"
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {items.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No navigation items yet. Add your first item above.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NavigationManager;
