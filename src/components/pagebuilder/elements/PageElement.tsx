
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
    children?: {
      id: string;
      type: string;
      component: string;
      props?: Record<string, any>;
      children?: any[];
    }[];
  };
  isSelected: boolean;
  onClick: () => void;
  nestingLevel?: number;
}

const PageElement: React.FC<PageElementProps> = ({ 
  element, 
  isSelected, 
  onClick, 
  nestingLevel = 0 
}) => {
  const { pageElements, selectedElementId, setSelectedElementId, addElement, updateElement } = usePageBuilder();
  
  // Find child elements for this parent
  const childElements = pageElements.filter(el => el.parentId === element.id);
  
  // Handle editing text content
  const handleTextChange = (key: string, value: string) => {
    console.log("Updating element text:", key, value);
    updateElement(element.id, {
      props: {
        ...element.props,
        [key]: value
      }
    });
  };
  
  // Handle drop of elements onto containers, sections, or grids
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop propagation to prevent parent containers from handling the event
    
    const jsonData = e.dataTransfer.getData('application/json');
    
    if (jsonData) {
      try {
        const elementData = JSON.parse(jsonData);
        // Add the parent ID to the dropped element
        addElement({
          ...elementData,
          parentId: element.id
        });
      } catch (error) {
        console.error("Error parsing dragged element data:", error);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Max nesting level to prevent too deep nesting
  const MAX_NESTING_LEVEL = 3;
  
  // Check if this element type can accept children
  const canAcceptChildren = ['Section', 'Container', 'Grid', 'Card'].includes(element.component);
  
  // Element selection wrapper
  const elementWrapper = (children: React.ReactNode) => (
    <div 
      className={`relative mb-4 ${isSelected ? 'outline outline-2 outline-blue-500' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onDrop={canAcceptChildren && nestingLevel < MAX_NESTING_LEVEL ? handleDrop : undefined}
      onDragOver={canAcceptChildren && nestingLevel < MAX_NESTING_LEVEL ? handleDragOver : undefined}
    >
      {isSelected && (
        <div className="absolute -top-4 -left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-t z-10">
          {element.component}
        </div>
      )}
      {children}
    </div>
  );

  // Provide default props if none are provided
  const props = element.props || {};
  
  // Render the appropriate element based on the component type
  const renderElement = () => {
    switch(element.component) {
      case 'Heading':
        return <Heading 
          text={props.text || 'Heading'} 
          size={props.size} 
          isEditable={isSelected}
          onTextChange={(value) => handleTextChange('text', value)} 
        />;
      case 'Paragraph':
        return <Paragraph 
          text={props.text || 'Enter your text here...'} 
          isEditable={isSelected}
          onTextChange={(value) => handleTextChange('text', value)}
        />;
      case 'Button':
        return <Button 
          text={props.text || 'Button'} 
          variant={props.variant} 
          size={props.size} 
          action={props.action}
          isEditable={isSelected}
          onTextChange={(value) => handleTextChange('text', value)}
        />;
      case 'Section':
        return (
          <Section
            padding={props.padding}
            backgroundColor={props.backgroundColor}
          >
            {childElements.length > 0 ? (
              childElements.map(childElement => (
                <PageElement
                  key={childElement.id}
                  element={childElement}
                  isSelected={childElement.id === selectedElementId}
                  onClick={() => setSelectedElementId(childElement.id)}
                  nestingLevel={nestingLevel + 1}
                />
              ))
            ) : null}
          </Section>
        );
      case 'Grid':
        return (
          <Grid 
            columns={props.columns}
            gap={props.gap}
          >
            {childElements.length > 0 ? (
              childElements.map(childElement => (
                <PageElement
                  key={childElement.id}
                  element={childElement}
                  isSelected={childElement.id === selectedElementId}
                  onClick={() => setSelectedElementId(childElement.id)}
                  nestingLevel={nestingLevel + 1}
                />
              ))
            ) : null}
          </Grid>
        );
      case 'Container':
        return (
          <Container 
            width={props.width} 
            padding={props.padding}
          >
            {childElements.length > 0 ? (
              childElements.map(childElement => (
                <PageElement
                  key={childElement.id}
                  element={childElement}
                  isSelected={childElement.id === selectedElementId}
                  onClick={() => setSelectedElementId(childElement.id)}
                  nestingLevel={nestingLevel + 1}
                />
              ))
            ) : null}
          </Container>
        );
      case 'Card':
        return (
          <CardElement {...props}>
            {childElements.length > 0 ? (
              childElements.map(childElement => (
                <PageElement
                  key={childElement.id}
                  element={childElement}
                  isSelected={childElement.id === selectedElementId}
                  onClick={() => setSelectedElementId(childElement.id)}
                  nestingLevel={nestingLevel + 1}
                />
              ))
            ) : null}
          </CardElement>
        );
      case 'Image':
        return <ImageElement 
          src={props.src || ''}
          alt={props.alt || 'Image'}
          width={props.width}
          isEditable={isSelected}
          onSrcChange={(value) => handleTextChange('src', value)}
          onAltChange={(value) => handleTextChange('alt', value)}
        />;
      case 'DonationForm':
        return <DonationForm 
          title={props.title}
          isEditable={isSelected} 
          onTitleChange={(value) => handleTextChange('title', value)}
        />;
      case 'SermonPlayer':
        return <SermonPlayer 
          title={props.title}
          isEditable={isSelected}
          onTitleChange={(value) => handleTextChange('title', value)}
        />;
      case 'EventsCalendar':
        return <EventsCalendar 
          showUpcoming={props.showUpcoming}
          isEditable={isSelected}
        />;
      default:
        return <div>Unknown element type: {element.component}</div>;
    }
  };

  return elementWrapper(renderElement());
};

export default PageElement;
