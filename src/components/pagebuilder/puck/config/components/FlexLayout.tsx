import React from 'react';
import { ComponentConfig, DropZone } from '@measured/puck';

export interface FlexLayoutProps {
  // Layout Direction
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  
  // Justify Content (main axis)
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  
  // Align Items (cross axis)
  alignItems?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
  
  // Flex Wrap
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  
  // Gap
  gap?: number;
  rowGap?: number;
  columnGap?: number;
  
  // Container Styling
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
  margin?: number;
  minHeight?: number;
  maxWidth?: string;
  
  // Border
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  
  // Shadow
  boxShadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  
  // Advanced
  alignContent?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
  
  // Responsive
  breakpoint?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  mobileDirection?: 'row' | 'column';
  
  // Custom CSS Classes
  customClasses?: string;
}

const getShadowStyle = (shadow: string) => {
  switch (shadow) {
    case 'sm': return '0 1px 2px 0 rgb(0 0 0 / 0.05)';
    case 'md': return '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
    case 'lg': return '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)';
    case 'xl': return '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)';
    default: return 'none';
  }
};

const getResponsiveClasses = (breakpoint: string, mobileDirection: string, direction: string) => {
  if (breakpoint === 'none') return '';
  
  const responsiveDirection = mobileDirection === 'column' ? 'flex-col' : 'flex-row';
  const desktopDirection = direction === 'column' ? 'flex-col' : 
                          direction === 'row-reverse' ? 'flex-row-reverse' : 
                          direction === 'column-reverse' ? 'flex-col-reverse' : 'flex-row';
  
  return `flex-col ${breakpoint}:${desktopDirection}`;
};

