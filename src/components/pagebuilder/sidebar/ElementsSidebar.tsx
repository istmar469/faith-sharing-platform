
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { LayoutGrid, Columns, Square, FileText, Heading, Text, Image, Save, Calendar, Video } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { usePageBuilder } from '../context/PageBuilderContext';

interface ElementCardProps {
  icon: React.ReactNode;
  label: string;
  elementType: string;
  component: string;
  defaultProps?: Record<string, any>;
}

const ElementCard: React.FC<ElementCardProps> = ({ icon, label, elementType, component, defaultProps = {} }) => {
  // Setup drag functionality
  const handleDragStart = (e: React.DragEvent) => {
    const elementData = {
      type: elementType, 
      component,
      props: defaultProps
    };
    e.dataTransfer.setData('application/json', JSON.stringify(elementData));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <Card 
      className="cursor-grab hover:shadow-md transition-shadow"
      draggable
      onDragStart={handleDragStart}
    >
      <CardContent className="p-2 text-center">
        <div className="h-6 w-6 mb-1 mx-auto text-gray-600">{icon}</div>
        <span className="text-xs">{label}</span>
      </CardContent>
    </Card>
  );
};

const ElementsSidebar: React.FC = () => {
  return (
    <div className="p-2 space-y-4 mt-0">
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Layout Blocks</h3>
        <div className="grid grid-cols-2 gap-2">
          <ElementCard 
            icon={<Columns />}
            label="Section"
            elementType="layout"
            component="Section"
            defaultProps={{ padding: "medium", backgroundColor: "white" }}
          />
          <ElementCard 
            icon={<LayoutGrid />}
            label="Grid"
            elementType="layout"
            component="Grid"
            defaultProps={{ columns: 2, gap: "medium" }}
          />
          <ElementCard 
            icon={<Square />}
            label="Container"
            elementType="layout"
            component="Container"
            defaultProps={{ width: "full", padding: "medium" }}
          />
          <ElementCard 
            icon={<FileText />}
            label="Card"
            elementType="content"
            component="Card"
            defaultProps={{ padding: "medium" }}
          />
        </div>
      </div>
      
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Content Elements</h3>
        <div className="grid grid-cols-2 gap-2">
          <ElementCard 
            icon={<Heading />}
            label="Heading"
            elementType="content"
            component="Heading"
            defaultProps={{ text: "New Heading", size: "large" }}
          />
          <ElementCard 
            icon={<Text />}
            label="Paragraph"
            elementType="content"
            component="Paragraph"
            defaultProps={{ text: "Enter your text here..." }}
          />
          <ElementCard 
            icon={<Image />}
            label="Image"
            elementType="content"
            component="Image"
            defaultProps={{ src: "", alt: "Image", width: "full" }}
          />
          <ElementCard 
            icon={<Button className="h-6 w-full text-xs">Button</Button>}
            label="Button"
            elementType="content"
            component="Button"
            defaultProps={{ text: "Click Me", variant: "default", size: "default" }}
          />
        </div>
      </div>
      
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Church Elements</h3>
        <div className="space-y-2">
          <ElementCard 
            icon={<Save className="h-4 w-4" />}
            label="Donation Form"
            elementType="church"
            component="DonationForm"
            defaultProps={{ title: "Support Our Church" }}
          />
          <ElementCard 
            icon={<Video className="h-4 w-4" />}
            label="Sermon Player"
            elementType="church"
            component="SermonPlayer"
            defaultProps={{ title: "Latest Sermon" }}
          />
          <ElementCard 
            icon={<Calendar className="h-4 w-4" />}
            label="Events Calendar"
            elementType="church"
            component="EventsCalendar"
            defaultProps={{ showUpcoming: 3 }}
          />
        </div>
      </div>
    </div>
  );
};

export default ElementsSidebar;
