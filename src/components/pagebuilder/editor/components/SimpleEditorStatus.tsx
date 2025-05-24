
import React from 'react';
import { Type, List, Quote, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SimpleEditorStatusProps {
  forceSimpleEditor: boolean;
  onUseEnhancedEditor: () => void;
}

const SimpleEditorStatus: React.FC<SimpleEditorStatusProps> = ({
  forceSimpleEditor,
  onUseEnhancedEditor
}) => {
  return (
    <>
      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-800 font-medium">
              Simple Editor Mode
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Basic editing with automatic formatting. Enhanced visual editor coming soon!
            </p>
          </div>
          {!forceSimpleEditor && (
            <Button 
              variant="outline"
              size="sm"
              onClick={onUseEnhancedEditor}
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              Try Enhanced Editor
            </Button>
          )}
        </div>
      </div>

      {/* Toolbar Preview */}
      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-600 mb-2">Available in enhanced mode:</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs"><Type className="h-3 w-3 mr-1" />Headers</Badge>
          <Badge variant="secondary" className="text-xs"><List className="h-3 w-3 mr-1" />Lists</Badge>
          <Badge variant="secondary" className="text-xs"><Quote className="h-3 w-3 mr-1" />Quotes</Badge>
          <Badge variant="secondary" className="text-xs"><Palette className="h-3 w-3 mr-1" />Styling</Badge>
        </div>
      </div>
    </>
  );
};

export default SimpleEditorStatus;
