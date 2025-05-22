
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { usePageBuilder } from './context/PageBuilderContext';
import { Cog, Save, Users, Info } from 'lucide-react';
import AdminManagement from '../settings/AdminManagement';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PageHeader = () => {
  const { toast } = useToast();
  const [saveError, setSaveError] = useState<string | null>(null);
  const { 
    pageTitle, 
    savePage, 
    isSaving,
    organizationId,
    pageId,
    pageElements
  } = usePageBuilder();
  
  const handleSave = async () => {
    try {
      console.log("PageHeader: Save button clicked, calling savePage function");
      setSaveError(null);
      
      // Call savePage and wait for the promise to resolve
      const result = await savePage();
      
      // Now result is properly awaited and we can check it safely
      console.log("PageHeader: Save result:", result);
      
      if (result) {
        // Toast success message
        toast({
          title: "Page saved",
          description: "Your page has been saved successfully",
        });
      } else {
        setSaveError("Save failed - no result returned");
        toast({
          title: "Error",
          description: "Could not save page. Please check console for details.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('PageHeader: Error saving page:', err);
      setSaveError(String(err));
      toast({
        title: "Error",
        description: "Could not save page. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="flex flex-col border-b">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Cog className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-lg font-medium">Page Builder</h1>
            {pageTitle && <span className="text-muted-foreground">— {pageTitle}</span>}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {organizationId && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Admins
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-[600px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Manage Organization</SheetTitle>
                  <SheetDescription>
                    Add or remove members and set their roles.
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6">
                  <AdminManagement organizationId={organizationId} />
                </div>
              </SheetContent>
            </Sheet>
          )}
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button 
            variant="default" 
            size="sm" 
            className="gap-1"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  <p>Page ID: {pageId || 'Not saved yet'}</p>
                  <p>Organization ID: {organizationId || 'Not set'}</p>
                  <p>Elements: {pageElements.length}</p>
                  {saveError && <p className="text-red-500">Last error: {saveError}</p>}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-50 px-4 py-1 text-xs text-gray-500 border-t">
          Page ID: {pageId || 'Not saved yet'} | 
          Org ID: {organizationId || 'Not set'} |
          Elements: {pageElements.length}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
