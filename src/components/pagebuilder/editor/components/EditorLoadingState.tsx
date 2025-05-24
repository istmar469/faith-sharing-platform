
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditorLoadingStateProps {
  onUseSimpleEditor: () => void;
}

const EditorLoadingState: React.FC<EditorLoadingStateProps> = ({
  onUseSimpleEditor
}) => {
  return (
    <div className="editor-wrapper">
      <div className="h-64 flex items-center justify-center text-gray-400 flex-col">
        <Loader2 className="h-8 w-8 mb-3 animate-spin text-blue-500" />
        <p className="text-sm font-medium mb-2">Loading Enhanced Editor...</p>
        <p className="text-xs text-gray-500 mb-4">Setting up advanced editing tools</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onUseSimpleEditor}
        >
          Use Simple Editor Instead
        </Button>
      </div>
    </div>
  );
};

export default EditorLoadingState;
