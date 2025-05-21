
import React from 'react';

interface SectionProps {
  padding?: 'none' | 'small' | 'medium' | 'large';
  backgroundColor?: string;
  children?: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ 
  padding = 'medium', 
  backgroundColor = 'white',
  children 
}) => {
  const paddingClasses = {
    none: 'p-0',
    small: 'p-2',
    medium: 'p-6',
    large: 'p-10'
  };

  return (
    <section 
      className={`w-full ${paddingClasses[padding]}`}
      style={{ backgroundColor }}
    >
      {children || <div className="text-center text-gray-400">Add elements to this section</div>}
    </section>
  );
};

export default Section;
