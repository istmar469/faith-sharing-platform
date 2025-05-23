
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Eye, Globe, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { usePageBuilder } from './context/PageBuilderContext';
import { toast } from 'sonner';

const PageHeader: React.FC = () => {
  const navigate = useNavigate();
  const { 
    pageTitle, 
    setPageTitle, 
    savePage, 
    isSaving, 
    organizationId,
    pageId,
    isPublished,
    setIsPublished
  } = usePageBuilder();
  
  const handleSave = async () => {
    const result = await savePage();
    if (result) {
      toast.success("Page saved successfully");
    }
  };
  
  const handlePreview = () => {
    if (!organizationId) {
      toast.error("Cannot preview: No organization ID available");
      return;
    }
    
    if (!pageId) {
      toast.warning("Please save the page first before previewing");
      return;
    }
    
    // Open preview in a new tab
    window.open(`/preview-domain/id-preview--${organizationId}?pageId=${pageId}`, '_blank');
  };
  
  return (
    <div className="bg-white border-b p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4 flex-1">
        <h1 className="text-xl font-semibold">Site Builder</h1>
        <div className="flex-1">
          <input
            type="text"
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
            className="border-0 outline-none focus:ring-0 text-lg font-medium w-full max-w-md"
            placeholder="Page Title"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center space-x-2 mr-4">
          <Switch 
            id="public-toggle"
            checked={isPublished}
            onCheckedChange={setIsPublished}
          />
          <Label htmlFor="public-toggle" className="cursor-pointer flex items-center gap-1">
            <Globe className="h-4 w-4" />
            <span>{isPublished ? "Public" : "Private"}</span>
          </Label>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handlePreview}
          className="flex items-center gap-1"
        >
          <Eye className="h-4 w-4" />
          <span>Preview</span>
        </Button>
        
        <Button 
          onClick={handleSave} 
          disabled={isSaving} 
          size="sm"
          className="flex items-center gap-1"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? "Saving..." : "Save"}</span>
        </Button>
      </div>
    </div>
  );
};

export default PageHeader;
