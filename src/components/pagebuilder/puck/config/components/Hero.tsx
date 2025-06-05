
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

// Safe defaults to prevent collision detection errors
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

// Safe prop processing function
const processSafeProps = (rawProps: Partial<HeroProps> = {}): Required<HeroProps> => {
  const safeProps = { ...DEFAULT_PROPS };
  
  // Safely process each prop to ensure no undefined values
  Object.keys(DEFAULT_PROPS).forEach(key => {
    const propKey = key as keyof HeroProps;
    const value = rawProps[propKey];
    
    if (value !== null && value !== undefined) {
      // Type-safe assignment based on expected types
      switch (propKey) {
        case 'title':
        case 'subtitle':
        case 'buttonText':
        case 'buttonLink':
        case 'backgroundImage':
        case 'backgroundColor':
        case 'gradientFrom':
        case 'gradientTo':
        case 'customTextColor':
          safeProps[propKey] = String(value || DEFAULT_PROPS[propKey]);
          break;
        case 'useGradient':
          safeProps[propKey] = Boolean(value);
          break;
        case 'textColor':
          safeProps[propKey] = ['white', 'black', 'custom'].includes(value as string) 
            ? (value as any) 
            : DEFAULT_PROPS[propKey];
          break;
        case 'size':
          safeProps[propKey] = ['small', 'medium', 'large'].includes(value as string) 
            ? (value as any) 
            : DEFAULT_PROPS[propKey];
          break;
        case 'alignment':
          safeProps[propKey] = ['left', 'center', 'right'].includes(value as string) 
            ? (value as any) 
            : DEFAULT_PROPS[propKey];
          break;
        case 'overlayOpacity':
          const numValue = Number(value);
          safeProps[propKey] = !isNaN(numValue) && numValue >= 0 && numValue <= 100 
            ? numValue 
            : DEFAULT_PROPS[propKey];
          break;
        default:
          break;
      }
    }
  });
  
  return safeProps;
};

export const Hero: React.FC<HeroProps> = (rawProps = {}) => {
  // Process props safely to prevent collision detection errors
  const props = processSafeProps(rawProps);

  console.log('Hero: Rendering with processed safe props:', Object.keys(props));

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

  // Calculate text color using safe props
  const getTextColor = () => {
    switch (props.textColor) {
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

  // Build background styles using safe props
  const backgroundStyle: React.CSSProperties = {
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  if (props.backgroundImage) {
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
      {props.backgroundImage && (
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: props.overlayOpacity / 100 }}
        ></div>
      )}
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className={`${titleSizes[props.size]} font-bold mb-6 leading-tight`}>
            {props.title}
          </h1>
          
          {props.subtitle && (
            <p className={`text-lg md:text-xl mb-8 leading-relaxed ${
              props.textColor === 'white' ? 'text-gray-100' :
              props.textColor === 'black' ? 'text-gray-700' : ''
            }`}>
              {props.subtitle}
            </p>
          )}
          
          {props.buttonText && (
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
    console.log('Hero: Config render called with:', props);
    return <Hero {...props} />;
  }
};
