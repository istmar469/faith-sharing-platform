
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

const ImageGallery: React.FC<ImageGalleryProps> = (props) => {
  // Enhanced safe prop extraction with better array handling
  const safeImages = (() => {
    // Handle undefined/null images
    if (!props.images) {
      return [
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
      ];
    }
    
    // Ensure images is an array - this fixes the .map error
    if (Array.isArray(props.images)) {
      return props.images.filter(image => image && typeof image === 'object' && image.src);
    }
    
    // If images is a string, try to parse it
    if (typeof props.images === 'string') {
      try {
        const parsed = JSON.parse(props.images);
        if (Array.isArray(parsed)) {
          return parsed.filter(image => image && typeof image === 'object' && image.src);
        }
      } catch (error) {
        console.warn('ImageGallery: Failed to parse images string:', error);
      }
    }
    
    // Fallback to default images
    return [
      {
        src: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop',
        alt: 'Image 1',
        caption: 'Beautiful landscape'
      }
    ];
  })();

  const safeLayout = ['grid', 'masonry', 'carousel'].includes(props.layout as string) ? props.layout : 'grid';
  const safeColumns = [2, 3, 4].includes(props.columns as number) ? props.columns : 3;

  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  // Ensure we have valid images to render
  if (!Array.isArray(safeImages) || safeImages.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
        <p>No images to display</p>
      </div>
    );
  }

  if (safeLayout === 'carousel') {
    return (
      <div className="relative">
        <div className="overflow-x-auto flex gap-4 pb-4">
          {safeImages.map((image, index) => {
            // Ensure each image object is valid
            const imgSrc = (image && typeof image.src === 'string') ? image.src : '';
            const imgAlt = (image && typeof image.alt === 'string') ? image.alt : `Image ${index + 1}`;
            const imgCaption = (image && typeof image.caption === 'string') ? image.caption : '';
            
            return (
              <div key={`carousel-image-${index}-${imgSrc.slice(-10)}`} className="flex-shrink-0 w-64">
                <img
                  src={imgSrc}
                  alt={imgAlt}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/400x300?text=Image+Error';
                  }}
                />
                {imgCaption && (
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    {imgCaption}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`grid ${gridClasses[safeColumns]} gap-4`}>
      {safeImages.map((image, index) => {
        // Ensure each image object is valid
        const imgSrc = (image && typeof image.src === 'string') ? image.src : '';
        const imgAlt = (image && typeof image.alt === 'string') ? image.alt : `Image ${index + 1}`;
        const imgCaption = (image && typeof image.caption === 'string') ? image.caption : '';
        
        return (
          <div key={`grid-image-${index}-${imgSrc.slice(-10)}`} className="group">
            <img
              src={imgSrc}
              alt={imgAlt}
              className="w-full h-64 object-cover rounded-lg transition-transform group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/400x300?text=Image+Error';
              }}
            />
            {imgCaption && (
              <p className="text-sm text-gray-600 mt-2 text-center">
                {imgCaption}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const imageGalleryConfig: ComponentConfig<ImageGalleryProps> = {
  fields: {
    images: {
      type: 'array',
      label: 'Images',
      arrayFields: {
        src: {
          type: 'text',
          label: 'Image URL'
        },
        alt: {
          type: 'text',
          label: 'Alt Text'
        },
        caption: {
          type: 'text',
          label: 'Caption (optional)'
        }
      },
      defaultItemProps: {
        src: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop',
        alt: 'New Image',
        caption: 'Image caption'
      }
    },
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
  defaultProps: {
    images: [
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
    layout: 'grid',
    columns: 3
  },
  render: (props) => <ImageGallery {...props} />
};

export default ImageGallery;
