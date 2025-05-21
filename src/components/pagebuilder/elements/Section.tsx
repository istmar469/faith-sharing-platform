
import React from 'react';

interface SectionProps {
  padding?: 'none' | 'small' | 'medium' | 'large';
  backgroundColor?: string;
  backgroundType?: 'solid' | 'gradient' | 'image';
  backgroundGradient?: string;
  backgroundImage?: string;
  children?: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ 
  padding = 'medium', 
  backgroundColor = 'white',
  backgroundType = 'solid',
  backgroundGradient = 'linear-gradient(90deg, #f6d365 0%, #fda085 100%)',
  backgroundImage = '',
  children 
}) => {
  const paddingClasses = {
    none: 'p-0',
    small: 'p-2',
    medium: 'p-6',
    large: 'p-10'
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
    <section 
      className={`w-full ${paddingClasses[padding]} min-h-[100px] transition-all`}
      style={getBackgroundStyle()}
    >
      {children || <div className="text-center text-gray-400">Drop elements into this section</div>}
    </section>
  );
};

export default Section;
