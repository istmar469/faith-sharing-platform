import React from 'react';
import { ComponentConfig } from '@measured/puck';

export interface CallToActionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  backgroundType?: 'solid' | 'gradient' | 'image';
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  backgroundImage?: string;
  textColor?: string;
  buttonStyle?: 'filled' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  alignment?: 'left' | 'center' | 'right';
  showIcon?: boolean;
  icon?: string;
}

export const CallToAction: React.FC<CallToActionProps> = ({
  title = "Ready to Transform Your Church?",
  subtitle = "Join thousands of churches already using our platform",
  description = "Start building beautiful websites, managing your congregation, and growing your community with our comprehensive church management platform.",
  primaryButtonText = "Start Free Trial",
  primaryButtonUrl = "/signup",
  secondaryButtonText = "Watch Demo",
  secondaryButtonUrl = "/demo",
  backgroundType = "gradient",
  backgroundColor = "#1e40af",
  gradientFrom = "#1e40af",
  gradientTo = "#7c3aed",
  backgroundImage,
  textColor = "#ffffff",
  buttonStyle = "filled",
  size = "large",
  alignment = "center",
  showIcon = true,
  icon = "🚀"
}) => {
  const getBackgroundStyle = () => {
    switch (backgroundType) {
      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`
        };
      case 'image':
        return {
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      default:
        return {
          backgroundColor
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'py-12 px-6';
      case 'large':
        return 'py-24 px-6';
      default:
        return 'py-16 px-6';
    }
  };

  const getAlignmentClasses = () => {
    switch (alignment) {
      case 'left':
        return 'text-left';
      case 'right':
        return 'text-right';
      default:
        return 'text-center';
    }
  };

  const getButtonClasses = (isPrimary: boolean) => {
    const baseClasses = "inline-flex items-center px-6 py-3 text-base font-medium rounded-lg transition-all duration-200 transform hover:scale-105";
    
    if (isPrimary) {
      switch (buttonStyle) {
        case 'outline':
          return `${baseClasses} border-2 border-white text-white hover:bg-white hover:text-gray-900`;
        case 'ghost':
          return `${baseClasses} text-white hover:bg-white hover:bg-opacity-20`;
        default:
          return `${baseClasses} bg-white text-gray-900 hover:bg-gray-100 shadow-lg`;
      }
    } else {
      return `${baseClasses} border-2 border-white border-opacity-50 text-white hover:border-opacity-100 hover:bg-white hover:bg-opacity-10`;
    }
  };

  return (
    <section 
      className={`relative overflow-hidden ${getSizeClasses()}`}
      style={{ ...getBackgroundStyle(), color: textColor }}
    >
      {backgroundType === 'image' && (
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      )}
      
      <div className="relative max-w-4xl mx-auto">
        <div className={getAlignmentClasses()}>
          {showIcon && icon && (
            <div className="text-4xl mb-4">
              {icon}
            </div>
          )}
          
          {subtitle && (
            <p className="text-lg font-medium mb-2 opacity-90">
              {subtitle}
            </p>
          )}
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            {title}
          </h2>
          
          {description && (
            <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {primaryButtonText && (
              <a
                href={primaryButtonUrl}
                className={getButtonClasses(true)}
              >
                {primaryButtonText}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            )}
            
            {secondaryButtonText && (
              <a
                href={secondaryButtonUrl}
                className={getButtonClasses(false)}
              >
                <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {secondaryButtonText}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export const callToActionConfig: ComponentConfig<CallToActionProps> = {
  render: (props: CallToActionProps) => <CallToAction {...props} />,
  fields: {
    title: {
      type: 'text',
      label: 'Title'
    },
    subtitle: {
      type: 'text',
      label: 'Subtitle'
    },
    description: {
      type: 'textarea',
      label: 'Description'
    },
    primaryButtonText: {
      type: 'text',
      label: 'Primary Button Text'
    },
    primaryButtonUrl: {
      type: 'text',
      label: 'Primary Button URL'
    },
    secondaryButtonText: {
      type: 'text',
      label: 'Secondary Button Text'
    },
    secondaryButtonUrl: {
      type: 'text',
      label: 'Secondary Button URL'
    },
    backgroundType: {
      type: 'select',
      label: 'Background Type',
      options: [
        { label: 'Solid Color', value: 'solid' },
        { label: 'Gradient', value: 'gradient' },
        { label: 'Image', value: 'image' }
      ]
    },
    backgroundColor: {
      type: 'text',
      label: 'Background Color'
    },
    gradientFrom: {
      type: 'text',
      label: 'Gradient Start Color'
    },
    gradientTo: {
      type: 'text',
      label: 'Gradient End Color'
    },
    backgroundImage: {
      type: 'text',
      label: 'Background Image URL'
    },
    textColor: {
      type: 'text',
      label: 'Text Color'
    },
    buttonStyle: {
      type: 'select',
      label: 'Button Style',
      options: [
        { label: 'Filled', value: 'filled' },
        { label: 'Outline', value: 'outline' },
        { label: 'Ghost', value: 'ghost' }
      ]
    },
    size: {
      type: 'select',
      label: 'Section Size',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' }
      ]
    },
    alignment: {
      type: 'select',
      label: 'Text Alignment',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' }
      ]
    },
    showIcon: {
      type: 'radio',
      label: 'Show Icon',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    },
    icon: {
      type: 'text',
      label: 'Icon (emoji or text)'
    }
  },
  defaultProps: {
    title: "Ready to Transform Your Church?",
    subtitle: "Join thousands of churches already using our platform",
    description: "Start building beautiful websites, managing your congregation, and growing your community with our comprehensive church management platform.",
    primaryButtonText: "Start Free Trial",
    primaryButtonUrl: "/signup",
    secondaryButtonText: "Watch Demo",
    secondaryButtonUrl: "/demo",
    backgroundType: "gradient",
    backgroundColor: "#1e40af",
    gradientFrom: "#1e40af",
    gradientTo: "#7c3aed",
    textColor: "#ffffff",
    buttonStyle: "filled",
    size: "large",
    alignment: "center",
    showIcon: true,
    icon: "🚀"
  }
}; 