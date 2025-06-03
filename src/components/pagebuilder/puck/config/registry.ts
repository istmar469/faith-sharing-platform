
import { ComponentConfig } from '@measured/puck';
import { getDefaultPropsForComponent } from './safety/defaultProps';
import { createFallbackRenderer, createSafeRenderWrapper } from './safety/fallbacks';

// Safe wrapper to ensure all component configs have proper structure
export const safeComponentConfig = (config: any, componentName: string): ComponentConfig<any> => {
  // Ensure config is an object
  if (!config || typeof config !== 'object') {
    console.warn(`${componentName}: Invalid config object, creating fallback`);
    return {
      fields: {},
      defaultProps: getDefaultPropsForComponent(componentName),
      render: createFallbackRenderer(componentName)
    };
  }

  // Ensure defaultProps exist and are safe
  const safeDefaultProps = {
    ...getDefaultPropsForComponent(componentName),
    ...(config.defaultProps || {})
  };

  // Convert all default props to string-safe values
  const stringifiedDefaultProps = Object.fromEntries(
    Object.entries(safeDefaultProps).map(([key, value]) => {
      if (value === null || value === undefined) {
        return [key, ''];
      }
      if (typeof value === 'object') {
        try {
          return [key, JSON.stringify(value)];
        } catch (error) {
          console.warn(`${componentName}: Cannot stringify object prop ${key}:`, error);
          return [key, ''];
        }
      }
      // For GridBlock component, ensure boolean values are properly handled
      if (componentName === 'GridBlock' && typeof value === 'boolean') {
        return [key, value];
      }
      // For GridBlock component, ensure number values are properly handled
      if (componentName === 'GridBlock' && typeof value === 'number') {
        return [key, value];
      }
      try {
        return [key, String(value)];
      } catch (error) {
        console.warn(`${componentName}: Cannot convert prop ${key} to string:`, error);
        return [key, ''];
      }
    })
  );

  // Create a safe wrapper around the original render function
  const originalRender = config.render;
  const safeRender = originalRender ? createSafeRenderWrapper(originalRender, componentName) : createFallbackRenderer(componentName);

  return {
    ...config,
    defaultProps: stringifiedDefaultProps,
    render: safeRender,
    fields: config.fields || {}
  };
};