export const FlexLayout: React.FC<FlexLayoutProps> = ({
  direction = 'row',
  justifyContent = 'flex-start',
  alignItems = 'stretch',
  flexWrap = 'wrap',
  gap = 16,
  rowGap,
  columnGap,
  backgroundColor = 'transparent',
  borderRadius = 0,
  padding = 16,
  margin = 0,
  minHeight = 100,
  maxWidth = '100%',
  borderWidth = 0,
  borderColor = '#e5e7eb',
  borderStyle = 'solid',
  boxShadow = 'none',
  alignContent = 'stretch',
  breakpoint = 'none',
  mobileDirection = 'column',
  customClasses = ''
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction,
    justifyContent,
    alignItems,
    flexWrap,
    gap: gap ? `${gap}px` : undefined,
    rowGap: rowGap ? `${rowGap}px` : undefined,
    columnGap: columnGap ? `${columnGap}px` : undefined,
    backgroundColor: backgroundColor === 'transparent' ? undefined : backgroundColor,
    borderRadius: borderRadius ? `${borderRadius}px` : undefined,
    padding: `${padding}px`,
    margin: `${margin}px`,
    minHeight: `${minHeight}px`,
    maxWidth,
    borderWidth: borderWidth ? `${borderWidth}px` : undefined,
    borderColor: borderWidth ? borderColor : undefined,
    borderStyle: borderWidth ? borderStyle : undefined,
    boxShadow: getShadowStyle(boxShadow),
    alignContent: flexWrap !== 'nowrap' ? alignContent : undefined,
    position: 'relative',
    width: '100%'
  };

  const responsiveClasses = getResponsiveClasses(breakpoint, mobileDirection, direction);
  const className = `flex-layout-container ${responsiveClasses} ${customClasses}`.trim();

  return (
    <div 
      style={containerStyle}
      className={className}
      data-flex-container="true"
    >
      <DropZone zone="flex-items" />
      
      {/* Add custom CSS to head if needed */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .flex-layout-container:empty::after {
            content: "Drop components here";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #6b7280;
            font-size: 14px;
            pointer-events: none;
            opacity: 0.7;
          }
          
          .flex-layout-container {
            border: 2px dashed transparent;
            transition: border-color 0.2s ease;
          }
          
          .flex-layout-container:hover {
            border-color: #3b82f6;
          }
          
          .flex-layout-container[data-drag-over="true"] {
            border-color: #10b981;
            background-color: rgba(16, 185, 129, 0.05);
          }
          
          .flex-layout-container > * {
            min-width: 0;
          }
        `
      }} />
    </div>
  );
};

export const flexLayoutConfig: ComponentConfig<FlexLayoutProps> = {
  label: 'Flex Layout',
  fields: {
    // Layout Direction
    direction: {
      type: 'select',
      label: 'Flex Direction',
      options: [
        { label: 'Row', value: 'row' },
        { label: 'Row Reverse', value: 'row-reverse' },
        { label: 'Column', value: 'column' },
        { label: 'Column Reverse', value: 'column-reverse' }
      ]
    },
    
    // Main Axis Alignment
    justifyContent: {
      type: 'select',
      label: 'Justify Content (Main Axis)',
      options: [
        { label: 'Start', value: 'flex-start' },
        { label: 'End', value: 'flex-end' },
        { label: 'Center', value: 'center' },
        { label: 'Space Between', value: 'space-between' },
        { label: 'Space Around', value: 'space-around' },
        { label: 'Space Evenly', value: 'space-evenly' }
      ]
    },
    
    // Cross Axis Alignment
    alignItems: {
      type: 'select',
      label: 'Align Items (Cross Axis)',
      options: [
        { label: 'Stretch', value: 'stretch' },
        { label: 'Start', value: 'flex-start' },
        { label: 'End', value: 'flex-end' },
        { label: 'Center', value: 'center' },
        { label: 'Baseline', value: 'baseline' }
      ]
    },
    
    // Flex Wrap
    flexWrap: {
      type: 'select',
      label: 'Flex Wrap',
      options: [
        { label: 'No Wrap', value: 'nowrap' },
        { label: 'Wrap', value: 'wrap' },
        { label: 'Wrap Reverse', value: 'wrap-reverse' }
      ]
    },
    
    // Multi-line Alignment (for wrapped content)
    alignContent: {
      type: 'select',
      label: 'Align Content (Multi-line)',
      options: [
        { label: 'Stretch', value: 'stretch' },
        { label: 'Start', value: 'flex-start' },
        { label: 'End', value: 'flex-end' },
        { label: 'Center', value: 'center' },
        { label: 'Space Between', value: 'space-between' },
        { label: 'Space Around', value: 'space-around' }
      ]
    },
    
    // Spacing
    gap: {
      type: 'number',
      label: 'Gap (px)',
      min: 0,
      max: 100
    },
    rowGap: {
      type: 'number',
      label: 'Row Gap (px)',
      min: 0,
      max: 100
    },
    columnGap: {
      type: 'number',
      label: 'Column Gap (px)',
      min: 0,
      max: 100
    },
    
    // Dimensions
    minHeight: {
      type: 'number',
      label: 'Min Height (px)',
      min: 50,
      max: 1000
    },
    maxWidth: {
      type: 'select',
      label: 'Max Width',
      options: [
        { label: '100%', value: '100%' },
        { label: 'Container', value: '1200px' },
        { label: 'Large', value: '1024px' },
        { label: 'Medium', value: '768px' },
        { label: 'Small', value: '640px' }
      ]
    },
    
    // Styling
    backgroundColor: {
      type: 'text',
      label: 'Background Color'
    },
    borderRadius: {
      type: 'number',
      label: 'Border Radius (px)',
      min: 0,
      max: 50
    },
    padding: {
      type: 'number',
      label: 'Padding (px)',
      min: 0,
      max: 100
    },
    margin: {
      type: 'number',
      label: 'Margin (px)',
      min: 0,
      max: 100
    },
    
    // Border
    borderWidth: {
      type: 'number',
      label: 'Border Width (px)',
      min: 0,
      max: 10
    },
    borderColor: {
      type: 'text',
      label: 'Border Color'
    },
    borderStyle: {
      type: 'select',
      label: 'Border Style',
      options: [
        { label: 'Solid', value: 'solid' },
        { label: 'Dashed', value: 'dashed' },
        { label: 'Dotted', value: 'dotted' },
        { label: 'None', value: 'none' }
      ]
    },
    
    // Shadow
    boxShadow: {
      type: 'select',
      label: 'Box Shadow',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
        { label: 'Extra Large', value: 'xl' }
      ]
    },
    
    // Responsive
    breakpoint: {
      type: 'select',
      label: 'Responsive Breakpoint',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Small (640px)', value: 'sm' },
        { label: 'Medium (768px)', value: 'md' },
        { label: 'Large (1024px)', value: 'lg' },
        { label: 'Extra Large (1280px)', value: 'xl' }
      ]
    },
    mobileDirection: {
      type: 'select',
      label: 'Mobile Direction',
      options: [
        { label: 'Column', value: 'column' },
        { label: 'Row', value: 'row' }
      ]
    },
    
    // Custom
    customClasses: {
      type: 'text',
      label: 'Custom CSS Classes'
    }
  },
  defaultProps: {
    direction: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    flexWrap: 'wrap',
    gap: 16,
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 16,
    margin: 0,
    minHeight: 100,
    maxWidth: '100%',
    borderWidth: 0,
    borderColor: '#e5e7eb',
    borderStyle: 'solid',
    boxShadow: 'none',
    alignContent: 'stretch',
    breakpoint: 'none',
    mobileDirection: 'column',
    customClasses: ''
  },
  render: ({ ...props }) => <FlexLayout {...props} />
};

export default FlexLayout; 