
import React from 'react';

// Enhanced safe property creation with collision detection protection
export const createSafeProps = (props: any, componentName: string = 'Unknown') => {
  console.log(`${componentName}: Creating safe props from:`, props);
  
  if (!props || typeof props !== 'object') {
    console.warn(`${componentName}: Invalid props, using defaults`);
    return getDefaultPropsForComponent(componentName);
  }

  const safeProps: any = {};
  
  try {
    Object.entries(props).forEach(([key, value]) => {
      // Skip internal or problematic keys
      if (key.startsWith('__') || key === 'constructor' || key === 'prototype') {
        return;
      }
      
      // Handle null/undefined values - critical for collision detection
      if (value === null || value === undefined) {
        safeProps[key] = getDefaultValueForKey(key);
        return;
      }
      
      // Handle primitive values
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        safeProps[key] = value;
        return;
      }
      
      // Handle functions - skip them completely
      if (typeof value === 'function') {
        console.warn(`${componentName}: Skipping function prop: ${key}`);
        return;
      }
      
      // Handle arrays with enhanced safety
      if (Array.isArray(value)) {
        safeProps[key] = value.map((item, index) => {
          if (item === null || item === undefined) return '';
          if (typeof item === 'object') {
            try {
              // Test serialization to ensure drag safety
              const serialized = JSON.stringify(item);
              return serialized ? item : {};
            } catch (error) {
              console.warn(`${componentName}: Array item ${index} serialization failed`);
              return {};
            }
          }
          return item;
        });
        return;
      }
      
      // Handle objects with collision detection safety
      if (typeof value === 'object') {
        try {
          // First test if the object can be serialized (required for drag operations)
          const testSerialization = JSON.stringify(value);
          if (!testSerialization || testSerialization === 'undefined') {
            safeProps[key] = {};
            return;
          }
          
          // Recursively create safe props for nested objects
          safeProps[key] = createSafeProps(value, `${componentName}.${key}`);
        } catch (error) {
          console.warn(`${componentName}: Object serialization failed for ${key}:`, error);
          safeProps[key] = {};
        }
        return;
      }
      
      // Handle other types with toString safety
      try {
        const stringValue = String(value);
        if (stringValue && stringValue !== '[object Object]' && stringValue !== 'undefined') {
          safeProps[key] = stringValue;
        } else {
          safeProps[key] = getDefaultValueForKey(key);
        }
      } catch (error) {
        console.warn(`${componentName}: toString failed for ${key}:`, error);
        safeProps[key] = getDefaultValueForKey(key);
      }
    });
    
    // Ensure essential props exist
    const essentialProps = getEssentialPropsForComponent(componentName);
    Object.entries(essentialProps).forEach(([key, defaultValue]) => {
      if (!(key in safeProps) || safeProps[key] === null || safeProps[key] === undefined) {
        safeProps[key] = defaultValue;
      }
    });
    
    // Final validation - ensure all props can be safely serialized
    try {
      const finalTest = JSON.stringify(safeProps);
      if (!finalTest) {
        console.error(`${componentName}: Final serialization test failed`);
        return getDefaultPropsForComponent(componentName);
      }
    } catch (error) {
      console.error(`${componentName}: Final validation failed:`, error);
      return getDefaultPropsForComponent(componentName);
    }
    
    console.log(`${componentName}: Safe props created:`, Object.keys(safeProps));
    return safeProps;
    
  } catch (error) {
    console.error(`${componentName}: Critical error in createSafeProps:`, error);
    return getDefaultPropsForComponent(componentName);
  }
};

// Get default value for specific property keys
function getDefaultValueForKey(key: string): any {
  switch (key.toLowerCase()) {
    case 'title':
    case 'heading':
    case 'text':
    case 'content':
    case 'label':
      return 'Default Text';
    case 'url':
    case 'link':
    case 'href':
      return '#';
    case 'src':
    case 'image':
    case 'backgroundimage':
      return '';
    case 'color':
    case 'textcolor':
    case 'backgroundcolor':
      return '#000000';
    case 'size':
    case 'width':
    case 'height':
      return 'auto';
    case 'alignment':
    case 'align':
      return 'left';
    case 'show':
    case 'visible':
    case 'enabled':
      return true;
    case 'items':
    case 'list':
    case 'options':
    case 'navigation':
      return [];
    default:
      return '';
  }
}

// Get essential props that components need to function
function getEssentialPropsForComponent(componentName: string): Record<string, any> {
  switch (componentName) {
    case 'Hero':
      return {
        title: 'Welcome',
        subtitle: 'Hero subtitle',
        backgroundImage: '',
        buttonText: 'Learn More',
        buttonLink: '#'
      };
    case 'TextBlock':
      return {
        content: 'Default text content',
        size: 'medium',
        alignment: 'left'
      };
    case 'Image':
      return {
        src: '',
        alt: 'Image',
        width: '100%',
        height: 'auto'
      };
    case 'Header':
    case 'EnhancedHeader':
      return {
        title: 'Site Title',
        logoText: 'My Site',
        navigation: []
      };
    case 'Footer':
      return {
        copyright: '© 2024 All rights reserved',
        links: []
      };
    case 'ServiceTimes':
      return {
        title: 'Service Times',
        customTimes: [],
        layout: 'list'
      };
    case 'ContactInfo':
      return {
        title: 'Contact Us',
        layout: 'vertical'
      };
    default:
      return {
        content: 'Default content',
        title: 'Default title'
      };
  }
}

// Get complete default props for a component
function getDefaultPropsForComponent(componentName: string): Record<string, any> {
  const essential = getEssentialPropsForComponent(componentName);
  
  // Add common safe defaults
  return {
    ...essential,
    id: `${componentName.toLowerCase()}-${Date.now()}`,
    className: '',
    style: {},
    'data-component': componentName
  };
}

// Enhanced component wrapper that prevents collision detection errors
export const createSafeComponentWrapper = (Component: any, componentName: string) => {
  return React.forwardRef<any, any>((props, ref) => {
    try {
      // Create collision-safe props
      const safeProps = createSafeProps(props, componentName);
      
      // Add collision detection safety attributes
      const enhancedProps = {
        ...safeProps,
        ref,
        'data-puck-component': componentName,
        'data-collision-safe': 'true',
        // Ensure toString method exists and is safe
        toString: () => `[${componentName} Component]`,
        // Add safe prop access for drag operations
        valueOf: () => componentName
      };
      
      // Wrap in error boundary for additional safety
      return React.createElement(
        'div',
        {
          'data-component-wrapper': componentName,
          style: { position: 'relative' },
          onDragStart: (e) => {
            // Ensure safe drag data
            try {
              e.dataTransfer?.setData('text/plain', componentName);
            } catch (error) {
              console.warn(`${componentName}: Drag data setting failed:`, error);
              e.preventDefault();
            }
          }
        },
        React.createElement(Component, enhancedProps)
      );
      
    } catch (error) {
      console.error(`${componentName}: Component wrapper error:`, error);
      
      // Return safe fallback
      return React.createElement(
        'div',
        {
          className: 'p-4 border border-dashed border-gray-300 bg-gray-50 rounded',
          'data-component': componentName,
          'data-error': 'true'
        },
        React.createElement('h3', { className: 'font-medium text-gray-700' }, componentName),
        React.createElement('p', { className: 'text-sm text-gray-500' }, 'Component error - using fallback')
      );
    }
  });
};
