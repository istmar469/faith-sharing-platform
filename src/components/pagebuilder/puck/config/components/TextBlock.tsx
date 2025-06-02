import React from 'react';
import { ComponentConfig } from '@measured/puck';

export interface TextBlockProps {
  content?: string;
  size?: 'small' | 'medium' | 'large';
  alignment?: 'left' | 'center' | 'right';
}

export const TextBlock: React.FC<TextBlockProps> = ({
  content = 'Add your content here...',
  size = 'medium',
  alignment = 'left'
}) => {
  // Ensure all props are safe strings to prevent toString errors
  const safeContent = typeof content === 'string' ? content : 'Add your content here...';
  const safeSize = ['small', 'medium', 'large'].includes(size as string) ? size : 'medium';
  const safeAlignment = ['left', 'center', 'right'].includes(alignment as string) ? alignment : 'left';

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

  return (
    <div className={`py-6 ${alignmentClasses[safeAlignment]}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className={`${sizeClasses[safeSize]} text-gray-700 prose prose-gray max-w-none`}
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
    }
  },
  defaultProps: {
    content: 'Add your content here...',
    size: 'medium',
    alignment: 'left'
  },
  render: (props) => <TextBlock {...props} />
};
