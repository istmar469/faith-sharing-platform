
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PuckEditor from './PuckEditor';
import RefactoredEditorComponent from '../editor/RefactoredEditorComponent';

interface HybridEditorProps {
  initialData?: any;
  onChange?: (data: any) => void;
  organizationId: string;
  editorMode?: 'text' | 'visual';
}

const HybridEditor: React.FC<HybridEditorProps> = ({
  initialData,
  onChange,
  organizationId,
  editorMode = 'visual'
}) => {
  const [currentMode, setCurrentMode] = useState<'text' | 'visual'>(editorMode);
  const [editorData, setEditorData] = useState(initialData);

  const handleModeChange = (mode: 'text' | 'visual') => {
    setCurrentMode(mode);
    console.log(`Switched to ${mode} editor mode`);
  };

  const handleDataChange = (data: any) => {
    setEditorData(data);
    onChange?.(data);
  };

  const isPuckData = (data: any) => {
    return data && data.content && Array.isArray(data.content) && data.root;
  };

  const isEditorJSData = (data: any) => {
    return data && data.blocks && Array.isArray(data.blocks);
  };

  return (
    <div className="hybrid-editor">
      <div className="mb-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Editor Mode:</span>
          <Badge variant={currentMode === 'visual' ? 'default' : 'outline'}>
            {currentMode === 'visual' ? 'Visual Builder' : 'Text Editor'}
          </Badge>
        </div>
        
        <Tabs value={currentMode} onValueChange={(value) => handleModeChange(value as 'text' | 'visual')}>
          <TabsList>
            <TabsTrigger value="visual">Visual Builder</TabsTrigger>
            <TabsTrigger value="text">Text Editor</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {currentMode === 'visual' ? (
        <div className="visual-editor-container">
          <PuckEditor
            initialData={isPuckData(editorData) ? editorData : { content: [], root: {} }}
            onChange={handleDataChange}
            onSave={handleDataChange}
          />
        </div>
      ) : (
        <div className="text-editor-container">
          <RefactoredEditorComponent
            initialData={isEditorJSData(editorData) ? editorData : undefined}
            onChange={handleDataChange}
            organizationId={organizationId}
          />
        </div>
      )}
    </div>
  );
};

export default HybridEditor;
