
import React from 'react';
import { Users } from 'lucide-react';

const StaffDirectoryTab: React.FC = () => {
  return (
    <div className="p-4 border-b">
      <div className="flex items-center gap-2 mb-2">
        <Users className="h-4 w-4 text-purple-600" />
        <span className="font-medium text-sm">Staff Directory</span>
      </div>
      <p className="text-xs text-gray-600">
        Display church staff with photos and contact information
      </p>
    </div>
  );
};

export default StaffDirectoryTab;
