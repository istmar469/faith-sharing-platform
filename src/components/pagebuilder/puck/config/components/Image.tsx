
import React from 'react';
import { ComponentConfig } from '@measured/puck';

export interface ImageProps {
  src?: string;
  alt?: string;
  caption?: string;
  width?: 'full' | 'large' | 'medium' | 'small';
  alignment?: 'left' | 'center' | 'right';
}

export const Image: React.FC<ImageProps> = ({
  src = 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=600&fit=crop',
  alt = 'Image',
  caption,
  width = 'full',
  alignment = 'center'
}) => {
  const widthClasses = {
    full: 'w-full',
    large: 'w-3/4 max-w-4xl',
    medium: 'w-1/2 max-w-2xl',
    small: 'w-1/3 max-w-lg'
  };

  const alignmentClasses = {
    left: 'mx-0',
    center: 'mx-auto',
    right: 'ml-auto mr-0'
  };

  return (
    <div className={`${alignmentClasses[alignment]} ${widthClasses[width]}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-auto rounded-lg shadow-sm"
      />
      {caption && (
        <p className="text-sm text-gray-600 mt-2 text-center italic">
          {caption}
        </p>
      )}
    </div>
  );
};

export const imageConfig: ComponentConfig<ImageProps> = {
  fields: {
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
      label: 'Caption'
    },
    width: {
      type: 'select',
      label: 'Width',
      options: [
        { label: 'Full', value: 'full' },
        { label: 'Large', value: 'large' },
        { label: 'Medium', value: 'medium' },
        { label: 'Small', value: 'small' }
      ]
    },
    alignment: {
      type: 'select',
      label: 'Alignment',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' }
      ]
    }
  },
  render: ({ src, alt, caption, width, alignment }) => (
    <Image src={src} alt={alt} caption={caption} width={width} alignment={alignment} />
  )
};
