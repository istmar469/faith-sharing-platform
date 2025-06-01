
import React from 'react';
import { ComponentConfig } from '@measured/puck';
import { Card as UICard, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface CardProps {
  title?: string;
  description?: string;
  content?: string;
  showHeader?: boolean;
  showDescription?: boolean;
  variant?: 'default' | 'outline' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  title = 'Card Title',
  description = 'Card description goes here',
  content = 'This is the card content. You can add any text or information here.',
  showHeader = true,
  showDescription = true,
  variant = 'default',
  padding = 'medium',
  backgroundColor = 'white',
  textColor = 'gray-900',
  borderRadius = 'medium'
}) => {
  const paddingClasses = {
    none: 'p-0',
    small: 'p-2',
    medium: 'p-4',
    large: 'p-6'
  };

  const radiusClasses = {
    none: 'rounded-none',
    small: 'rounded-sm',
    medium: 'rounded-lg',
    large: 'rounded-xl'
  };

  const cardClasses = `
    ${variant === 'outline' ? 'border-2' : ''} 
    ${variant === 'elevated' ? 'shadow-lg' : ''} 
    ${radiusClasses[borderRadius]}
    bg-${backgroundColor} 
    text-${textColor}
  `.trim();

  return (
    <UICard className={cardClasses}>
      {showHeader && (
        <CardHeader className={paddingClasses[padding]}>
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          {showDescription && (
            <CardDescription className="text-sm text-gray-600">
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className={`${paddingClasses[padding]} ${showHeader ? 'pt-0' : ''}`}>
        <p className="text-sm leading-relaxed">{content}</p>
      </CardContent>
    </UICard>
  );
};

export const cardConfig: ComponentConfig<CardProps> = {
  fields: {
    title: {
      type: 'text',
      label: 'Title'
    },
    description: {
      type: 'text',
      label: 'Description'
    },
    content: {
      type: 'textarea',
      label: 'Content'
    },
    showHeader: {
      type: 'radio',
      label: 'Show Header',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    },
    showDescription: {
      type: 'radio',
      label: 'Show Description',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    },
    variant: {
      type: 'select',
      label: 'Variant',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Outline', value: 'outline' },
        { label: 'Elevated', value: 'elevated' }
      ]
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
    },
    backgroundColor: {
      type: 'text',
      label: 'Background Color'
    },
    textColor: {
      type: 'text',
      label: 'Text Color'
    },
    borderRadius: {
      type: 'select',
      label: 'Border Radius',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' }
      ]
    }
  },
  render: (props) => <Card {...props} />
};

export default Card;
