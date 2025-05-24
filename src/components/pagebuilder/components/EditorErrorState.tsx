
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditorErrorStateProps {
  error: string;
  onRetry: () => void;
  onShowFallback: () => void;
}

const EditorErrorState: React.FC<EditorErrorStateProps> = ({
  error,
  onRetry,
  onShowFallback
}) => {
  return (
    <div className="h-64 sm:h-96 flex items-center justify-center text-amber-600 flex-col px-4 text-center">
      <AlertTriangle className="h-8 w-8 sm:h-12 sm:w-12 mb-2" />
      <p className="text-sm sm:text-base font-medium mb-1">Editor Loading Issue</p>
      <p className="text-xs sm:text-sm mb-4">{error}</p>
      <div className="space-x-2">
        <Button 
          variant="outline"
          size="sm"
          onClick={onRetry}
        >
          Retry Editor
        </Button>
        <Button 
          variant="secondary"
          size="sm"
          onClick={onShowFallback}
        >
          Use Simple Editor
        </Button>
      </div>
    </div>
  );
};

export default EditorErrorState;
