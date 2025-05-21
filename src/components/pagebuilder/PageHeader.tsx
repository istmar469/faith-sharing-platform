
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { usePageBuilder } from './context/PageBuilderContext';

const PageHeader: React.FC = () => {
  const { pageTitle, setPageTitle } = usePageBuilder();
  const { toast } = useToast();
  
  const handleSave = () => {
    toast({
      title: "Page Saved",
      description: "Your page has been saved successfully",
    });
  };
  
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input 
            className="text-xl font-bold h-10 px-3 w-64 bg-white border-none"
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
          />
          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
            Draft
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Preview
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" /> Save
          </Button>
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
