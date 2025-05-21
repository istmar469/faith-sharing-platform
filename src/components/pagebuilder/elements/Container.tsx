
import React from 'react';

interface ContainerProps {
  width?: 'full' | 'wide' | 'narrow';
  padding?: 'none' | 'small' | 'medium' | 'large';
  backgroundColor?: string;
  backgroundType?: 'solid' | 'gradient' | 'image';
  backgroundGradient?: string;
  backgroundImage?: string;
  children?: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({ 
  width = 'full',
  padding = 'medium',
  backgroundColor = 'white',
  backgroundType = 'solid',
  backgroundGradient = 'linear-gradient(90deg, #f6d365 0%, #fda085 100%)',
  backgroundImage = '',
  children 
}) => {
  const widthClasses = {
    full: 'w-full',
    wide: 'max-w-4xl mx-auto',
    narrow: 'max-w-2xl mx-auto'
  };

  const paddingClasses = {
    none: 'p-0',
    small: 'p-2',
    medium: 'p-4',
    large: 'p-8'
  };

  // Determine background style based on backgroundType
  const getBackgroundStyle = () => {
    switch (backgroundType) {
      case 'gradient':
        return { background: backgroundGradient };
      case 'image':
        return backgroundImage 
          ? { 
              backgroundImage: `url(${backgroundImage})`, 
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            } 
          : { backgroundColor };
      case 'solid':
      default:
        return { backgroundColor };
    }
  };

  return (
    <div 
      className={`${widthClasses[width]} ${paddingClasses[padding]} min-h-[80px] transition-all border border-dashed border-gray-200`}
      style={getBackgroundStyle()}
    >
      {children || <div className="text-center text-gray-400">Drop elements into this container</div>}
    </div>
  );
};

export default Container;
