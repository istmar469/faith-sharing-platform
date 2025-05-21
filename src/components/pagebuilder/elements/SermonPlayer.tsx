
import React from 'react';
import { Video } from 'lucide-react';

interface SermonPlayerProps {
  title?: string;
}

const SermonPlayer: React.FC<SermonPlayerProps> = ({ title = 'Latest Sermon' }) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-800 h-52 flex items-center justify-center">
        <Video className="h-12 w-12 text-white opacity-50" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-gray-500 text-sm">Pastor John Doe | May 19, 2025</p>
      </div>
    </div>
  );
};

export default SermonPlayer;
