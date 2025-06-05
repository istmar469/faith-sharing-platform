
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

// Comprehensive default props to prevent any undefined values
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

// Ultra-safe prop processing to ensure no collision detection errors
const createSafeProps = (rawProps: any = {}): Required<HeroProps> => {
  const safeProps = { ...DEFAULT_PROPS };
  
  // Only process if rawProps is a valid object
  if (!rawProps || typeof rawProps !== 'object') {
    console.warn('Hero: Invalid props received, using defaults');
    return safeProps;
  }

  // Process each prop with extreme safety
  try {
    // String props
    if (typeof rawProps.title === 'string') safeProps.title = rawProps.title;
    if (typeof rawProps.subtitle === 'string') safeProps.subtitle = rawProps.subtitle;
    if (typeof rawProps.buttonText === 'string') safeProps.buttonText = rawProps.buttonText;
    if (typeof rawProps.buttonLink === 'string') safeProps.buttonLink = rawProps.buttonLink;
    if (typeof rawProps.backgroundImage === 'string') safeProps.backgroundImage = rawProps.backgroundImage;
    if (typeof rawProps.backgroundColor === 'string') safeProps.backgroundColor = rawProps.backgroundColor;
    if (typeof rawProps.gradientFrom === 'string') safeProps.gradientFrom = rawProps.gradientFrom;
    if (typeof rawProps.gradientTo === 'string') safeProps.gradientTo = rawProps.gradientTo;
    if (typeof rawProps.customTextColor === 'string') safeProps.customTextColor = rawProps.customTextColor;
    
    // Boolean props
    if (typeof rawProps.useGradient === 'boolean') safeProps.useGradient = rawProps.useGradient;
    
    // Enum props with validation
    if (['white', 'black', 'custom'].includes(rawProps.textColor)) {
      safeProps.textColor = rawProps.textColor;
    }
    if (['small', 'medium', 'large'].includes(rawProps.size)) {
      safeProps.size = rawProps.size;
    }
    if (['left', 'center', 'right'].includes(rawProps.alignment)) {
      safeProps.alignment = rawProps.alignment;
    }
    
    // Number props with validation
    if (typeof rawProps.overlayOpacity === 'number' && 
        !isNaN(rawProps.overlayOpacity) && 
        rawProps.overlayOpacity >= 0 && 
        rawProps.overlayOpacity <= 100) {
      safeProps.overlayOpacity = rawProps.overlayOpacity;
    }
  } catch (error) {
    console.error('Hero: Error processing props, using defaults:', error);
  }
  
  return safeProps;
};

export const Hero: React.FC<HeroProps> = (rawProps = {}) => {
  // Create completely safe props
  const props = createSafeProps(rawProps);

  console.log('Hero: Rendering with ultra-safe props');

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

  // Calculate text color safely
  const getTextColor = () => {
    switch (props.textColor) {
      case 'white': return 'text-white';
      case 'black': return 'text-gray-900';
      case 'custom': return '';
      default: return 'text-white';
    }
  };

  // Build background styles safely
  const backgroundStyle: React.CSSProperties = {
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  if (props.backgroundImage && props.backgroundImage.length > 0) {
    backgroundStyle.backgroundImage = `url(${props.backgroundImage})`;
  } else if (props.useGradient) {
    backgroundStyle.background = `linear-gradient(135deg, ${props.gradientFrom}, ${props.gradientTo})`;
  } else {
    backgroundStyle.backgroundColor = props.backgroundColor;
  }

  if (props.textColor === 'custom' && props.customTextColor) {
    backgroundStyle.color = props.customTextColor;
  }

  return (
    <div 
      className={`relative ${sizeClasses[props.size]} ${alignmentClasses[props.alignment]} ${getTextColor()}`}
      style={backgroundStyle}
      data-puck-component="hero"
    >
      {props.backgroundImage && props.backgroundImage.length > 0 && (
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: props.overlayOpacity / 100 }}
        />
      )}
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className={`${titleSizes[props.size]} font-bold mb-6 leading-tight`}>
            {props.title}
          </h1>
          
          {props.subtitle && props.subtitle.length > 0 && (
            <p className={`text-lg md:text-xl mb-8 leading-relaxed ${
              props.textColor === 'white' ? 'text-gray-100' :
              props.textColor === 'black' ? 'text-gray-700' : ''
            }`}>
              {props.subtitle}
            </p>
          )}
          
          {props.buttonText && props.buttonText.length > 0 && (
            <Button 
              size="lg" 
              className={`font-semibold px-8 py-3 ${
                props.textColor === 'white' 
                  ? 'bg-white text-blue-600 hover:bg-gray-100' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              asChild
            >
              <a href={props.buttonLink}>{props.buttonText}</a>
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
  defaultProps: DEFAULT_PROPS,
  render: (props) => {
    console.log('Hero: Config render called');
    return <Hero {...props} />;
  }
};
