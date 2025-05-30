
import React from 'react';
import EditorRenderer from '../editor/EditorRenderer';
import PuckRenderer from '../puck/PuckRenderer';
import { cn } from '@/lib/utils';
import { isPuckData, isEditorJSData } from '../utils/puckDataHelpers';

interface UniversalContentRendererProps {
  content: any;
  className?: string;
}

const UniversalContentRenderer: React.FC<UniversalContentRendererProps> = ({ 
  content, 
  className 
}) => {
  // Handle null or undefined content
  if (!content) {
    return <div className="text-gray-400">No content available.</div>;
  }

  // Check if it's Puck data format
  if (isPuckData(content)) {
    console.log('Rendering Puck content');
    return <PuckRenderer data={content} className={className} />;
  }

  // If content has blocks array, it's EditorJS format
  if (isEditorJSData(content)) {
    console.log('Rendering EditorJS content');
    return <EditorRenderer data={content} className={className} />;
  }

  // If content is a string, treat it as HTML
  if (typeof content === 'string') {
    return (
      <div 
        className={cn("prose max-w-none", className)}
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    );
  }

  // If content is an array, it might be legacy page builder elements
  if (Array.isArray(content)) {
    return (
      <div className={cn("space-y-4", className)}>
        {content.map((element, index) => (
          <div key={index} className="element-wrapper">
            {/* Handle different element types here if needed */}
            <div className="text-gray-400">
              Legacy element type: {element.type || 'unknown'}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // If content is an object but not EditorJS or Puck format, try to render it
  if (typeof content === 'object') {
    // Check if it has a recognizable structure
    if (content.type || content.component) {
      return (
        <div className={cn("prose max-w-none", className)}>
          <div className="text-gray-400">
            Unsupported content format: {content.type || content.component}
          </div>
        </div>
      );
    }
    
    // Try to render as JSON for debugging
    return (
      <div className={cn("prose max-w-none", className)}>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(content, null, 2)}
        </pre>
      </div>
    );
  }

  // Fallback for any other type
  return (
    <div className={cn("prose max-w-none", className)}>
      <div className="text-gray-400">Unable to render content of type: {typeof content}</div>
    </div>
  );
};

export default UniversalContentRenderer;
