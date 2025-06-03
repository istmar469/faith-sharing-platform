
import React from 'react';
import { ComponentConfig } from '@measured/puck';

export interface CardProps {
  title?: string;
  description?: string;
  image?: string;
  link?: string;
  buttonText?: string;
  variant?: 'default' | 'featured' | 'minimal';
  alignment?: 'left' | 'center' | 'right';
}

export const Card = (props: CardProps): React.ReactElement => {
  // Safe prop extraction with proper defaults
  const title = typeof props.title === 'string' ? props.title : "Card Title";
  const description = typeof props.description === 'string' ? props.description : "This is a card description that explains what this card is about.";
  const image = typeof props.image === 'string' ? props.image : "";
  const link = typeof props.link === 'string' ? props.link : "#";
  const buttonText = typeof props.buttonText === 'string' ? props.buttonText : "Learn More";
  const variant = ['default', 'featured', 'minimal'].includes(props.variant as string) ? props.variant : 'default';
  const alignment = ['left', 'center', 'right'].includes(props.alignment as string) ? props.alignment : 'left';

  const getVariantClasses = () => {
    switch (variant) {
      case 'featured':
        return 'border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-lg';
      case 'minimal':
        return 'border-0 shadow-sm bg-white';
      default:
        return 'border border-gray-200 bg-white shadow-md';
    }
  };

  const getAlignmentClasses = () => {
    switch (alignment) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  return (
    <div className={`rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg ${getVariantClasses()}`}>
      {image && (
        <div className="aspect-video overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}
      <div className={`p-6 ${getAlignmentClasses()}`}>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {title}
        </h3>
        <p className="text-gray-600 mb-4 leading-relaxed">
          {description}
        </p>
        {buttonText && (
          <a
            href={link}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {buttonText}
          </a>
        )}
      </div>
    </div>
  );
};

export const cardConfig: ComponentConfig<CardProps> = {
  render: Card,
  fields: {
    title: {
      type: 'text',
      label: 'Title'
    },
    description: {
      type: 'textarea',
      label: 'Description'
    },
    image: {
      type: 'text',
      label: 'Image URL'
    },
    link: {
      type: 'text',
      label: 'Link URL'
    },
    buttonText: {
      type: 'text',
      label: 'Button Text'
    },
    variant: {
      type: 'select',
      label: 'Card Style',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Featured', value: 'featured' },
        { label: 'Minimal', value: 'minimal' }
      ]
    },
    alignment: {
      type: 'select',
      label: 'Text Alignment',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' }
      ]
    }
  },
  defaultProps: {
    title: "Card Title",
    description: "This is a card description that explains what this card is about.",
    image: "",
    link: "#",
    buttonText: "Learn More",
    variant: "default",
    alignment: "left"
  }
};
