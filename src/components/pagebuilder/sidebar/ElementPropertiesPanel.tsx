import React from 'react';
import { usePageBuilder } from '../context/PageBuilderContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

const ElementPropertiesPanel: React.FC = () => {
  const { selectedElementId, pageElements, updateElement, removeElement } = usePageBuilder();
  
  // For EditorJS format, we don't have selectable elements in the same way
  // This component is mainly for legacy support
  const selectedElement = null;

  if (!selectedElement) {
    return (
      <div className="p-4 text-center text-gray-400">
        <p>Element properties are managed within the Editor</p>
        <p className="text-sm mt-2">Use the Editor toolbar to customize blocks</p>
      </div>
    );
  }

  // Legacy code kept for compatibility but won't be reached with EditorJS
  const handlePropertyChange = (key: string, value: any) => {
    updateElement(selectedElementId!, {
      props: {
        ...selectedElement.props,
        [key]: value
      }
    });
  };

  const handleDelete = () => {
    if (selectedElementId) {
      removeElement(selectedElementId);
    }
  };

  const renderPropertyControls = () => {
    const { component, props = {} } = selectedElement;

    switch (component) {
      case 'Heading':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="heading-text">Text</Label>
              <Input
                id="heading-text"
                value={props.text || ''}
                onChange={(e) => handlePropertyChange('text', e.target.value)}
                placeholder="Enter heading text"
              />
            </div>
            <div>
              <Label htmlFor="heading-size">Size</Label>
              <Select value={props.size || 'xl'} onValueChange={(value) => handlePropertyChange('size', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">Small</SelectItem>
                  <SelectItem value="md">Medium</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                  <SelectItem value="xl">Extra Large</SelectItem>
                  <SelectItem value="2xl">2X Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'Paragraph':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="paragraph-text">Text</Label>
              <Textarea
                id="paragraph-text"
                value={props.text || ''}
                onChange={(e) => handlePropertyChange('text', e.target.value)}
                placeholder="Enter paragraph text"
                rows={4}
              />
            </div>
          </div>
        );

      case 'Button':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="button-text">Button Text</Label>
              <Input
                id="button-text"
                value={props.text || ''}
                onChange={(e) => handlePropertyChange('text', e.target.value)}
                placeholder="Click Me"
              />
            </div>
            <div>
              <Label htmlFor="button-action">Link/Action</Label>
              <Input
                id="button-action"
                value={props.action || ''}
                onChange={(e) => handlePropertyChange('action', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="button-variant">Style</Label>
              <Select value={props.variant || 'default'} onValueChange={(value) => handlePropertyChange('variant', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                  <SelectItem value="ghost">Ghost</SelectItem>
                  <SelectItem value="destructive">Destructive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="button-size">Size</Label>
              <Select value={props.size || 'default'} onValueChange={(value) => handlePropertyChange('size', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">Small</SelectItem>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'Image':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="image-src">Image URL</Label>
              <Input
                id="image-src"
                value={props.src || ''}
                onChange={(e) => handlePropertyChange('src', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label htmlFor="image-alt">Alt Text</Label>
              <Input
                id="image-alt"
                value={props.alt || ''}
                onChange={(e) => handlePropertyChange('alt', e.target.value)}
                placeholder="Image description"
              />
            </div>
            <div>
              <Label htmlFor="image-width">Width</Label>
              <Select value={props.width || 'full'} onValueChange={(value) => handlePropertyChange('width', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="full">Full Width</SelectItem>
                  <SelectItem value="1/2">Half Width</SelectItem>
                  <SelectItem value="1/3">One Third</SelectItem>
                  <SelectItem value="2/3">Two Thirds</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'Container':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="container-width">Width</Label>
              <Select value={props.width || 'full'} onValueChange={(value) => handlePropertyChange('width', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Width</SelectItem>
                  <SelectItem value="container">Container</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                  <SelectItem value="md">Medium</SelectItem>
                  <SelectItem value="sm">Small</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="container-padding">Padding</Label>
              <Select value={props.padding || 'md'} onValueChange={(value) => handlePropertyChange('padding', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="sm">Small</SelectItem>
                  <SelectItem value="md">Medium</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                  <SelectItem value="xl">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'Grid':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="grid-columns">Columns</Label>
              <Select value={props.columns?.toString() || '2'} onValueChange={(value) => handlePropertyChange('columns', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Column</SelectItem>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                  <SelectItem value="4">4 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="grid-gap">Gap</Label>
              <Select value={props.gap || 'md'} onValueChange={(value) => handlePropertyChange('gap', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="sm">Small</SelectItem>
                  <SelectItem value="md">Medium</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                  <SelectItem value="xl">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-500 p-4">
            <p>No properties available for this element type.</p>
          </div>
        );
    }
  };
  
  return (
    <div className="p-4 space-y-6">
      <div className="text-center text-gray-500 p-4">
        <p>No properties available for this element type.</p>
      </div>
      
      <div className="pt-4 border-t border-gray-200">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          className="w-full"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Element
        </Button>
      </div>
    </div>
  );
};

export default ElementPropertiesPanel;
