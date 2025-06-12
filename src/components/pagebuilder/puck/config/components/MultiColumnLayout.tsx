import React from 'react';
import { ComponentConfig, DropZone } from '@measured/puck';

export interface MultiColumnLayoutProps {
  // Layout Configuration
  columns?: 2 | 3 | 4 | 6;
  columnGap?: number;
  rowGap?: number;
  
  // Column Distribution
  distribution?: 'equal' | 'golden' | 'sidebar-left' | 'sidebar-right' | 'custom';
  customRatios?: string; // e.g., "1fr 2fr 1fr"
  
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
  
  // Responsive Behavior
  mobileLayout?: 'stack' | 'scroll' | 'grid';
  mobileBreakpoint?: string;
  
  // Advanced Options
  alignItems?: 'stretch' | 'start' | 'center' | 'end';
  justifyContent?: 'stretch' | 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  customClasses?: string;
  
  // Puck integration
  puck?: any;
}

const getShadowStyle = (shadow: string) => {
  switch (shadow) {
    case 'sm': return '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
    case 'md': return '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    case 'lg': return '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
    case 'xl': return '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
    default: return 'none';
  }
};

const getGridTemplate = (columns: number, distribution: string, customRatios?: string) => {
  if (distribution === 'custom' && customRatios) {
    return customRatios;
  }
  
  switch (distribution) {
    case 'golden':
      if (columns === 2) return '1.618fr 1fr';
      if (columns === 3) return '1.618fr 1fr 1fr';
      return `repeat(${columns}, 1fr)`;
    case 'sidebar-left':
      if (columns === 2) return '300px 1fr';
      if (columns === 3) return '250px 1fr 1fr';
      return `250px repeat(${columns - 1}, 1fr)`;
    case 'sidebar-right':
      if (columns === 2) return '1fr 300px';
      if (columns === 3) return '1fr 1fr 250px';
      return `repeat(${columns - 1}, 1fr) 250px`;
    default:
      return `repeat(${columns}, 1fr)`;
  }
};

export const MultiColumnLayout: React.FC<MultiColumnLayoutProps> = ({
  columns = 2,
  columnGap = 24,
  rowGap = 24,
  distribution = 'equal',
  customRatios,
  backgroundColor = 'transparent',
  borderRadius = 0,
  padding = 24,
  margin = 0,
  minHeight = 200,
  maxWidth = '100%',
  borderWidth = 0,
  borderColor = '#e5e7eb',
  borderStyle = 'solid',
  boxShadow = 'none',
  mobileLayout = 'stack',
  mobileBreakpoint = '768px',
  alignItems = 'stretch',
  justifyContent = 'stretch',
  customClasses = '',
  puck
}) => {
  const gridTemplate = getGridTemplate(columns, distribution, customRatios);
  
  const containerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: gridTemplate,
    columnGap: `${columnGap}px`,
    rowGap: `${rowGap}px`,
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
    alignItems: alignItems === 'stretch' ? undefined : alignItems,
    justifyContent: justifyContent === 'stretch' ? undefined : justifyContent,
    width: '100%',
    position: 'relative'
  };

  // Generate responsive CSS
  const responsiveCSS = `
    @media (max-width: ${mobileBreakpoint}) {
      .multi-column-layout-${puck?.id || 'default'} {
        ${mobileLayout === 'stack' ? `
          grid-template-columns: 1fr !important;
          gap: ${Math.min(columnGap, rowGap)}px !important;
        ` : mobileLayout === 'scroll' ? `
          grid-template-columns: repeat(${columns}, minmax(280px, 1fr)) !important;
          overflow-x: auto !important;
          scroll-snap-type: x mandatory !important;
        ` : `
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
        `}
      }
      ${mobileLayout === 'scroll' ? `
        .multi-column-layout-${puck?.id || 'default'} > .column-slot {
          scroll-snap-align: start !important;
        }
      ` : ''}
    }
    
    .multi-column-layout-${puck?.id || 'default'} .column-slot {
      min-height: 120px;
      border: 2px dashed transparent;
      transition: all 0.2s ease;
      border-radius: 8px;
      position: relative;
      padding: 8px;
    }
    
    .multi-column-layout-${puck?.id || 'default'} .column-slot:empty::after {
      content: "Drop components here";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #9ca3af;
      font-size: 14px;
      font-weight: 500;
      pointer-events: none;
      text-align: center;
      white-space: nowrap;
    }
    
    .multi-column-layout-${puck?.id || 'default'} .column-slot:hover {
      border-color: #3b82f6;
      background-color: rgba(59, 130, 246, 0.05);
    }
    
    .multi-column-layout-${puck?.id || 'default'} .column-slot[data-drag-over="true"] {
      border-color: #10b981;
      background-color: rgba(16, 185, 129, 0.1);
    }
  `;

  const layoutClassName = `multi-column-layout-${puck?.id || 'default'} ${customClasses}`.trim();

  // Generate column zones dynamically based on column count
  const renderColumns = () => {
    const columnElements = [];
    for (let i = 1; i <= columns; i++) {
      columnElements.push(
        <div key={i} className="column-slot">
          <DropZone zone={`column-${i}`} />
        </div>
      );
    }
    return columnElements;
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: responsiveCSS }} />
      <div
        ref={puck?.dragRef}
        style={containerStyle}
        className={layoutClassName}
        data-multi-column-layout="true"
        data-columns={columns}
      >
        {renderColumns()}
      </div>
    </>
  );
};

