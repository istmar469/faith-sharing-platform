
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Save, Loader2 } from 'lucide-react';
import PuckEditor from './PuckEditor';
import PuckRenderer from './PuckRenderer';

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

  const handleDataChange = (data: any) => {
    console.log('Puck data changed:', data);
    setPuckData(data);
    onChange?.(data);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Trigger save through onChange
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
  };

  return (
    <div className="puck-only-editor h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white border-b border-gray-200 p-3">
        <div className="flex items-center gap-3">
          <Badge variant={currentMode === 'edit' ? 'default' : 'outline'}>
            {currentMode === 'edit' ? 'Edit Mode' : 'Preview Mode'}
          </Badge>
          <span className="text-sm text-gray-500">
            Visual Page Builder
          </span>
        </div>
        
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
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {currentMode === 'edit' ? (
          <PuckEditor
            initialData={puckData || { content: [], root: {} }}
            onChange={handleDataChange}
            onSave={handleDataChange}
          />
        ) : (
          <div className="h-full overflow-auto bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm">
              <PuckRenderer 
                data={puckData || { content: [], root: {} }}
                className="min-h-[500px]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PuckOnlyEditor;
