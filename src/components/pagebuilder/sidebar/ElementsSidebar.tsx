
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { LayoutGrid, Columns, Square, FileText, Heading, Text, Image, Save, Calendar, Video } from 'lucide-react';
import { Button } from "@/components/ui/button";

const ElementsSidebar: React.FC = () => {
  return (
    <div className="p-2 space-y-4 mt-0">
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Layout Blocks</h3>
        <div className="grid grid-cols-2 gap-2">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-2 text-center">
              <Columns className="h-6 w-6 mb-1 mx-auto text-gray-600" />
              <span className="text-xs">Section</span>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-2 text-center">
              <LayoutGrid className="h-6 w-6 mb-1 mx-auto text-gray-600" />
              <span className="text-xs">Grid</span>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-2 text-center">
              <Square className="h-6 w-6 mb-1 mx-auto text-gray-600" />
              <span className="text-xs">Container</span>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-2 text-center">
              <FileText className="h-6 w-6 mb-1 mx-auto text-gray-600" />
              <span className="text-xs">Card</span>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Content Elements</h3>
        <div className="grid grid-cols-2 gap-2">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-2 text-center">
              <Heading className="h-6 w-6 mb-1 mx-auto text-gray-600" />
              <span className="text-xs">Heading</span>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-2 text-center">
              <Text className="h-6 w-6 mb-1 mx-auto text-gray-600" />
              <span className="text-xs">Paragraph</span>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-2 text-center">
              <Image className="h-6 w-6 mb-1 mx-auto text-gray-600" />
              <span className="text-xs">Image</span>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-2 text-center">
              <Button className="h-6 w-full mb-1 mx-auto text-xs">Button</Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Church Elements</h3>
        <div className="space-y-2">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-2 flex items-center">
              <div className="bg-gray-100 h-8 w-12 rounded mr-2 flex items-center justify-center">
                <Save className="h-4 w-4 text-gray-600" />
              </div>
              <span className="text-xs">Donation Form</span>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-2 flex items-center">
              <div className="bg-gray-100 h-8 w-12 rounded mr-2 flex items-center justify-center">
                <Video className="h-4 w-4 text-gray-600" />
              </div>
              <span className="text-xs">Sermon Player</span>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-2 flex items-center">
              <div className="bg-gray-100 h-8 w-12 rounded mr-2 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-gray-600" />
              </div>
              <span className="text-xs">Events Calendar</span>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ElementsSidebar;
