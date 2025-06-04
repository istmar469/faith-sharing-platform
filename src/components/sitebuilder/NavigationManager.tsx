
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface NavigationManagerProps {
  organizationId: string | null;
  onChanges: () => void;
}

interface NavigationItem {
  id: string;
  label: string;
  url: string;
  target: '_self' | '_blank';
  order: number;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  is_homepage: boolean;
}

const SortableNavItem: React.FC<{
  item: NavigationItem;
  onUpdate: (id: string, updates: Partial<NavigationItem>) => void;
  onDelete: (id: string) => void;
}> = ({ item, onUpdate, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} className="mb-2">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          
          <div className="flex-1 grid grid-cols-3 gap-3">
            <Input
              value={item.label}
              onChange={(e) => onUpdate(item.id, { label: e.target.value })}
              placeholder="Link text"
            />
            <Input
              value={item.url}
              onChange={(e) => onUpdate(item.id, { url: e.target.value })}
              placeholder="URL or path"
            />
            <Select
              value={item.target}
              onValueChange={(value: '_self' | '_blank') => onUpdate(item.id, { target: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_self">Same window</SelectItem>
                <SelectItem value="_blank">New window</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {item.target === '_blank' && <ExternalLink className="h-4 w-4 text-gray-400" />}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(item.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const NavigationManager: React.FC<NavigationManagerProps> = ({ organizationId, onChanges }) => {
  const { toast } = useToast();
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [showInMobile, setShowInMobile] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (organizationId) {
      loadNavigationItems();
      loadPages();
    }
  }, [organizationId]);

  const loadNavigationItems = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('header_config')
        .eq('organization_id', organizationId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading navigation:', error);
        return;
      }

      if (data?.header_config?.navigation) {
        setItems(data.header_config.navigation.sort((a: NavigationItem, b: NavigationItem) => a.order - b.order));
      }
    } catch (error) {
      console.error('Error loading navigation:', error);
    }
  };

  const loadPages = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('id, title, slug, is_homepage')
        .eq('organization_id', organizationId)
        .eq('published', true)
        .order('title');

      if (error) {
        console.error('Error loading pages:', error);
        return;
      }

      setPages(data || []);
    } catch (error) {
      console.error('Error loading pages:', error);
    }
  };

  const addNavigationItem = () => {
    const newItem: NavigationItem = {
      id: `nav-${Date.now()}`,
      label: 'New Link',
      url: '/',
      target: '_self',
      order: items.length,
    };
    setItems([...items, newItem]);
    onChanges();
  };

  const addPageToNavigation = (page: Page) => {
    const newItem: NavigationItem = {
      id: `nav-${page.id}`,
      label: page.title,
      url: page.is_homepage ? '/' : `/${page.slug}`,
      target: '_self',
      order: items.length,
    };
    setItems([...items, newItem]);
    onChanges();
  };

  const updateNavigationItem = (id: string, updates: Partial<NavigationItem>) => {
    setItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
    onChanges();
  };

  const deleteNavigationItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    onChanges();
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        // Update order values
        return newItems.map((item, index) => ({ ...item, order: index }));
      });
      onChanges();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="show-mobile"
            checked={showInMobile}
            onCheckedChange={setShowInMobile}
          />
          <Label htmlFor="show-mobile">Show navigation on mobile</Label>
        </div>
        
        <Button onClick={addNavigationItem} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Link
        </Button>
      </div>

      {pages.length > 0 && (
        <div>
          <Label className="text-sm font-medium">Quick Add Pages:</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {pages
              .filter(page => !items.some(item => item.url === (page.is_homepage ? '/' : `/${page.slug}`)))
              .map(page => (
                <Button
                  key={page.id}
                  variant="outline"
                  size="sm"
                  onClick={() => addPageToNavigation(page)}
                >
                  {page.title}
                </Button>
              ))
            }
          </div>
        </div>
      )}

      <div>
        <Label className="text-sm font-medium mb-3 block">Navigation Items:</Label>
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No navigation items yet. Add some links to get started.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
              {items.map((item) => (
                <SortableNavItem
                  key={item.id}
                  item={item}
                  onUpdate={updateNavigationItem}
                  onDelete={deleteNavigationItem}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default NavigationManager;
