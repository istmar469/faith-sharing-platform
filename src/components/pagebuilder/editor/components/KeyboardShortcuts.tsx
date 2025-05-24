
import React from 'react';

const KeyboardShortcuts: React.FC = () => {
  return (
    <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <p className="text-xs text-gray-600 font-medium mb-2">Keyboard Shortcuts:</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500">
        <div><kbd className="px-1 py-0.5 bg-gray-200 rounded">Cmd+H</kbd> Header</div>
        <div><kbd className="px-1 py-0.5 bg-gray-200 rounded">Cmd+L</kbd> List</div>
        <div><kbd className="px-1 py-0.5 bg-gray-200 rounded">Cmd+Q</kbd> Quote</div>
        <div><kbd className="px-1 py-0.5 bg-gray-200 rounded">Tab</kbd> Toolbar</div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;
