import React from 'react';

export interface FlexItemProps {
  // Flex Layout Behavior
  layoutBehavior?: 'full-width' | 'flex-item';
  
  // Flex Item Properties
  flexBasis?: string;
  flexGrow?: number;
  flexShrink?: number;
  
  // Size Constraints
  minWidth?: string;
  maxWidth?: string;
  width?: string;
  
  // Alignment (overrides container alignment for this item)
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  
  // Spacing
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  
  // Custom classes
  customClasses?: string;
}

export interface FlexItemWrapperProps extends FlexItemProps {
  children: React.ReactNode;
  className?: string;
}

export const FlexItemWrapper: React.FC<FlexItemWrapperProps> = ({
  children,
  className = '',
  layoutBehavior = 'flex-item',
  flexBasis = 'auto',
  flexGrow = 1,
  flexShrink = 1,
  minWidth,
  maxWidth,
  width,
  alignSelf = 'auto',
  marginTop = 0,
  marginBottom = 0,
  marginLeft = 0,
  marginRight = 0,
  customClasses = ''
}) => {
  const isFlexItem = layoutBehavior === 'flex-item';
  
  const style: React.CSSProperties = {
    // Apply flex properties when in flex-item mode
    ...(isFlexItem && {
      flex: `${flexGrow} ${flexShrink} ${flexBasis}`,
      alignSelf: alignSelf !== 'auto' ? alignSelf : undefined,
    }),
    
    // Size constraints - FIXED: Apply regardless of layout behavior for proper sizing
    minWidth,
    maxWidth,
    width: layoutBehavior === 'full-width' ? '100%' : width,
    
    // Ensure we don't exceed the container
    boxSizing: 'border-box',
    
    // Spacing
    marginTop: marginTop ? `${marginTop}px` : undefined,
    marginBottom: marginBottom ? `${marginBottom}px` : undefined,
    marginLeft: marginLeft ? `${marginLeft}px` : undefined,
    marginRight: marginRight ? `${marginRight}px` : undefined,
  };

  const wrapperClasses = [
    className,
    customClasses,
    // Add flex utility classes based on behavior
    layoutBehavior === 'full-width' ? 'w-full' : '',
    isFlexItem ? 'flex-shrink-0' : '' // Prevent unwanted shrinking
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={wrapperClasses}
      style={style}
      data-layout-behavior={layoutBehavior}
      data-flex-item={isFlexItem}
    >
      {children}
    </div>
  );
};

