
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Save, Loader2, Menu, X } from 'lucide-react';
import PuckEditor from './PuckEditor';
import PuckRenderer from './PuckRenderer';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/use-media-query';

interface PuckOnlyEditorProps {
  initialData?: any;
  onChange?: (data: any) => void;
  organizationId: string;
  mode?: 'edit' | 'preview';
}

const PuckOnlyEditor: React.FC<PuckOnlyEditorProps> = ({
  initialData,
  onChange,
  organizationId,
  mode = 'edit'
}) => {
  const [currentMode, setCurrentMode] = useState<'edit' | 'preview'>(mode);
  const [puckData, setPuckData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleDataChange = (data: any) => {
    console.log('Puck data changed:', data);
    setPuckData(data);
    onChange?.(data);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      onChange?.(puckData);
      console.log('Puck data saved successfully');
    } catch (error) {
      console.error('Error saving Puck data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleMode = () => {
    setCurrentMode(prev => prev === 'edit' ? 'preview' : 'edit');
    setShowMobileMenu(false);
  };

  // Mobile toolbar component
  const MobileToolbar = () => (
    <div className="flex items-center justify-between bg-white border-b border-gray-200 p-2 md:p-3">
      <div className="flex items-center gap-2">
        <Badge variant={currentMode === 'edit' ? 'default' : 'outline'} className="text-xs">
          {currentMode === 'edit' ? 'Edit' : 'Preview'}
        </Badge>
        <span className="text-xs text-gray-500 hidden sm:inline">
          Visual Page Builder
        </span>
      </div>
      
      {isMobile ? (
        <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <div className="flex flex-col gap-3 pt-6">
              <Button
                variant="outline"
                onClick={toggleMode}
                className="flex items-center gap-2 w-full"
              >
                <Eye className="h-4 w-4" />
                {currentMode === 'edit' ? 'Preview' : 'Edit'}
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 w-full"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleMode}
            className="flex items-center gap-1"
          >
            <Eye className="h-4 w-4" />
            {currentMode === 'edit' ? 'Preview' : 'Edit'}
          </Button>
          
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="puck-only-editor h-full flex flex-col">
      <MobileToolbar />

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {currentMode === 'edit' ? (
          <div className="h-full mobile-puck-editor">
            <PuckEditor
              initialData={puckData || { content: [], root: {} }}
              onChange={handleDataChange}
              onSave={handleDataChange}
            />
          </div>
        ) : (
          <div className="h-full overflow-auto bg-gray-50 p-2 md:p-4">
            <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm">
              <PuckRenderer 
                data={puckData || { content: [], root: {} }}
                className="min-h-[500px] p-4 md:p-8"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PuckOnlyEditor;
