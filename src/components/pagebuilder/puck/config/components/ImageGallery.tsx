
import React from 'react';
import { ComponentConfig } from '@measured/puck';

export interface ImageGalleryProps {
  images?: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  layout?: 'grid' | 'masonry' | 'carousel';
  columns?: 2 | 3 | 4;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images = [
    {
      src: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop',
      alt: 'Image 1',
      caption: 'Beautiful landscape'
    },
    {
      src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
      alt: 'Image 2',
      caption: 'City skyline'
    },
    {
      src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=300&fit=crop',
      alt: 'Image 3',
      caption: 'Mountain view'
    }
  ],
  layout = 'grid',
  columns = 3
}) => {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  if (layout === 'carousel') {
    return (
      <div className="relative">
        <div className="overflow-x-auto flex gap-4 pb-4">
          {images.map((image, index) => (
            <div key={index} className="flex-shrink-0 w-64">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-48 object-cover rounded-lg"
              />
              {image.caption && (
                <p className="text-sm text-gray-600 mt-2 text-center">
                  {image.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`grid ${gridClasses[columns]} gap-4`}>
      {images.map((image, index) => (
        <div key={index} className="group">
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-64 object-cover rounded-lg transition-transform group-hover:scale-105"
          />
          {image.caption && (
            <p className="text-sm text-gray-600 mt-2 text-center">
              {image.caption}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export const imageGalleryConfig: ComponentConfig<ImageGalleryProps> = {
  fields: {
    layout: {
      type: 'select',
      label: 'Layout',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'Masonry', value: 'masonry' },
        { label: 'Carousel', value: 'carousel' }
      ]
    },
    columns: {
      type: 'select',
      label: 'Columns',
      options: [
        { label: '2', value: 2 },
        { label: '3', value: 3 },
        { label: '4', value: 4 }
      ]
    }
  },
  render: (props) => <ImageGallery {...props} />
};

export default ImageGallery;
