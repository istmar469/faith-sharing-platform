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

export const Hero: React.FC<HeroProps> = (rawProps = {}) => {
  // Safely extract props with comprehensive defaults
  const {
    title = 'Welcome to Your Website',
    subtitle = 'Create amazing experiences with our powerful tools',
    buttonText = 'Get Started',
    buttonLink = '#',
    backgroundImage = '',
    backgroundColor = '#3B82F6',
    gradientFrom = '#3B82F6',
    gradientTo = '#8B5CF6',
    useGradient = true,
    textColor = 'white',
    customTextColor = '#FFFFFF',
    size = 'large',
    alignment = 'center',
    overlayOpacity = 40
  } = rawProps;

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

  // Simple text color calculation
  const getTextColor = () => {
    switch (textColor) {
      case 'white':
        return 'text-white';
      case 'black':
        return 'text-gray-900';
      case 'custom':
        return '';
      default:
        return 'text-white';
    }
  };

  // Simple background styles
  const backgroundStyle: React.CSSProperties = {
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '400px',
    width: '100%',
    display: 'block',
    position: 'relative'
  };

  // Ensure proper color values
  const safeGradientFrom = gradientFrom && gradientFrom.length >= 4 ? gradientFrom : '#3B82F6';
  const safeGradientTo = gradientTo && gradientTo.length >= 4 ? gradientTo : '#8B5CF6';
  const safeBackgroundColor = backgroundColor && backgroundColor.length >= 4 ? backgroundColor : '#3B82F6';

  if (backgroundImage) {
    backgroundStyle.backgroundImage = `url(${backgroundImage})`;
  } else if (useGradient) {
    backgroundStyle.background = `linear-gradient(135deg, ${safeGradientFrom}, ${safeGradientTo})`;
    backgroundStyle.backgroundImage = `linear-gradient(135deg, ${safeGradientFrom}, ${safeGradientTo})`;
  } else {
    backgroundStyle.backgroundColor = safeBackgroundColor;
  }

  if (textColor === 'custom' && customTextColor) {
    backgroundStyle.color = customTextColor;
  }

  return (
    <div 
      className={`relative ${sizeClasses[size as keyof typeof sizeClasses]} ${alignmentClasses[alignment as keyof typeof alignmentClasses]} ${getTextColor()}`}
      style={{
        ...backgroundStyle,
        zIndex: 1,
        position: 'relative',
        marginTop: '0'
      }}
    >
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity / 100 }}
        ></div>
      )}
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className={`${titleSizes[size as keyof typeof titleSizes]} font-bold mb-6 leading-tight`}>
            {title}
          </h1>
          
          {subtitle && (
            <p className={`text-lg md:text-xl mb-8 leading-relaxed ${
              textColor === 'white' ? 'text-gray-100' :
              textColor === 'black' ? 'text-gray-700' : ''
            }`}>
              {subtitle}
            </p>
          )}
          
          {buttonText && (
            <Button 
              size="lg" 
              className={`font-semibold px-8 py-3 ${
                textColor === 'white' 
                  ? 'bg-white text-blue-600 hover:bg-gray-100' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
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
  defaultProps: {
    title: 'Welcome to Your Website',
    subtitle: 'Create amazing experiences with our powerful tools',
    buttonText: 'Get Started',
    buttonLink: '#',
    backgroundColor: '#3B82F6',
    gradientFrom: '#3B82F6',
    gradientTo: '#8B5CF6',
    useGradient: true,
    textColor: 'white',
    customTextColor: '#FFFFFF',
    size: 'large',
    alignment: 'center',
    overlayOpacity: 40
  },
  render: (props) => <Hero {...props} />
};
