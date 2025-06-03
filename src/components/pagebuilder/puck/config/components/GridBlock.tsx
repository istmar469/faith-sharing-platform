import React from 'react';
import { DropZone } from '@measured/puck';
import { ComponentConfig } from '@measured/puck';

export type GridBlockProps = {
  columns?: number;
  gap?: string;
  backgroundColor?: string;
  padding?: string;
  minHeight?: string;
  equalHeight?: boolean;
};

export const GridBlock: React.FC<GridBlockProps> = ({
  columns = 3,
  gap = '1rem',
  backgroundColor = 'transparent',
  padding = '1rem',
  minHeight = '200px',
  equalHeight = true
}) => {
  const gridZones = Array.from({ length: columns }, (_, i) => `grid-${i + 1}`);

  return (
    <>
      <style>
        {`
          .grid-block-container .puck-dropzone {
            border: 2px dashed #e5e7eb;
            border-radius: 8px;
            background-color: rgba(249, 250, 251, 0.5);
            transition: all 0.2s ease;
            position: relative;
            display: flex;
            flex-direction: column;
            min-height: 100px;
            flex: 1;
          }
          
          .grid-block-container .grid-column:hover .puck-dropzone {
            border-color: #3b82f6;
            background-color: rgba(59, 130, 246, 0.05);
          }
          
          .grid-block-container .puck-dropzone.is-over {
            border-color: #2563eb;
            background-color: rgba(37, 99, 235, 0.1);
          }
          
          .grid-block-container .puck-dropzone:empty::after {
            content: 'Drop components here';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #9ca3af;
            font-size: 14px;
            pointer-events: none;
            text-align: center;
            opacity: 0.7;
          }
          
          .grid-block-container .puck-dropzone:not(:empty)::after {
            display: none;
          }
          
          /* Mobile responsive */
          @media (max-width: 768px) {
            .grid-block-container .grid-layout {
              grid-template-columns: 1fr !important;
            }
          }
          
          /* Tablet responsive for 3+ columns */
          @media (max-width: 1024px) and (min-width: 769px) {
            .grid-block-container .grid-layout[data-columns="3"],
            .grid-block-container .grid-layout[data-columns="4"] {
              grid-template-columns: repeat(2, 1fr) !important;
            }
            .grid-block-container .grid-layout[data-columns="5"],
            .grid-block-container .grid-layout[data-columns="6"] {
              grid-template-columns: repeat(3, 1fr) !important;
            }
          }
        `}
      </style>
      <div 
        className="grid-block-container w-full"
        style={{
          backgroundColor,
          padding,
          minHeight
        }}
      >
        <div
          className="grid-layout"
          data-columns={columns}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap,
            alignItems: equalHeight ? 'stretch' : 'start',
            width: '100%'
          }}
        >
          {gridZones.map((zone, index) => (
            <div
              key={zone}
              className="grid-column"
              style={{
                minHeight: '100px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <DropZone zone={zone} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export const gridBlockConfig: ComponentConfig<GridBlockProps> = {
  fields: {
    columns: {
      type: 'select',
      options: [
        { label: '1 Column', value: 1 },
        { label: '2 Columns', value: 2 },
        { label: '3 Columns', value: 3 },
        { label: '4 Columns', value: 4 },
        { label: '5 Columns', value: 5 },
        { label: '6 Columns', value: 6 }
      ]
    },
    gap: {
      type: 'select',
      options: [
        { label: 'No Gap', value: '0' },
        { label: 'Small (0.5rem)', value: '0.5rem' },
        { label: 'Medium (1rem)', value: '1rem' },
        { label: 'Large (1.5rem)', value: '1.5rem' },
        { label: 'Extra Large (2rem)', value: '2rem' }
      ]
    },
    backgroundColor: {
      type: 'select',
      options: [
        { label: 'Transparent', value: 'transparent' },
        { label: 'White', value: '#ffffff' },
        { label: 'Light Gray', value: '#f9fafb' },
        { label: 'Blue', value: '#eff6ff' },
        { label: 'Green', value: '#f0fdf4' },
        { label: 'Yellow', value: '#fefce8' },
        { label: 'Red', value: '#fef2f2' },
        { label: 'Purple', value: '#faf5ff' }
      ]
    },
    padding: {
      type: 'select',
      options: [
        { label: 'None', value: '0' },
        { label: 'Small (0.5rem)', value: '0.5rem' },
        { label: 'Medium (1rem)', value: '1rem' },
        { label: 'Large (1.5rem)', value: '1.5rem' },
        { label: 'Extra Large (2rem)', value: '2rem' },
        { label: 'Extra Extra Large (3rem)', value: '3rem' }
      ]
    },
    minHeight: {
      type: 'select',
      options: [
        { label: 'Auto', value: 'auto' },
        { label: 'Small (150px)', value: '150px' },
        { label: 'Medium (200px)', value: '200px' },
        { label: 'Large (300px)', value: '300px' },
        { label: 'Extra Large (400px)', value: '400px' }
      ]
    },
    equalHeight: {
      type: 'radio',
      options: [
        { label: 'Equal Height Columns', value: true },
        { label: 'Auto Height Columns', value: false }
      ]
    }
  },
  defaultProps: {
    columns: 3,
    gap: '1rem',
    backgroundColor: 'transparent',
    padding: '1rem',
    minHeight: '200px',
    equalHeight: true
  },
  render: ({ columns, gap, backgroundColor, padding, minHeight, equalHeight }) => {
    return (
      <GridBlock
        columns={columns}
        gap={gap}
        backgroundColor={backgroundColor}
        padding={padding}
        minHeight={minHeight}
        equalHeight={equalHeight}
      />
    );
  }
}; 