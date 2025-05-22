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
import { Button as ButtonIcon } from '@/components/ui/button';

const ElementsSidebar: React.FC = () => {
  const { addElement, savePage } = usePageBuilder();

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
          icon: <ButtonIcon className="h-5 w-5" />,
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
  };
  
  const handleClick = (element: any) => {
    addElement({
      ...element,
      parentId: null,
    });
    
    // Auto-save after adding elements
    setTimeout(() => {
      console.log("Auto-saving after element added from sidebar");
      savePage();
    }, 1000);
  };

  return (
    <TabsContent value="elements" className="h-full">
      <ScrollArea className="h-full px-1">
        <div className="space-y-6 p-4 pt-0">
          {elementGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h3 className="mb-2 text-xs font-medium text-gray-500">{group.title}</h3>
              <div className="grid grid-cols-2 gap-2">
                {group.elements.map((element, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-center border rounded p-2 py-4 hover:bg-gray-50 cursor-move"
                    draggable
                    onDragStart={(e) => handleDragStart(e, element)}
                    onClick={() => handleClick(element)}
                  >
                    <div className="mb-2">
                      {element.icon}
                    </div>
                    <span className="text-xs">{element.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </TabsContent>
  );
};

export default ElementsSidebar;
