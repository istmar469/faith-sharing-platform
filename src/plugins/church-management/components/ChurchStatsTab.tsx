
import React from 'react';
import { TrendingUp } from 'lucide-react';

const ChurchStatsTab: React.FC = () => {
  return (
    <div className="p-4 border-b">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="h-4 w-4 text-indigo-600" />
        <span className="font-medium text-sm">Church Stats</span>
      </div>
      <p className="text-xs text-gray-600">
        Show attendance, events, and donation statistics
      </p>
    </div>
  );
};

export default ChurchStatsTab;
