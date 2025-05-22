
import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface DonationFormProps {
  title?: string;
  isEditable?: boolean;
  onTitleChange?: (title: string) => void;
}

const DonationForm: React.FC<DonationFormProps> = ({ 
  title = 'Support Our Church',
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
    <div className="border rounded-lg p-6 bg-gray-50">
      {isEditing ? (
        <input
          type="text"
          value={editableTitle}
          onChange={(e) => setEditableTitle(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="text-xl font-semibold mb-4 w-full p-1 border border-blue-500 rounded focus:outline-none"
          autoFocus
        />
      ) : (
        <h3 
          className={`text-xl font-semibold mb-4 ${isEditable ? 'cursor-text hover:bg-blue-50' : ''}`}
          onDoubleClick={handleDoubleClick}
        >
          {editableTitle}
        </h3>
      )}
      <p className="mb-4">Support our ministry with your generous donation.</p>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Button variant="outline">$25</Button>
        <Button variant="outline">$50</Button>
        <Button variant="outline">$100</Button>
        <Button variant="outline">Other</Button>
      </div>
      <Button className="w-full">
        <Save className="mr-2 h-4 w-4" />
        Donate Now
      </Button>
    </div>
  );
};

export default DonationForm;
