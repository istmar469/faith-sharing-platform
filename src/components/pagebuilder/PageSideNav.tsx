
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutGrid, Settings, Home } from 'lucide-react';
import { usePageBuilder } from './context/PageBuilderContext';
import { useToast } from "@/components/ui/use-toast";

const PageSideNav: React.FC = () => {
  const navigate = useNavigate();
  const { organizationId, savePage } = usePageBuilder();
  const { toast } = useToast();

  const handleBack = () => {
    if (organizationId) {
      navigate(`/tenant-dashboard/${organizationId}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSave = async () => {
    try {
      await savePage();
      toast({
        title: "Page saved",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error saving page",
        description: "There was an error saving your changes.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-16 bg-gray-900 flex flex-col items-center py-4 h-full gap-4">
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-gray-800"
        onClick={handleBack}
        title="Back to dashboard"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-gray-800 mt-8"
        onClick={handleSave}
        title="Save page"
      >
        <Home className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-gray-800"
        title="Page layout"
      >
        <LayoutGrid className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-gray-800"
        title="Page settings"
      >
        <Settings className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default PageSideNav;
