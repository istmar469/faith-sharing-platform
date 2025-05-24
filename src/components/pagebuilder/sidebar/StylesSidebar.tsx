
import React from 'react';
import { usePageBuilder } from '../context/PageBuilderContext';
import { Palette, Type, Layout } from 'lucide-react';

const StylesSidebar: React.FC = () => {
  const { pageElements } = usePageBuilder();
  const blockCount = pageElements?.blocks?.length || 0;

  return (
    <div className="p-3 sm:p-4 mt-0 overflow-auto site-styles-sidebar">
      <div className="text-center mb-6">
        <Palette className="h-8 w-8 mx-auto text-gray-400 mb-3" />
        <h3 className="font-medium text-gray-900 mb-2">Styling</h3>
        <p className="text-sm text-gray-500">
          Styles are managed within the Editor.js interface.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Type className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Text Formatting</span>
          </div>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Select text to see formatting options</li>
            <li>• Use bold, italic, and link tools</li>
            <li>• Choose heading levels (H1-H6)</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Layout className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">Block Layout</span>
          </div>
          <ul className="text-xs text-green-800 space-y-1">
            <li>• Drag blocks to reorder them</li>
            <li>• Use different block types for variety</li>
            <li>• Images and embeds are responsive</li>
          </ul>
        </div>

        {blockCount > 0 && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              Current page has <strong>{blockCount}</strong> content block{blockCount !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 text-xs text-gray-400 text-center">
        Advanced styling options coming soon. Currently using Editor.js default styles.
      </div>
    </div>
  );
};

export default StylesSidebar;
