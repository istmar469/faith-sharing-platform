
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
    <div className={`py-6 ${alignmentClasses[alignment]}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className={`${sizeClasses[size]} text-gray-700 prose prose-gray max-w-none`}
          dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}
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
  render: ({ content, size, alignment }) => (
    <TextBlock content={content} size={size} alignment={alignment} />
  )
};
