
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, EyeIcon, Loader2 } from 'lucide-react';
import { usePageBuilder } from './context/PageBuilderContext';

const PageHeader: React.FC = () => {
  const { pageTitle, setPageTitle, savePage, isSaving } = usePageBuilder();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const handleSave = async () => {
    await savePage();
  };
  
  const handlePreview = () => {
    // For now, just show a preview in a new tab (placeholder)
    // In a real implementation, this would use actual page rendering logic
    window.open(`/preview?title=${encodeURIComponent(pageTitle)}`, '_blank');
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
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <EyeIcon className="h-4 w-4 mr-1" /> Preview
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" /> Save
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
