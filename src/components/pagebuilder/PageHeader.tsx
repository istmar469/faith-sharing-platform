
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Eye, Globe, Settings, ExternalLink } from 'lucide-react';
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
    setIsPublished,
    subdomain,
    openPreviewInNewWindow
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
    window.open(`/preview-domain/id-preview--${organizationId}?pageId=${pageId}&preview=true`, '_blank');
  };
  
  const handlePublishToggle = (checked: boolean) => {
    if (checked && !pageId) {
      toast.warning("Please save the page first before publishing");
      return;
    }
    
    if (checked) {
      // Show confirmation for publishing
      if (confirm("Are you sure you want to make this page public?")) {
        setIsPublished(true);
        toast.info("Don't forget to save your changes to publish the page");
      }
    } else {
      setIsPublished(false);
      toast.info("Page set to private. Don't forget to save your changes.");
    }
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
            onCheckedChange={handlePublishToggle}
          />
          <Label htmlFor="public-toggle" className="cursor-pointer flex items-center gap-1">
            <Globe className="h-4 w-4" />
            <span>{isPublished ? "Public" : "Private"}</span>
          </Label>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={openPreviewInNewWindow}
          className="flex items-center gap-1"
        >
          <ExternalLink className="h-4 w-4" />
          <span>New Window</span>
        </Button>
        
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
