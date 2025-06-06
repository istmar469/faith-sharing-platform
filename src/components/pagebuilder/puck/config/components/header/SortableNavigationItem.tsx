
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export interface NavigationPage {
  id: string;
  title: string;
  slug: string;
  is_homepage: boolean;
  published: boolean;
  show_in_navigation: boolean;
  order?: number;
}

interface SortableNavigationItemProps {
  page: NavigationPage;
  onToggleVisibility: (pageId: string, visible: boolean) => void;
  onEditPage: (pageId: string) => void;
}

const SortableNavigationItem: React.FC<SortableNavigationItemProps> = React.memo(({
  page,
  onToggleVisibility,
  onEditPage
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
    >
      <div className="flex items-center space-x-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <GripVertical size={16} />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">{page.title}</span>
            {page.is_homepage && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Home
              </span>
            )}
            {!page.published && (
              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                Draft
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">/{page.slug}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          checked={page.show_in_navigation}
          onCheckedChange={(checked) => onToggleVisibility(page.id, checked)}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onEditPage(page.id)}
        >
          <Edit3 size={14} />
        </Button>
      </div>
    </div>
  );
});

SortableNavigationItem.displayName = 'SortableNavigationItem';

export default SortableNavigationItem;
