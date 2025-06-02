import React from 'react';
import { ComponentConfig } from '@measured/puck';

export interface TextBlockProps {
  content?: string;
  size?: 'small' | 'medium' | 'large';
  alignment?: 'left' | 'center' | 'right';
  color?: string;
  backgroundColor?: string;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const TextBlock: React.FC<TextBlockProps> = ({
  content = 'Add your content here...',
  size = 'medium',
  alignment = 'left',
  color = '#374151',
  backgroundColor = 'transparent',
  fontWeight = 'normal',
  padding = 'medium'
}) => {
  // Ensure all props are safe strings to prevent toString errors
  const safeContent = typeof content === 'string' ? content : 'Add your content here...';
  const safeSize = ['small', 'medium', 'large'].includes(size as string) ? size : 'medium';
  const safeAlignment = ['left', 'center', 'right'].includes(alignment as string) ? alignment : 'left';
  const safeFontWeight = ['normal', 'medium', 'semibold', 'bold'].includes(fontWeight as string) ? fontWeight : 'normal';
  const safePadding = ['none', 'small', 'medium', 'large'].includes(padding as string) ? padding : 'medium';

  const sizeClasses = {
    small: 'text-sm leading-relaxed',
    medium: 'text-base leading-relaxed',
    large: 'text-lg leading-relaxed'
  };

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const fontWeightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  const paddingClasses = {
    none: 'py-0',
    small: 'py-3',
    medium: 'py-6',
    large: 'py-12'
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined
  };

  const textStyle: React.CSSProperties = {
    color: color
  };

  return (
    <div className={`${paddingClasses[safePadding]} ${alignmentClasses[safeAlignment]}`} style={containerStyle}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className={`${sizeClasses[safeSize]} ${fontWeightClasses[safeFontWeight]} prose prose-gray max-w-none`}
          style={textStyle}
          dangerouslySetInnerHTML={{ __html: safeContent.replace(/\n/g, '<br>') }}
        />
      </div>
    </div>
  );
};

export const textBlockConfig: ComponentConfig<TextBlockProps> = {
  fields: {
    content: {
      type: 'textarea',
      label: 'Content'
    },
    size: {
      type: 'select',
      label: 'Text Size',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' }
      ]
    },
    alignment: {
      type: 'select',
      label: 'Alignment',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' }
      ]
    },
    fontWeight: {
      type: 'select',
      label: 'Font Weight',
      options: [
        { label: 'Normal', value: 'normal' },
        { label: 'Medium', value: 'medium' },
        { label: 'Semi Bold', value: 'semibold' },
        { label: 'Bold', value: 'bold' }
      ]
    },
    color: {
      type: 'text',
      label: 'Text Color (hex)'
    },
    backgroundColor: {
      type: 'text',
      label: 'Background Color (hex or transparent)'
    },
    padding: {
      type: 'select',
      label: 'Padding',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' }
      ]
    }
  },
  defaultProps: {
    content: 'Add your content here...',
    size: 'medium',
    alignment: 'left',
    color: '#374151',
    backgroundColor: 'transparent',
    fontWeight: 'normal',
    padding: 'medium'
  },
  render: (props) => <TextBlock {...props} />
};
