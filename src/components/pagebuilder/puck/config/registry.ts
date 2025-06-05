
import { ComponentConfig } from '@measured/puck';
import { getDefaultPropsForComponent } from './safety/defaultProps';
import { createFallbackRenderer, createSafeRenderWrapper } from './safety/fallbacks';

// Simplified component config that doesn't interfere with Puck's serialization
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

  // Use the original defaultProps without transformation
  const safeDefaultProps = {
    ...getDefaultPropsForComponent(componentName),
    ...(config.defaultProps || {})
  };

  // Create a safe wrapper around the original render function
  const originalRender = config.render;
  const safeRender = originalRender ? createSafeRenderWrapper(originalRender, componentName) : createFallbackRenderer(componentName);

  return {
    ...config,
    defaultProps: safeDefaultProps,
    render: safeRender,
    fields: config.fields || {}
  };
};
