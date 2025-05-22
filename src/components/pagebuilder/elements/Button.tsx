
import React, { useState, useEffect } from 'react';
import { Button as UIButton } from '@/components/ui/button';

interface ButtonProps {
  text: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg';
  action?: Record<string, string>;
  isEditable?: boolean;
  onTextChange?: (text: string) => void;
}

const Button: React.FC<ButtonProps> = ({ 
  text = 'Button',
  variant = 'default',
  size = 'default',
  action,
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

  if (isEditing) {
    return (
      <input
        type="text"
        value={editableText}
        onChange={(e) => setEditableText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="p-2 border border-blue-500 rounded focus:outline-none"
        autoFocus
      />
    );
  }

  return (
    <UIButton
      variant={variant}
      size={size}
      className={isEditable ? 'cursor-text' : ''}
      onDoubleClick={handleDoubleClick}
    >
      {editableText}
    </UIButton>
  );
};

export default Button;
