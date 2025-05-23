
import React from 'react';
import EditorRenderer from '../editor/EditorRenderer';

interface PageElementProps {
  element: any;
  isSelected?: boolean;
  onClick?: () => void;
}

// This is now just a wrapper component that renders Editor.js content
// It's kept for backward compatibility
const PageElement: React.FC<PageElementProps> = ({ 
  element,
  isSelected,
  onClick
}) => {
  // Convert legacy element to Editor.js compatible format if needed
  let content;
  
  if (element.blocks) {
    // Already in Editor.js format
    content = element;
  } else {
    // Legacy format, convert to EditorJS block
    content = {
      blocks: [
        {
          type: element.component.toLowerCase(),
          data: element.props || {}
        }
      ]
    };
  }
  
  return (
    <div 
      className={`relative mb-4 ${isSelected ? 'outline outline-2 outline-blue-500' : ''}`}
      onClick={onClick}
    >
      <EditorRenderer data={content} />
    </div>
  );
};

export default PageElement;
