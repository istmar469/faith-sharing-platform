
import React from 'react';
import { usePageBuilder } from '../context/PageBuilderContext';

// Import element components
import Heading from './Heading';
import Paragraph from './Paragraph';
import Button from './Button';
import Section from './Section';
import Grid from './Grid';
import Container from './Container';
import CardElement from './Card';
import ImageElement from './Image';
import DonationForm from './DonationForm';
import SermonPlayer from './SermonPlayer';
import EventsCalendar from './EventsCalendar';

interface PageElementProps {
  element: {
    id: string;
    type: string;
    component: string;
    props?: Record<string, any>;
  };
  isSelected: boolean;
  onClick: () => void;
}

const PageElement: React.FC<PageElementProps> = ({ element, isSelected, onClick }) => {
  // Element selection wrapper
  const elementWrapper = (children: React.ReactNode) => (
    <div 
      className={`relative mb-4 ${isSelected ? 'outline outline-2 outline-blue-500' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {isSelected && (
        <div className="absolute -top-4 -left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-t">
          {element.component}
        </div>
      )}
      {children}
    </div>
  );

  // Provide default props if none are provided
  const props = element.props || {};
  
  // Ensure text property exists for components that require it
  if (['Heading', 'Paragraph', 'Button'].includes(element.component) && !props.text) {
    props.text = element.component === 'Heading' ? 'Heading' : 
                 element.component === 'Paragraph' ? 'Enter your text here...' : 
                 'Button';
  }

  // Render the appropriate element based on the component type
  const renderElement = () => {
    switch(element.component) {
      case 'Heading':
        return <Heading {...props} />;
      case 'Paragraph':
        return <Paragraph {...props} />;
      case 'Button':
        return <Button {...props} />;
      case 'Section':
        return <Section {...props} />;
      case 'Grid':
        return <Grid {...props} />;
      case 'Container':
        return <Container {...props} />;
      case 'Card':
        return <CardElement {...props} />;
      case 'Image':
        return <ImageElement {...props} />;
      case 'DonationForm':
        return <DonationForm {...props} />;
      case 'SermonPlayer':
        return <SermonPlayer {...props} />;
      case 'EventsCalendar':
        return <EventsCalendar {...props} />;
      default:
        return <div>Unknown element type: {element.component}</div>;
    }
  };

  return elementWrapper(renderElement());
};

export default PageElement;
