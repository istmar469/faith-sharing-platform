
import React from 'react';

interface EditorErrorDisplayProps {
  error: string;
}

const EditorErrorDisplay: React.FC<EditorErrorDisplayProps> = ({ error }) => {
  return (
    <div className="editor-wrapper">
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">Editor Error: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

export default EditorErrorDisplay;
