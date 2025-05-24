
import React from 'react';

interface SimpleEditorProps {
  content: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const SimpleEditor: React.FC<SimpleEditorProps> = ({
  content,
  onChange
}) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b">
        <span className="text-sm font-medium">Content Editor</span>
      </div>
      <textarea
        value={content}
        onChange={onChange}
        placeholder="Start writing your content here..."
        className="w-full h-96 p-4 border-0 focus:outline-none resize-none font-mono text-sm"
      />
    </div>
  );
};

export default SimpleEditor;
