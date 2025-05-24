
import React from 'react';

interface SimpleEditorInputProps {
  editorId: string;
  onChange?: (data: any) => void;
}

const SimpleEditorInput: React.FC<SimpleEditorInputProps> = ({
  editorId,
  onChange
}) => {
  return (
    <div className="relative">
      <div 
        id={editorId} 
        className="prose max-w-none min-h-[400px] p-6 bg-white rounded-lg border border-gray-200 focus-within:border-blue-500 transition-colors shadow-sm"
        contentEditable
        suppressContentEditableWarning
        style={{ outline: 'none' }}
        onInput={(e) => {
          const target = e.target as HTMLElement;
          if (onChange) {
            onChange({
              time: Date.now(),
              blocks: [{
                type: 'paragraph',
                data: { text: target.textContent || '' }
              }],
              version: '2.30.8'
            });
          }
        }}
      />
      <div 
        className="absolute top-6 left-6 text-gray-400 pointer-events-none select-none"
        style={{ 
          display: 'block'
        }}
      >
        Start typing your content here...
      </div>
    </div>
  );
};

export default SimpleEditorInput;
