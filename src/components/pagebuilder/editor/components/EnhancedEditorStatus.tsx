
import React from 'react';
import { Badge } from '@/components/ui/badge';

const EnhancedEditorStatus: React.FC = () => {
  return (
    <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-green-800 font-medium">
            Enhanced Visual Editor Active
          </p>
          <p className="text-xs text-green-600 mt-1">
            Full editing tools available. Press <kbd className="px-1 py-0.5 bg-green-100 rounded text-xs">/</kbd> to see all blocks
          </p>
        </div>
        <Badge variant="outline" className="text-green-700 border-green-300">
          Pro Mode
        </Badge>
      </div>
    </div>
  );
};

export default EnhancedEditorStatus;
