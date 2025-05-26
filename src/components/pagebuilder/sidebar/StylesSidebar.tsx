
import React from 'react';
import { usePageBuilder } from '../context/PageBuilderContext';
import { Palette, Type, Layout } from 'lucide-react';

const StylesSidebar: React.FC = () => {
  const { pageElements } = usePageBuilder();
  const blockCount = pageElements?.content?.length || 0;

  return (
    <div className="p-3 sm:p-4 mt-0 overflow-auto site-styles-sidebar">
      <div className="text-center mb-6">
        <Palette className="h-8 w-8 mx-auto text-gray-400 mb-3" />
        <h3 className="font-medium text-gray-900 mb-2">Styling</h3>
        <p className="text-sm text-gray-500">
          Styles are managed within the Puck editor interface.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Type className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Text Formatting</span>
          </div>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Select components to see formatting options</li>
            <li>• Use the property panel on the right</li>
            <li>• Customize colors, fonts, and spacing</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Layout className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">Component Layout</span>
          </div>
          <ul className="text-xs text-green-800 space-y-1">
            <li>• Drag components to reorder them</li>
            <li>• Use different component types for variety</li>
            <li>• All components are responsive</li>
          </ul>
        </div>

        {blockCount > 0 && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              Current page has <strong>{blockCount}</strong> component{blockCount !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 text-xs text-gray-400 text-center">
        Advanced styling options available in the Puck editor sidebar.
      </div>
    </div>
  );
};

export default StylesSidebar;
