
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

export const Card = ({ 
  title = "Card Title",
  description = "This is a card description that explains what this card is about.",
  image = "",
  link = "#",
  buttonText = "Learn More",
  variant = "default",
  alignment = "left"
}: CardProps): React.ReactElement => {
  // Ensure all props are properly typed and have safe defaults
  const safeTitle = typeof title === 'string' ? title : "Card Title";
  const safeDescription = typeof description === 'string' ? description : "This is a card description.";
  const safeImage = typeof image === 'string' ? image : "";
  const safeLink = typeof link === 'string' ? link : "#";
  const safeButtonText = typeof buttonText === 'string' ? buttonText : "Learn More";
  const safeVariant = ['default', 'featured', 'minimal'].includes(variant as string) ? variant : 'default';
  const safeAlignment = ['left', 'center', 'right'].includes(alignment as string) ? alignment : 'left';

  const getVariantClasses = () => {
    switch (safeVariant) {
      case 'featured':
        return 'border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-lg';
      case 'minimal':
        return 'border-0 shadow-sm bg-white';
      default:
        return 'border border-gray-200 bg-white shadow-md';
    }
  };

  const getAlignmentClasses = () => {
    switch (safeAlignment) {
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
      {safeImage && (
        <div className="aspect-video overflow-hidden">
          <img 
            src={safeImage} 
            alt={safeTitle}
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
          {safeTitle}
        </h3>
        <p className="text-gray-600 mb-4 leading-relaxed">
          {safeDescription}
        </p>
        {safeButtonText && (
          <a
            href={safeLink}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {safeButtonText}
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
