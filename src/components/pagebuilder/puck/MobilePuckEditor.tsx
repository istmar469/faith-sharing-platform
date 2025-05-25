
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Save, Loader2, Plus, Grid, Type, Image as ImageIcon } from 'lucide-react';
import PuckEditor from './PuckEditor';
import PuckRenderer from './PuckRenderer';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface MobilePuckEditorProps {
  initialData?: any;
  onChange?: (data: any) => void;
  organizationId: string;
  mode?: 'edit' | 'preview';
}

const MobilePuckEditor: React.FC<MobilePuckEditorProps> = ({
  initialData,
  onChange,
  organizationId,
  mode = 'edit'
}) => {
  const [currentMode, setCurrentMode] = useState<'edit' | 'preview'>(mode);
  const [puckData, setPuckData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [showComponentPanel, setShowComponentPanel] = useState(false);

  const handleDataChange = (data: any) => {
    console.log('Mobile Puck data changed:', data);
    setPuckData(data);
    onChange?.(data);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      onChange?.(puckData);
      console.log('Mobile Puck data saved successfully');
    } catch (error) {
      console.error('Error saving Mobile Puck data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleMode = () => {
    setCurrentMode(prev => prev === 'edit' ? 'preview' : 'edit');
  };

  // Quick component shortcuts for mobile
  const quickComponents = [
    { name: 'Hero', icon: Grid, label: 'Hero Section' },
    { name: 'TextBlock', icon: Type, label: 'Text Block' },
    { name: 'Image', icon: ImageIcon, label: 'Image' }
  ];

  return (
    <div className="mobile-puck-editor h-full flex flex-col relative">
      {/* Floating Action Toolbar - Only in edit mode */}
      {currentMode === 'edit' && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white rounded-full shadow-lg border border-gray-200 px-4 py-2 flex items-center gap-2">
            <Sheet open={showComponentPanel} onOpenChange={setShowComponentPanel}>
              <SheetTrigger asChild>
                <Button size="sm" variant="outline" className="rounded-full">
                  <Plus className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[40vh] rounded-t-lg">
                <SheetHeader>
                  <SheetTitle>Add Component</SheetTitle>
                </SheetHeader>
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {quickComponents.map((component) => (
                    <Button
                      key={component.name}
                      variant="outline"
                      className="h-16 flex flex-col gap-1"
                      onClick={() => {
                        // This would trigger adding the component
                        setShowComponentPanel(false);
                      }}
                    >
                      <component.icon className="h-5 w-5" />
                      <span className="text-xs">{component.label}</span>
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            <Button
              size="sm"
              variant="outline"
              onClick={toggleMode}
              className="rounded-full"
            >
              <Eye className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-full"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Mode indicator */}
      <div className="absolute top-4 right-4 z-40">
        <Badge variant={currentMode === 'edit' ? 'default' : 'outline'} className="text-xs">
          {currentMode === 'edit' ? 'Edit' : 'Preview'}
        </Badge>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {currentMode === 'edit' ? (
          <div className="h-full mobile-puck-editor-content">
            <PuckEditor
              initialData={puckData || { content: [], root: {} }}
              onChange={handleDataChange}
              onSave={handleDataChange}
            />
          </div>
        ) : (
          <div className="h-full overflow-auto bg-gray-50 p-2">
            <div className="max-w-full mx-auto bg-white rounded-lg shadow-sm">
              <PuckRenderer 
                data={puckData || { content: [], root: {} }}
                className="min-h-[500px] p-4"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobilePuckEditor;