export const multiColumnLayoutConfig: ComponentConfig<MultiColumnLayoutProps> = {
  label: 'Multi-Column Layout',
  fields: {
    // Layout Configuration
    columns: {
      type: 'select',
      label: 'Number of Columns',
      options: [
        { label: '2 Columns', value: 2 },
        { label: '3 Columns', value: 3 },
        { label: '4 Columns', value: 4 },
        { label: '6 Columns', value: 6 }
      ]
    },
    
    distribution: {
      type: 'select',
      label: 'Column Distribution',
      options: [
        { label: 'Equal Width', value: 'equal' },
        { label: 'Golden Ratio', value: 'golden' },
        { label: 'Sidebar Left', value: 'sidebar-left' },
        { label: 'Sidebar Right', value: 'sidebar-right' },
        { label: 'Custom Ratios', value: 'custom' }
      ]
    },
    
    customRatios: {
      type: 'text',
      label: 'Custom Ratios (e.g., "1fr 2fr 1fr")'
    },
    
    // Spacing
    columnGap: {
      type: 'number',
      label: 'Column Gap (px)',
      min: 0,
      max: 100
    },
    
    rowGap: {
      type: 'number',
      label: 'Row Gap (px)',
      min: 0,
      max: 100
    },
    
    // Alignment
    alignItems: {
      type: 'select',
      label: 'Vertical Alignment',
      options: [
        { label: 'Stretch', value: 'stretch' },
        { label: 'Start', value: 'start' },
        { label: 'Center', value: 'center' },
        { label: 'End', value: 'end' }
      ]
    },
    
    justifyContent: {
      type: 'select',
      label: 'Horizontal Alignment',
      options: [
        { label: 'Stretch', value: 'stretch' },
        { label: 'Start', value: 'start' },
        { label: 'Center', value: 'center' },
        { label: 'End', value: 'end' },
        { label: 'Space Between', value: 'space-between' },
        { label: 'Space Around', value: 'space-around' }
      ]
    },
    
    // Responsive
    mobileLayout: {
      type: 'select',
      label: 'Mobile Layout',
      options: [
        { label: 'Stack Vertically', value: 'stack' },
        { label: 'Horizontal Scroll', value: 'scroll' },
        { label: 'Responsive Grid', value: 'grid' }
      ]
    },
    
    mobileBreakpoint: {
      type: 'select',
      label: 'Mobile Breakpoint',
      options: [
        { label: '480px', value: '480px' },
        { label: '640px', value: '640px' },
        { label: '768px', value: '768px' },
        { label: '1024px', value: '1024px' }
      ]
    },
    
    // Container Styling
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
        { label: 'Container (1200px)', value: '1200px' },
        { label: 'Large (1024px)', value: '1024px' },
        { label: 'Medium (768px)', value: '768px' },
        { label: 'Small (640px)', value: '640px' }
      ]
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
    
    // Custom
    customClasses: {
      type: 'text',
      label: 'Custom CSS Classes'
    }
  },
  
  defaultProps: {
    columns: 2,
    columnGap: 24,
    rowGap: 24,
    distribution: 'equal',
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 24,
    margin: 0,
    minHeight: 200,
    maxWidth: '100%',
    borderWidth: 0,
    borderColor: '#e5e7eb',
    borderStyle: 'solid',
    boxShadow: 'none',
    mobileLayout: 'stack',
    mobileBreakpoint: '768px',
    alignItems: 'stretch',
    justifyContent: 'stretch',
    customClasses: ''
  },
  
  render: ({ ...props }) => <MultiColumnLayout {...props} />
};

export default MultiColumnLayout; 