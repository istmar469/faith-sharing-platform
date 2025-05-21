
import React from 'react';

interface CardProps {
  padding?: 'none' | 'small' | 'medium' | 'large';
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ 
  padding = 'medium',
  children 
}) => {
  const paddingClasses = {
    none: 'p-0',
    small: 'p-3',
    medium: 'p-5',
    large: 'p-8'
  };

  return (
    <div className={`border rounded-lg shadow-sm ${paddingClasses[padding]}`}>
      {children || <div className="text-center text-gray-400">Card content</div>}
    </div>
  );
};

export default Card;
