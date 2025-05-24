
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { TabsContent } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { 
  Heading1, Type, Image, List, Quote, 
  Minus, Video, CheckSquare
} from 'lucide-react';

const ElementsSidebar: React.FC = () => {
  const editorTools = [
    {
      title: "TEXT CONTENT",
      elements: [
        {
          name: "Heading",
          icon: <Heading1 className="h-5 w-5" />,
          description: "Add headings (H1-H6)",
          tip: "Press Tab to create a heading in the editor"
        },
        {
          name: "Paragraph",
          icon: <Type className="h-5 w-5" />,
          description: "Regular text content",
          tip: "Start typing to create paragraphs"
        },
        {
          name: "List",
          icon: <List className="h-5 w-5" />,
          description: "Bulleted or numbered lists",
          tip: "Use - or 1. to start lists"
        }
      ]
    },
    {
      title: "MEDIA & CONTENT",
      elements: [
        {
          name: "Image",
          icon: <Image className="h-5 w-5" />,
          description: "Add images with captions",
          tip: "Drag & drop images or use the + button"
        },
        {
          name: "Quote",
          icon: <Quote className="h-5 w-5" />,
          description: "Blockquotes with attribution",
          tip: "Great for testimonials and quotes"
        },
        {
          name: "Embed",
          icon: <Video className="h-5 w-5" />,
          description: "YouTube, Vimeo, and other embeds",
          tip: "Paste video URLs to embed content"
        }
      ]
    },
    {
      title: "INTERACTIVE",
      elements: [
        {
          name: "Checklist",
          icon: <CheckSquare className="h-5 w-5" />,
          description: "Interactive checkboxes",
          tip: "Perfect for to-do lists and steps"
        },
        {
          name: "Delimiter",
          icon: <Minus className="h-5 w-5" />,
          description: "Section dividers",
          tip: "Use *** to create dividers"
        }
      ]
    }
  ];

  return (
    <TabsContent value="elements" className="h-full">
      <ScrollArea className="h-full px-1">
        <div className="space-y-6 p-4 pt-0">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Editor.js Tools</strong><br />
              Use the toolbar in the editor or keyboard shortcuts to add content blocks.
            </p>
          </div>

          {editorTools.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h3 className="mb-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.elements.map((element, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start space-x-3 p-3 border rounded-lg",
                      "bg-gray-50 border-gray-200"
                    )}
                  >
                    <div className="text-gray-600 mt-0.5">
                      {element.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {element.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {element.description}
                      </div>
                      <div className="text-xs text-blue-600 mt-1 italic">
                        💡 {element.tip}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="p-4 text-center text-xs text-gray-400 bg-gray-50 rounded-lg">
            <p>Click in the editor area and use the toolbar or keyboard shortcuts to add content blocks.</p>
          </div>
        </div>
      </ScrollArea>
    </TabsContent>
  );
};

export default ElementsSidebar;
