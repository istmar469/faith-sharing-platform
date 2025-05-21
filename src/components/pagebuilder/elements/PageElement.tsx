
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

  // Render the appropriate element based on the component type
  const renderElement = () => {
    switch(element.component) {
      case 'Heading':
        return <Heading {...(element.props || {})} />;
      case 'Paragraph':
        return <Paragraph {...(element.props || {})} />;
      case 'Button':
        return <Button {...(element.props || {})} />;
      case 'Section':
        return <Section {...(element.props || {})} />;
      case 'Grid':
        return <Grid {...(element.props || {})} />;
      case 'Container':
        return <Container {...(element.props || {})} />;
      case 'Card':
        return <CardElement {...(element.props || {})} />;
      case 'Image':
        return <ImageElement {...(element.props || {})} />;
      case 'DonationForm':
        return <DonationForm {...(element.props || {})} />;
      case 'SermonPlayer':
        return <SermonPlayer {...(element.props || {})} />;
      case 'EventsCalendar':
        return <EventsCalendar {...(element.props || {})} />;
      default:
        return <div>Unknown element type: {element.component}</div>;
    }
  };

  return elementWrapper(renderElement());
};

export default PageElement;
