
import React from 'react';
import { Button } from '@/components/ui/button';
import { ComponentConfig } from '@measured/puck';

export interface HeroProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  useGradient?: boolean;
  textColor?: 'white' | 'black' | 'custom';
  customTextColor?: string;
  size?: 'small' | 'medium' | 'large';
  alignment?: 'left' | 'center' | 'right';
  overlayOpacity?: number;
}

// Clean default props without complex transformations
const DEFAULT_PROPS: Required<HeroProps> = {
  title: 'Welcome to Your Website',
  subtitle: 'Create amazing experiences with our powerful tools',
  buttonText: 'Get Started',
  buttonLink: '#',
  backgroundImage: '',
  backgroundColor: '#3B82F6',
  gradientFrom: '#3B82F6',
  gradientTo: '#8B5CF6',
  useGradient: true,
  textColor: 'white',
  customTextColor: '#FFFFFF',
  size: 'large',
  alignment: 'center',
  overlayOpacity: 40
};

export const Hero: React.FC<HeroProps> = React.memo((props = {}) => {
  // Simple prop merging with defaults
  const safeProps = { ...DEFAULT_PROPS, ...props };

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

  const getTextColor = () => {
    switch (safeProps.textColor) {
      case 'white': return 'text-white';
      case 'black': return 'text-gray-900';
      case 'custom': return '';
      default: return 'text-white';
    }
  };

  const backgroundStyle: React.CSSProperties = {
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  if (safeProps.backgroundImage) {
    backgroundStyle.backgroundImage = `url(${safeProps.backgroundImage})`;
  } else if (safeProps.useGradient) {
    backgroundStyle.background = `linear-gradient(135deg, ${safeProps.gradientFrom}, ${safeProps.gradientTo})`;
  } else {
    backgroundStyle.backgroundColor = safeProps.backgroundColor;
  }

  if (safeProps.textColor === 'custom' && safeProps.customTextColor) {
    backgroundStyle.color = safeProps.customTextColor;
  }

  return (
    <div 
      className={`relative ${sizeClasses[safeProps.size]} ${alignmentClasses[safeProps.alignment]} ${getTextColor()}`}
      style={backgroundStyle}
    >
      {safeProps.backgroundImage && (
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: safeProps.overlayOpacity / 100 }}
        />
      )}
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className={`${titleSizes[safeProps.size]} font-bold mb-6 leading-tight`}>
            {safeProps.title}
          </h1>
          
          {safeProps.subtitle && (
            <p className={`text-lg md:text-xl mb-8 leading-relaxed ${
              safeProps.textColor === 'white' ? 'text-gray-100' :
              safeProps.textColor === 'black' ? 'text-gray-700' : ''
            }`}>
              {safeProps.subtitle}
            </p>
          )}
          
          {safeProps.buttonText && (
            <Button 
              size="lg" 
              className={`font-semibold px-8 py-3 ${
                safeProps.textColor === 'white' 
                  ? 'bg-white text-blue-600 hover:bg-gray-100' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              asChild
            >
              <a href={safeProps.buttonLink}>{safeProps.buttonText}</a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

Hero.displayName = 'Hero';

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
    useGradient: {
      type: 'radio',
      label: 'Use Gradient Background',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    },
    gradientFrom: {
      type: 'text',
      label: 'Gradient From Color (hex)'
    },
    gradientTo: {
      type: 'text',
      label: 'Gradient To Color (hex)'
    },
    backgroundColor: {
      type: 'text',
      label: 'Solid Background Color (hex)'
    },
    backgroundImage: {
      type: 'text',
      label: 'Background Image URL'
    },
    overlayOpacity: {
      type: 'number',
      label: 'Image Overlay Opacity (%)',
      min: 0,
      max: 100
    },
    textColor: {
      type: 'select',
      label: 'Text Color',
      options: [
        { label: 'White', value: 'white' },
        { label: 'Black', value: 'black' },
        { label: 'Custom', value: 'custom' }
      ]
    },
    customTextColor: {
      type: 'text',
      label: 'Custom Text Color (hex)'
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
  defaultProps: DEFAULT_PROPS,
  render: ({ ...props }) => <Hero {...props} />
};
