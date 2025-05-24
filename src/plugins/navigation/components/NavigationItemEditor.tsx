
import React from 'react';
import { GripVertical, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { NavigationItem } from '../NavigationPlugin';

interface NavigationItemEditorProps {
  item: NavigationItem;
  onUpdate: (id: string, updates: Partial<NavigationItem>) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, itemId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetId: string) => void;
  isDragged?: boolean;
}

const NavigationItemEditor: React.FC<NavigationItemEditorProps> = ({
  item,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isDragged = false
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, item.id)}
      className={`flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-move ${
        isDragged ? 'opacity-50' : ''
      }`}
    >
      <GripVertical className="h-4 w-4 text-gray-400" />
      
      <div className="flex-1 space-y-2">
        <div className="flex gap-2">
          <Input
            value={item.label}
            onChange={(e) => onUpdate(item.id, { label: e.target.value })}
            placeholder="Label"
            className="flex-1"
          />
          <Input
            value={item.path}
            onChange={(e) => onUpdate(item.id, { path: e.target.value })}
            placeholder="Path"
            className="flex-1"
          />
        </div>
        
        <div className="flex items-center gap-2">
          {item.children && item.children.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {item.children.length} sub-items
            </Badge>
          )}
          {item.isExternal && (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              External
            </Badge>
          )}
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(item.id)}
        className="text-red-500 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default NavigationItemEditor;
