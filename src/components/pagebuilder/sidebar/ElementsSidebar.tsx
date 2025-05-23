
import React from 'react';
import { usePageBuilder } from '../context/PageBuilderContext';
import { ScrollArea } from "@/components/ui/scroll-area";
import { TabsContent } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { 
  Heading1, Heading2, PanelLeft, SquareStack, 
  Type, Layers, Columns, LayoutGrid, Square,
  FileText, CreditCard, Image,
  HeartHandshake, Film, Calendar 
} from 'lucide-react';

const ElementsSidebar: React.FC = () => {
  const { addElement } = usePageBuilder();

  const elementGroups = [
    {
      title: "LAYOUT BLOCKS",
      elements: [
        {
          name: "Section",
          icon: <PanelLeft className="h-5 w-5" />,
          component: "Section",
          props: {
            padding: "md",
            backgroundColor: "white"
          }
        },
        {
          name: "Grid",
          icon: <Columns className="h-5 w-5" />,
          component: "Grid",
          props: {
            columns: 2,
            gap: "md"
          }
        },
        {
          name: "Container",
          icon: <Square className="h-5 w-5" />,
          component: "Container",
          props: {
            width: "full",
            padding: "md"
          }
        },
        {
          name: "Card",
          icon: <CreditCard className="h-5 w-5" />,
          component: "Card",
          props: {
            shadow: "sm",
            padding: "md"
          }
        }
      ]
    },
    {
      title: "CONTENT ELEMENTS",
      elements: [
        {
          name: "Heading",
          icon: <Heading1 className="h-5 w-5" />,
          component: "Heading",
          props: {
            text: "Your Heading",
            size: "xl"
          }
        },
        {
          name: "Paragraph",
          icon: <Type className="h-5 w-5" />,
          component: "Paragraph",
          props: {
            text: "Enter your text here..."
          }
        },
        {
          name: "Image",
          icon: <Image className="h-5 w-5" />,
          component: "Image",
          props: {
            src: "/placeholder.svg",
            alt: "Placeholder image",
            width: "full"
          }
        },
        {
          name: "Button",
          icon: <SquareStack className="h-5 w-5" />,
          component: "Button",
          props: {
            text: "Click Me",
            variant: "default",
            size: "default",
            action: "#"
          }
        }
      ]
    },
    {
      title: "CHURCH ELEMENTS",
      elements: [
        {
          name: "Donation Form",
          icon: <HeartHandshake className="h-5 w-5" />,
          component: "DonationForm",
          props: {
            title: "Support Our Church"
          }
        },
        {
          name: "Sermon Player",
          icon: <Film className="h-5 w-5" />,
          component: "SermonPlayer",
          props: {
            title: "Latest Sermon"
          }
        },
        {
          name: "Events Calendar",
          icon: <Calendar className="h-5 w-5" />,
          component: "EventsCalendar",
          props: {
            showUpcoming: 3
          }
        }
      ]
    }
  ];

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, element: any) => {
    e.dataTransfer.setData('application/json', JSON.stringify(element));
    e.dataTransfer.effectAllowed = 'copy';
    
    // Add visual feedback
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.transform = 'rotate(5deg)';
    dragImage.style.opacity = '0.8';
    e.dataTransfer.setDragImage(dragImage, 50, 25);
  };
  
  const handleClick = (element: any) => {
    addElement({
      ...element,
      parentId: null,
    });
  };

  return (
    <TabsContent value="elements" className="h-full">
      <ScrollArea className="h-full px-1">
        <div className="space-y-6 p-4 pt-0">
          {elementGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h3 className="mb-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                {group.title}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {group.elements.map((element, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex flex-col items-center justify-center border rounded-lg p-3 py-4",
                      "hover:bg-gray-50 hover:border-blue-300 hover:shadow-sm",
                      "cursor-move transition-all duration-200",
                      "active:scale-95 active:bg-blue-50"
                    )}
                    draggable
                    onDragStart={(e) => handleDragStart(e, element)}
                    onClick={() => handleClick(element)}
                    title={`Add ${element.name}`}
                  >
                    <div className="mb-2 text-gray-600">
                      {element.icon}
                    </div>
                    <span className="text-xs font-medium text-center">
                      {element.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="p-4 text-center text-xs text-gray-400">
            <p>Drag elements to the canvas or click to add</p>
          </div>
        </div>
      </ScrollArea>
    </TabsContent>
  );
};

export default ElementsSidebar;
