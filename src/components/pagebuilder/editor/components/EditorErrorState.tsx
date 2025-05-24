
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditorErrorStateProps {
  error: string;
  onUseSimpleEditor: () => void;
  onRetry: () => void;
}

const EditorErrorState: React.FC<EditorErrorStateProps> = ({
  error,
  onUseSimpleEditor,
  onRetry
}) => {
  return (
    <div className="editor-wrapper">
      <div className="h-64 flex items-center justify-center text-amber-600 flex-col">
        <AlertTriangle className="h-8 w-8 mb-3" />
        <p className="text-sm font-medium mb-1">Editor Loading Issue</p>
        <p className="text-xs mb-4 text-center max-w-sm">{error}</p>
        <div className="flex gap-2">
          <Button 
            variant="secondary"
            size="sm"
            onClick={onUseSimpleEditor}
          >
            Use Simple Editor
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={onRetry}
          >
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditorErrorState;
