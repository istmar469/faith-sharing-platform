
import React from 'react';
import EditorRenderer from '../editor/EditorRenderer';
import { cn } from '@/lib/utils';

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

  // If content is a string, treat it as HTML
  if (typeof content === 'string') {
    return (
      <div 
        className={cn("prose max-w-none", className)}
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    );
  }

  // If content has blocks array, it's EditorJS format
  if (content.blocks && Array.isArray(content.blocks)) {
    return <EditorRenderer data={content} className={className} />;
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

  // If content is an object but not EditorJS format, try to render it
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
