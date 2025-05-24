
import React from 'react';

interface FallbackEditorProps {
  pageElements: any;
  onChange: (data: any) => void;
}

const FallbackEditor: React.FC<FallbackEditorProps> = ({
  pageElements,
  onChange
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const data = JSON.parse(e.target.value);
      onChange(data);
    } catch (err) {
      // Invalid JSON, ignore
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
        <p className="text-sm text-amber-800">
          Using simplified editor mode. Some features may be limited.
        </p>
      </div>
      <textarea
        className="w-full min-h-[400px] p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Start writing your content here..."
        defaultValue={JSON.stringify(pageElements, null, 2)}
        onChange={handleChange}
      />
    </div>
  );
};

export default FallbackEditor;
