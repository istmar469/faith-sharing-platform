
import React from 'react';

interface GridProps {
  columns?: number;
  gap?: 'none' | 'small' | 'medium' | 'large';
  children?: React.ReactNode;
}

const Grid: React.FC<GridProps> = ({ 
  columns = 2, 
  gap = 'medium',
  children
}) => {
  const gapClasses = {
    none: 'gap-0',
    small: 'gap-2',
    medium: 'gap-4',
    large: 'gap-8'
  };

  return (
    <div 
      className={`grid grid-cols-${columns} ${gapClasses[gap]}`}
    >
      {children || (
        <>
          {[...Array(columns)].map((_, index) => (
            <div key={index} className="bg-gray-100 h-24 rounded flex items-center justify-center text-gray-400">
              Column {index + 1}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Grid;
