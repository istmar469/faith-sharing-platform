
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast"; // Fixed import path
import { usePageBuilder } from './context/PageBuilderContext';
import { Cog, Save, Users, Info, Check, AlertCircle, RefreshCw } from 'lucide-react';
import AdminManagement from '../settings/AdminManagement';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const { 
    pageTitle, 
    savePage, 
    isSaving,
    organizationId,
    pageId,
    pageElements
  } = usePageBuilder();
  
  // Reset save status after success
  useEffect(() => {
    let timer: number;
    if (saveStatus === 'success') {
      timer = window.setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
    
    return () => {
      window.clearTimeout(timer);
    };
  }, [saveStatus]);
  
  const handleSave = async () => {
    try {
      console.log("PageHeader: Save button clicked, calling savePage function");
      setSaveError(null);
      setSaveStatus('saving');
      
      // Call savePage and wait for the promise to resolve
      const result = await savePage();
      
      // Now result is properly awaited and we can check it safely
      console.log("PageHeader: Save result:", result);
      
      if (result) {
        // Toast success message
        setSaveStatus('success');
        toast({
          title: "Page saved",
          description: "Your page has been saved successfully",
        });
        
        // If there's a pageId now but the URL doesn't contain it, update the URL
        if (result.id && !window.location.pathname.includes(result.id)) {
          navigate(`/page-builder/${result.id}?organization_id=${result.organization_id}`, { replace: true });
        }
      } else {
        setSaveStatus('error');
        setSaveError("Save failed - no result returned");
        toast({
          title: "Error",
          description: "Could not save page. Please check console for details.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('PageHeader: Error saving page:', err);
      setSaveStatus('error');
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
            variant={saveStatus === 'success' ? "outline" : "default"} 
            size="sm" 
            className={`gap-1 ${saveStatus === 'success' ? 'text-green-600 border-green-200 bg-green-50 hover:bg-green-100' : ''}`}
            onClick={handleSave}
            disabled={isSaving || saveStatus === 'saving'}
          >
            {saveStatus === 'idle' && <Save className="h-4 w-4" />}
            {saveStatus === 'saving' && <RefreshCw className="h-4 w-4 animate-spin" />}
            {saveStatus === 'success' && <Check className="h-4 w-4" />}
            {saveStatus === 'error' && <AlertCircle className="h-4 w-4" />}
            {saveStatus === 'idle' && 'Save'}
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'success' && 'Saved!'}
            {saveStatus === 'error' && 'Try Again'}
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
