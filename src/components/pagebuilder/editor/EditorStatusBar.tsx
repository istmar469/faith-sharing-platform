
import React from 'react';

interface EditorStatusBarProps {
  isReady: boolean;
  useSimpleEditor: boolean;
  onUseSimpleEditor: () => void;
}

const EditorStatusBar: React.FC<EditorStatusBarProps> = ({
  isReady,
  useSimpleEditor,
  onUseSimpleEditor
}) => {
  if (useSimpleEditor) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Simple Editor Mode</strong><br />
          Using a basic text editor. The visual editor will be available in a future update.
        </p>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-yellow-800">
              <strong>Loading Enhanced Editor...</strong><br />
              Setting up the visual editor with advanced tools.
            </p>
          </div>
          <button
            onClick={onUseSimpleEditor}
            className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
          >
            Use Simple Editor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-xs text-gray-500 mt-2">
      <p>💡 <strong>Tips:</strong> Use <kbd>Tab</kbd> to access the toolbar, <kbd>/</kbd> to insert blocks, and the editor auto-saves every 2 seconds.</p>
    </div>
  );
};

export default EditorStatusBar;
