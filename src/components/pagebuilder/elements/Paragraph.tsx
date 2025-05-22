
import React, { useState, useEffect } from 'react';

interface ParagraphProps {
  text: string;
  isEditable?: boolean;
  onTextChange?: (text: string) => void;
}

const Paragraph: React.FC<ParagraphProps> = ({ 
  text = 'Enter your text here...', 
  isEditable = false,
  onTextChange 
}) => {
  const [editableText, setEditableText] = useState(text);
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    setEditableText(text);
  }, [text]);

  const handleDoubleClick = () => {
    if (isEditable) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (onTextChange && editableText !== text) {
      onTextChange(editableText);
    }
  };

  if (isEditing) {
    return (
      <textarea
        value={editableText}
        onChange={(e) => setEditableText(e.target.value)}
        onBlur={handleBlur}
        className="w-full p-2 border border-blue-500 rounded focus:outline-none min-h-[100px]"
        autoFocus
      />
    );
  }

  return (
    <p 
      className={`mb-4 ${isEditable ? 'cursor-text hover:bg-blue-50' : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      {editableText}
    </p>
  );
};

export default Paragraph;
