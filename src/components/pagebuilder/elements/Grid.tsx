
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

  // Convert columns number to appropriate Tailwind class
  const getColumnsClass = (cols: number) => {
    const validColumns = Math.min(Math.max(1, cols), 12); // Ensure columns are between 1-12
    return `grid-cols-${validColumns}`;
  };

  const columnsClass = getColumnsClass(columns);

  // Check if there are any children
  const hasChildren = React.Children.count(children) > 0;

  return (
    <div className={`grid ${columnsClass} ${gapClasses[gap]} min-h-[80px]`}>
      {hasChildren ? children : (
        <>
          {[...Array(columns)].map((_, index) => (
            <div key={index} className="bg-gray-50 border border-dashed border-gray-200 p-4 min-h-[80px] rounded flex items-center justify-center text-gray-400">
              Drop elements here
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Grid;