// Common flex item field configurations for component configs
export const flexItemFields = {
  layoutBehavior: {
    type: 'select' as const,
    label: 'Layout Behavior',
    options: [
      { label: 'Flex Item (Share Space)', value: 'flex-item' },
      { label: 'Full Width (Full Row)', value: 'full-width' }
    ]
  },
  flexBasis: {
    type: 'select' as const,
    label: 'Flex Basis (Initial Size)',
    options: [
      { label: 'Auto', value: 'auto' },
      { label: '25%', value: '25%' },
      { label: '33.33%', value: '33.33%' },
      { label: '50%', value: '50%' },
      { label: '66.67%', value: '66.67%' },
      { label: '75%', value: '75%' },
      { label: '100%', value: '100%' },
      { label: '200px', value: '200px' },
      { label: '300px', value: '300px' },
      { label: '400px', value: '400px' }
    ]
  },
  flexGrow: {
    type: 'number' as const,
    label: 'Flex Grow (Expansion)',
    min: 0,
    max: 10
  },
  flexShrink: {
    type: 'number' as const,
    label: 'Flex Shrink (Compression)',
    min: 0,
    max: 10
  },
  minWidth: {
    type: 'select' as const,
    label: 'Min Width',
    options: [
      { label: 'None', value: '' },
      { label: '100px', value: '100px' },
      { label: '150px', value: '150px' },
      { label: '200px', value: '200px' },
      { label: '250px', value: '250px' },
      { label: '300px', value: '300px' },
      { label: '25%', value: '25%' },
      { label: '33%', value: '33.33%' },
      { label: '50%', value: '50%' }
    ]
  },
  maxWidth: {
    type: 'select' as const,
    label: 'Max Width',
    options: [
      { label: 'None', value: '' },
      { label: '200px', value: '200px' },
      { label: '300px', value: '300px' },
      { label: '400px', value: '400px' },
      { label: '500px', value: '500px' },
      { label: '600px', value: '600px' },
      { label: '25%', value: '25%' },
      { label: '33%', value: '33.33%' },
      { label: '50%', value: '50%' },
      { label: '75%', value: '75%' }
    ]
  },
  alignSelf: {
    type: 'select' as const,
    label: 'Align Self',
    options: [
      { label: 'Auto (Use Container Setting)', value: 'auto' },
      { label: 'Start', value: 'flex-start' },
      { label: 'End', value: 'flex-end' },
      { label: 'Center', value: 'center' },
      { label: 'Baseline', value: 'baseline' },
      { label: 'Stretch', value: 'stretch' }
    ]
  },
  marginTop: {
    type: 'number' as const,
    label: 'Margin Top (px)',
    min: 0,
    max: 100
  },
  marginBottom: {
    type: 'number' as const,
    label: 'Margin Bottom (px)',
    min: 0,
    max: 100
  },
  marginLeft: {
    type: 'number' as const,
    label: 'Margin Left (px)',
    min: 0,
    max: 100
  },
  marginRight: {
    type: 'number' as const,
    label: 'Margin Right (px)',
    min: 0,
    max: 100
  }
};

// Default flex item props - FIXED: Better defaults for side-by-side layout
export const defaultFlexItemProps: FlexItemProps = {
  layoutBehavior: 'flex-item',
  flexBasis: 'auto',
  flexGrow: 1,
  flexShrink: 1,
  alignSelf: 'auto',
  marginTop: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
  customClasses: ''
};

// Utility function to create enhanced component config with flex item support
export const withFlexItemSupport = <T extends Record<string, any>>(
  originalConfig: any,
  componentName: string
) => {
  return {
    ...originalConfig,
    fields: {
      ...originalConfig.fields,
      // Add a fieldset for flex item configuration
      flexLayout: {
        type: 'custom' as const,
        label: 'Flex Layout',
        render: () => null // This will be handled by the config fields below
      },
      ...flexItemFields
    },
    defaultProps: {
      ...originalConfig.defaultProps,
      ...defaultFlexItemProps
    },
    render: (props: T & FlexItemProps) => {
      try {
        // Extract flex item props
        const {
          layoutBehavior,
          flexBasis,
          flexGrow,
          flexShrink,
          minWidth,
          maxWidth,
          width,
          alignSelf,
          marginTop,
          marginBottom,
          marginLeft,
          marginRight,
          customClasses,
          ...componentProps
        } = props;

        // Render original component wrapped in FlexItemWrapper
        const OriginalComponent = originalConfig.render;
        
        return (
          <FlexItemWrapper
            layoutBehavior={layoutBehavior}
            flexBasis={flexBasis}
            flexGrow={flexGrow}
            flexShrink={flexShrink}
            minWidth={minWidth}
            maxWidth={maxWidth}
            width={width}
            alignSelf={alignSelf}
            marginTop={marginTop}
            marginBottom={marginBottom}
            marginLeft={marginLeft}
            marginRight={marginRight}
            customClasses={customClasses}
          >
            <OriginalComponent {...componentProps} />
          </FlexItemWrapper>
        );
      } catch (error) {
        console.error(`${componentName} with flex support render error:`, error);
        return (
          <div className="p-4 border border-red-300 text-red-500 text-center bg-red-50 rounded">
            Error rendering {componentName} with flex support
          </div>
        );
      }
    }
  };
};

export default FlexItemWrapper; 