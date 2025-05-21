
import React from 'react';

interface ContainerProps {
  width?: 'full' | 'wide' | 'narrow';
  padding?: 'none' | 'small' | 'medium' | 'large';
  children?: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({ 
  width = 'full',
  padding = 'medium',
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

  return (
    <div className={`${widthClasses[width]} ${paddingClasses[padding]}`}>
      {children || <div className="text-center text-gray-400">Add elements to this container</div>}
    </div>
  );
};

export default Container;
