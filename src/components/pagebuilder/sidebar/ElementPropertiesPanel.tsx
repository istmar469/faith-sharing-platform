
import React from 'react';
import { usePageBuilder } from '../context/PageBuilderContext';
import { Settings, Edit } from 'lucide-react';

const ElementPropertiesPanel: React.FC = () => {
  const { pageElements } = usePageBuilder();
  
  const blockCount = pageElements?.blocks?.length || 0;

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <Settings className="h-8 w-8 mx-auto text-gray-400 mb-3" />
        <h3 className="font-medium text-gray-900 mb-2">Block Properties</h3>
        <p className="text-sm text-gray-500">
          Block properties are managed within the Editor.js interface.
        </p>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Edit className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">How to Edit Blocks</span>
        </div>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Click on any block to edit its content</li>
          <li>• Use the toolbar that appears for formatting</li>
          <li>• Drag blocks to reorder them</li>
          <li>• Press backspace on empty blocks to delete</li>
        </ul>
      </div>

      {blockCount > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">
            Current page has <strong>{blockCount}</strong> content block{blockCount !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      <div className="text-xs text-gray-400 text-center">
        Each block type has its own editing interface and properties within the editor.
      </div>
    </div>
  );
};

export default ElementPropertiesPanel;
