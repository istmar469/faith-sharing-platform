
import React, { useState } from 'react';

export interface ImageGalleryProps {
  images?: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  layout?: 'grid' | 'masonry' | 'carousel';
  columns?: 2 | 3 | 4;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images = [
    { src: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop', alt: 'Gallery 1', caption: 'Beautiful landscape' },
    { src: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop', alt: 'Gallery 2', caption: 'Technology' },
    { src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop', alt: 'Gallery 3', caption: 'Innovation' },
    { src: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=400&h=300&fit=crop', alt: 'Gallery 4', caption: 'Nature' }
  ],
  layout = 'grid',
  columns = 3
}) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const columnClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4'
  };

  if (layout === 'carousel') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex overflow-x-auto gap-4 pb-4">
          {images.map((image, index) => (
            <div key={index} className="flex-shrink-0 w-80">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-60 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedImage(index)}
              />
              {image.caption && (
                <p className="text-sm text-gray-600 mt-2 text-center">{image.caption}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className={`grid ${columnClasses[columns]} gap-4`}>
        {images.map((image, index) => (
          <div key={index} className="group cursor-pointer" onClick={() => setSelectedImage(index)}>
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
            </div>
            {image.caption && (
              <p className="text-sm text-gray-600 mt-2 text-center">{image.caption}</p>
            )}
          </div>
        ))}
      </div>

      {/* Modal for selected image */}
      {selectedImage !== null && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full">
            <img
              src={images[selectedImage].src}
              alt={images[selectedImage].alt}
              className="max-w-full max-h-full object-contain"
            />
            {images[selectedImage].caption && (
              <p className="text-white text-center mt-4">{images[selectedImage].caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
