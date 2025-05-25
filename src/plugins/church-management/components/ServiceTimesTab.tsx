
import React from 'react';
import { Clock } from 'lucide-react';

const ServiceTimesTab: React.FC = () => {
  return (
    <div className="p-4 border-b">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-4 w-4 text-blue-600" />
        <span className="font-medium text-sm">Service Times</span>
      </div>
      <p className="text-xs text-gray-600">
        Display your church service schedule with customizable layouts
      </p>
    </div>
  );
};

export default ServiceTimesTab;
