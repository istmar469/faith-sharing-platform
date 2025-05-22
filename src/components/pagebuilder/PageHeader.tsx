
import React from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { usePageBuilder } from './context/PageBuilderContext';
import { Cog, Save, Users } from 'lucide-react';
import AdminManagement from '../settings/AdminManagement';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const PageHeader = () => {
  const { toast } = useToast();
  const { 
    pageTitle, 
    savePage, 
    isSaving,
    organizationId,
  } = usePageBuilder();
  
  const handleSave = async () => {
    try {
      console.log("Save button clicked, calling savePage function");
      
      // Call savePage and wait for the promise to resolve
      const result = await savePage();
      
      // Now result is properly awaited and we can check it safely
      console.log("Save result:", result);
      
      // Toast success message
      toast({
        title: "Page saved",
        description: "Your page has been saved successfully",
      });
    } catch (err) {
      console.error('Error saving page:', err);
      toast({
        title: "Error",
        description: "Could not save page. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="flex items-center justify-between p-4 border-b">
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
      </div>
    </div>
  );
};

export default PageHeader;
