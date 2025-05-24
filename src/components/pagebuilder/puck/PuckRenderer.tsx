
import React from 'react';
import { Render } from '@measured/puck';
import { puckConfig } from './config/PuckConfig';

interface PuckRendererProps {
  data: any;
  className?: string;
}

const PuckRenderer: React.FC<PuckRendererProps> = ({ data, className }) => {
  // Handle empty or invalid data
  if (!data || !data.content) {
    return (
      <div className={`prose max-w-none ${className || ''}`}>
        <p className="text-gray-500">No content to display</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <Render config={puckConfig} data={data} />
    </div>
  );
};

export default PuckRenderer;
