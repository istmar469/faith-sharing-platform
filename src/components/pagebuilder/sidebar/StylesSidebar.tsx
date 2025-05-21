
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const StylesSidebar: React.FC = () => {
  return (
    <div className="p-4 mt-0">
      <div className="space-y-4">
        <div>
          <Label className="text-xs font-semibold text-gray-500 uppercase mb-2">Typography</Label>
          <div className="space-y-2">
            <Select defaultValue="inter">
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inter">Inter</SelectItem>
                <SelectItem value="roboto">Roboto</SelectItem>
                <SelectItem value="opensans">Open Sans</SelectItem>
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Size</Label>
                <Select defaultValue="md">
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Weight</Label>
                <Select defaultValue="normal">
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select weight" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <Label className="text-xs font-semibold text-gray-500 uppercase mb-2">Colors</Label>
          <div className="space-y-2">
            <div>
              <Label className="text-xs">Text Color</Label>
              <div className="flex mt-1">
                <div className="h-6 w-6 rounded bg-gray-900 border border-gray-200"></div>
                <Input defaultValue="#1a202c" className="h-6 flex-1 ml-2" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Background</Label>
              <div className="flex mt-1">
                <div className="h-6 w-6 rounded bg-white border border-gray-200"></div>
                <Input defaultValue="#ffffff" className="h-6 flex-1 ml-2" />
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <Label className="text-xs font-semibold text-gray-500 uppercase mb-2">Spacing</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Padding</Label>
              <Input type="number" defaultValue="16" className="h-8" />
            </div>
            <div>
              <Label className="text-xs">Margin</Label>
              <Input type="number" defaultValue="0" className="h-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StylesSidebar;
