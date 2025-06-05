import React from 'react';

// Global component wrapper to ensure no undefined props reach collision detection
export const withSafeProps = <T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  componentName: string,
  defaultProps: T
) => {
  return React.forwardRef<any, T>((props, ref) => {
    // Create ultra-safe props by ensuring every value is defined
    const safeProps = { ...defaultProps };
    
    if (props && typeof props === 'object') {
      Object.keys(props).forEach(key => {
        const value = props[key];
        
        // Only assign if value is not null or undefined
        if (value !== null && value !== undefined) {
          // For objects, ensure they can be serialized
          if (typeof value === 'object') {
            try {
              JSON.stringify(value);
              safeProps[key] = value;
            } catch (error) {
              console.warn(`${componentName}: Skipping non-serializable prop ${key}`);
            }
          } else {
            safeProps[key] = value;
          }
        }
      });
    }
    
    console.log(`${componentName}: Wrapped with safe props`);
    
    return <Component ref={ref} {...safeProps} />;
  });
};

// Utility to make any object completely safe for Puck's collision detection
export const makePropsSafe = (props: any, fallback: any = {}) => {
  if (!props || typeof props !== 'object') {
    return fallback;
  }
  
  const safeProps = { ...fallback };
  
  Object.keys(props).forEach(key => {
    const value = props[key];
    
    if (value === null || value === undefined) {
      // Keep fallback value
      return;
    }
    
    if (typeof value === 'object') {
      try {
        JSON.stringify(value);
        safeProps[key] = value;
      } catch (error) {
        console.warn(`makePropsSafe: Skipping non-serializable prop ${key}`);
      }
    } else {
      safeProps[key] = value;
    }
  });
  
  return safeProps;
};
