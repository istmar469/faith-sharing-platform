
import React from 'react';
import { createSafeProps } from './wrappers';

// Create a safe wrapper around any render function to prevent toString errors
export const createSafeRenderWrapper = (originalRender: any, componentName: string) => {
  return (props: any) => {
    try {
      // Make props safe before passing to the component
      const safeProps = createSafeProps(props || {}, componentName);
      
      console.log(`${componentName}: Rendering with safe props:`, Object.keys(safeProps));
      
      // Call the original render function with safe props
      return originalRender(safeProps);
    } catch (error) {
      console.error(`${componentName}: Error in safe render wrapper:`, error);
      
      // Return fallback if the component itself crashes
      return createFallbackRenderer(componentName)(props);
    }
  };
};

// Create a fallback renderer for components
export const createFallbackRenderer = (componentName: string) => {
  return (props: any) => {
    try {
      // Ensure all props are string-safe before rendering
      const safeProps = Object.fromEntries(
        Object.entries(props || {}).map(([key, value]) => [
          key,
          value === null || value === undefined ? '' :
          typeof value === 'object' ? JSON.stringify(value) :
          String(value)
        ])
      );

      return React.createElement('div', {
        className: 'p-4 border border-dashed border-gray-300 text-gray-500 text-center bg-gray-50 rounded',
        'data-component': componentName,
        'data-safe-props': JSON.stringify(safeProps)
      }, [
        React.createElement('h3', { 
          key: 'title',
          className: 'font-medium text-gray-700 mb-2' 
        }, `${componentName} Component`),
        React.createElement('p', { 
          key: 'content',
          className: 'text-sm text-gray-500' 
        }, safeProps.content || safeProps.text || safeProps.title || 'Component content')
      ]);
    } catch (error) {
      console.error(`${componentName}: Error in fallback renderer:`, error);
      return React.createElement('div', {
        className: 'p-4 border border-red-300 text-red-500 text-center bg-red-50 rounded'
      }, `Error rendering ${componentName}`);
    }
  };
};
