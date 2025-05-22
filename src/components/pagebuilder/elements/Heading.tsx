
import React, { useState, useEffect } from 'react';

interface HeadingProps {
  text: string;
  size?: 'small' | 'medium' | 'large' | 'xl';
  isEditable?: boolean;
  onTextChange?: (text: string) => void;
}

const Heading: React.FC<HeadingProps> = ({ 
  text = 'Heading', 
  size = 'large',
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if (onTextChange && editableText !== text) {
        onTextChange(editableText);
      }
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small': return 'text-lg font-semibold';
      case 'medium': return 'text-xl font-semibold';
      case 'large': return 'text-2xl font-bold';
      case 'xl': return 'text-3xl font-bold';
      default: return 'text-2xl font-bold';
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={editableText}
        onChange={(e) => setEditableText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`${getSizeClasses()} w-full border-b border-blue-500 focus:outline-none bg-transparent`}
        autoFocus
      />
    );
  }

  return (
    <div 
      className={`${getSizeClasses()} ${isEditable ? 'cursor-text hover:bg-blue-50' : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      {editableText}
    </div>
  );
};

export default Heading;
