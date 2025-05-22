
import React, { useState, useEffect } from 'react';
import { Video } from 'lucide-react';

interface SermonPlayerProps {
  title?: string;
  isEditable?: boolean;
  onTitleChange?: (title: string) => void;
}

const SermonPlayer: React.FC<SermonPlayerProps> = ({ 
  title = 'Latest Sermon',
  isEditable = false,
  onTitleChange 
}) => {
  const [editableTitle, setEditableTitle] = useState(title);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setEditableTitle(title);
  }, [title]);

  const handleDoubleClick = () => {
    if (isEditable) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (onTitleChange && editableTitle !== title) {
      onTitleChange(editableTitle);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if (onTitleChange && editableTitle !== title) {
        onTitleChange(editableTitle);
      }
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-800 h-52 flex items-center justify-center">
        <Video className="h-12 w-12 text-white opacity-50" />
      </div>
      <div className="p-4">
        {isEditing ? (
          <input
            type="text"
            value={editableTitle}
            onChange={(e) => setEditableTitle(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="font-semibold w-full p-1 border border-blue-500 rounded focus:outline-none"
            autoFocus
          />
        ) : (
          <h3 
            className={`font-semibold mb-1 ${isEditable ? 'cursor-text hover:bg-blue-50' : ''}`}
            onDoubleClick={handleDoubleClick}
          >
            {editableTitle}
          </h3>
        )}
        <p className="text-gray-500 text-sm">Pastor John Doe | May 19, 2025</p>
      </div>
    </div>
  );
};

export default SermonPlayer;
