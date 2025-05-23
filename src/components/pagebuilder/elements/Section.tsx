
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
    console.log('Section background type:', backgroundType);
    
    switch (backgroundType) {
      case 'gradient':
        console.log('Using gradient background:', backgroundGradient);
        return { background: backgroundGradient };
      case 'image':
        if (backgroundImage) {
          console.log('Using image background:', backgroundImage);
          return { 
            backgroundImage: `url(${backgroundImage})`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          };
        }
        console.log('Falling back to solid background:', backgroundColor);
        return { backgroundColor };
      case 'solid':
      default:
        console.log('Using solid background:', backgroundColor);
        return { backgroundColor };
    }
  };

  const backgroundStyle = getBackgroundStyle();
  console.log('Applied section styles:', backgroundStyle);

  return (
    <section 
      className={`w-full ${paddingClasses[padding]} min-h-[100px] transition-all`}
      style={backgroundStyle}
    >
      {children || <div className="text-center text-gray-400">Drop elements into this section</div>}
    </section>
  );
};

export default Section;
