
import React from 'react';
import { MessageSquare } from 'lucide-react';

const AnnouncementBoardTab: React.FC = () => {
  return (
    <div className="p-4 border-b">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="h-4 w-4 text-red-600" />
        <span className="font-medium text-sm">Announcements</span>
      </div>
      <p className="text-xs text-gray-600">
        Display church announcements and important news
      </p>
    </div>
  );
};

export default AnnouncementBoardTab;
