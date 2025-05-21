
import React from 'react';

interface HeadingProps {
  text: string;
  size?: 'small' | 'medium' | 'large' | 'xl';
}

const Heading: React.FC<HeadingProps> = ({ text = 'Heading', size = 'large' }) => {
  const sizeClasses = {
    small: 'text-lg font-medium',
    medium: 'text-xl font-semibold',
    large: 'text-2xl font-bold',
    xl: 'text-3xl font-bold'
  };

  return (
    <h2 className={sizeClasses[size]}>{text}</h2>
  );
};

export default Heading;
