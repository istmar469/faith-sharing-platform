
import React from 'react';
import { Button } from '@/components/ui/button';
import { ComponentConfig } from '@measured/puck';

export interface HeroProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImage?: string;
  size?: 'small' | 'medium' | 'large';
  alignment?: 'left' | 'center' | 'right';
}

export const Hero: React.FC<HeroProps> = ({
  title = 'Welcome to Your Website',
  subtitle = 'Create amazing experiences with our powerful tools',
  buttonText = 'Get Started',
  buttonLink = '#',
  backgroundImage,
  size = 'large',
  alignment = 'center'
}) => {
  const sizeClasses = {
    small: 'py-16 md:py-20',
    medium: 'py-20 md:py-32',
    large: 'py-24 md:py-40'
  };

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const titleSizes = {
    small: 'text-3xl md:text-4xl',
    medium: 'text-4xl md:text-5xl',
    large: 'text-4xl md:text-6xl'
  };

  return (
    <div 
      className={`relative ${sizeClasses[size]} ${alignmentClasses[alignment]} bg-gradient-to-r from-blue-600 to-purple-600 text-white`}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {(backgroundImage || true) && (
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      )}
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className={`${titleSizes[size]} font-bold mb-6 leading-tight`}>
            {title}
          </h1>
          
          {subtitle && (
            <p className="text-lg md:text-xl mb-8 text-gray-100 leading-relaxed">
              {subtitle}
            </p>
          )}
          
          {buttonText && (
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3"
              asChild
            >
              <a href={buttonLink}>{buttonText}</a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export const heroConfig: ComponentConfig<HeroProps> = {
  fields: {
    title: {
      type: 'text',
      label: 'Title'
    },
    subtitle: {
      type: 'textarea',
      label: 'Subtitle'
    },
    buttonText: {
      type: 'text',
      label: 'Button Text'
    },
    buttonLink: {
      type: 'text',
      label: 'Button Link'
    },
    backgroundImage: {
      type: 'text',
      label: 'Background Image URL'
    },
    size: {
      type: 'select',
      label: 'Size',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' }
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
  render: ({ title, subtitle, buttonText, buttonLink, backgroundImage, size, alignment }) => (
    <Hero 
      title={title}
      subtitle={subtitle}
      buttonText={buttonText}
      buttonLink={buttonLink}
      backgroundImage={backgroundImage}
      size={size}
      alignment={alignment}
    />
  )
};
