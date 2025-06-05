
import React from 'react';
import { getDefaultPropsForComponent } from './defaultProps';
import { createFallbackRenderer } from './fallbacks';

// Create safe props object with defensive programming
export const createSafeProps = (props: any, componentName: string): any => {
  if (!props || typeof props !== 'object') {
    console.warn(`${componentName}: Invalid props, using defaults`);
    return getDefaultPropsForComponent(componentName);
  }

  const safeProps: any = {};
  const defaultProps = getDefaultPropsForComponent(componentName);

  // Process each prop safely
  Object.keys({ ...defaultProps, ...props }).forEach(key => {
    const value = props[key];
    const defaultValue = defaultProps[key] || '';

    if (value === null || value === undefined) {
      safeProps[key] = defaultValue;
      return;
    }

    // Handle different types safely
    if (typeof value === 'string') {
      safeProps[key] = value;
    } else if (typeof value === 'number') {
      safeProps[key] = isNaN(value) ? defaultValue : value;
    } else if (typeof value === 'boolean') {
      safeProps[key] = value;
    } else if (Array.isArray(value)) {
      try {
        // Ensure arrays can be stringified
        JSON.stringify(value);
        safeProps[key] = value;
      } catch (error) {
        console.warn(`${componentName}: Invalid array prop ${key}, using default`);
        safeProps[key] = defaultValue;
      }
    } else if (typeof value === 'object') {
      try {
        // Ensure objects can be stringified
        JSON.stringify(value);
        safeProps[key] = value;
      } catch (error) {
        console.warn(`${componentName}: Invalid object prop ${key}, using default`);
        safeProps[key] = defaultValue;
      }
    } else {
      // For any other type, try to convert to string safely
      try {
        const stringValue = String(value);
        if (stringValue === '[object Object]' || stringValue === 'undefined') {
          safeProps[key] = defaultValue;
        } else {
          safeProps[key] = stringValue;
        }
      } catch (error) {
        console.warn(`${componentName}: Cannot convert prop ${key} to string, using default`);
        safeProps[key] = defaultValue;
      }
    }
  });

  return safeProps;
};

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
