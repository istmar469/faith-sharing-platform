import React from 'react';
import { Render } from '@measured/puck';
import { puckConfig } from './config/PuckConfig';

interface PuckRendererProps {
  data: any;
  className?: string;
}

const PuckRenderer: React.FC<PuckRendererProps> = ({ data, className }) => {
  console.log('PuckRenderer: Received data:', data);
  console.log('PuckRenderer: Data type:', typeof data);
  console.log('PuckRenderer: Has content:', !!data?.content);
  
  // Handle empty or invalid data
  if (!data) {
    console.log('PuckRenderer: No data provided');
    return (
      <div className={`p-8 text-center ${className || ''}`}>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Content</h2>
        <p className="text-gray-500">No page data was provided</p>
      </div>
    );
  }

  if (!data.content) {
    console.log('PuckRenderer: No content array in data');
    return (
      <div className={`p-8 text-center ${className || ''}`}>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Empty Page</h2>
        <p className="text-gray-500">This page has no content yet</p>
      </div>
    );
  }

  if (!Array.isArray(data.content)) {
    console.log('PuckRenderer: Content is not an array:', data.content);
    return (
      <div className={`p-8 text-center ${className || ''}`}>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Content</h2>
        <p className="text-gray-500">Page content format is invalid</p>
      </div>
    );
  }

  if (data.content.length === 0) {
    console.log('PuckRenderer: Content array is empty');
    return (
      <div className={`p-8 text-center ${className || ''}`}>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Empty Page</h2>
        <p className="text-gray-500">This page doesn't have any content blocks yet</p>
      </div>
    );
  }

  console.log('PuckRenderer: Rendering with', data.content.length, 'content blocks');

  try {
    return (
      <div className={className}>
        <Render config={puckConfig} data={data} />
      </div>
    );
  } catch (error) {
    console.error('PuckRenderer: Error rendering content:', error);
    return (
      <div className={`p-8 text-center ${className || ''}`}>
        <h2 className="text-xl font-semibold text-red-600 mb-2">Render Error</h2>
        <p className="text-gray-500">Failed to render page content</p>
        <pre className="mt-4 text-xs text-gray-400 bg-gray-100 p-2 rounded">
          {error instanceof Error ? error.message : 'Unknown error'}
        </pre>
      </div>
    );
  }
};

export default PuckRenderer;
