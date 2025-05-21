
import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImageProps {
  src?: string;
  alt?: string;
  width?: 'auto' | 'full' | '1/2' | '1/3' | '1/4';
}

const Image: React.FC<ImageProps> = ({ 
  src, 
  alt = 'Image',
  width = 'full'
}) => {
  const widthClasses = {
    auto: 'w-auto',
    full: 'w-full',
    '1/2': 'w-1/2',
    '1/3': 'w-1/3',
    '1/4': 'w-1/4',
  };

  if (!src) {
    return (
      <div className="bg-gray-100 rounded flex items-center justify-center h-40 text-gray-400">
        <div className="flex flex-col items-center">
          <ImageIcon className="h-8 w-8 mb-2" />
          <span>Image placeholder</span>
        </div>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={`${widthClasses[width]} rounded`} 
    />
  );
};

export default Image;
