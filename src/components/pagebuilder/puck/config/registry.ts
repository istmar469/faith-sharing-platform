
import React from 'react';
import { ComponentConfig } from '@measured/puck';

// Simplified component config - no complex safety wrapping that breaks Puck's drag system
export const safeComponentConfig = (config: any, componentName: string): ComponentConfig<any> => {
  // Just return the config as-is with minimal safety checks
  if (!config || typeof config !== 'object') {
    console.warn(`${componentName}: Invalid config object, creating minimal fallback`);
    return {
      fields: {},
      defaultProps: {},
             render: () => React.createElement('div', { className: 'p-4 border border-gray-300 rounded text-gray-500' }, componentName)
    };
  }

  return {
    ...config,
    defaultProps: config.defaultProps || {},
    fields: config.fields || {}
  };
};
