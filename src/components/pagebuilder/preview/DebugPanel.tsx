
import React, { useState } from 'react';
import { usePageBuilder } from '../context/PageBuilderContext';
import { Button } from '@/components/ui/button';
import { Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const {
    pageId,
    organizationId,
    pageTitle,
    pageSlug,
    pageElements,
    isPublished,
    showInNavigation,
    isHomepage,
    savePage,
    isSaving
  } = usePageBuilder();
  
  const compactView = (
    <div className="bg-slate-800 text-white p-2 rounded flex items-center justify-between text-xs">
      <div className="flex gap-2 items-center">
        <Bug className="h-3 w-3" />
        <span className="font-mono">
          {pageId ? `ID: ${pageId.slice(0, 8)}...` : 'Unsaved'}
        </span>
      </div>
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-6 text-xs px-2 text-white hover:text-white hover:bg-slate-700"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
        </Button>
      </div>
    </div>
  );
  
  const expandedView = (
    <div className="bg-slate-800 text-white p-3 rounded space-y-2 text-xs">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <Bug className="h-4 w-4" />
          <span className="font-semibold">Page Builder Debug</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 text-xs px-2 text-white hover:text-white hover:bg-slate-700"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>
      
      <Separator className="bg-slate-600" />
      
      <div className="space-y-1 font-mono">
        <div className="flex justify-between">
          <span className="text-slate-400">Page ID:</span>
          <span>{pageId || 'Not saved yet'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Org ID:</span>
          <span>{organizationId || 'Not set'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Title:</span>
          <span>{pageTitle}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Slug:</span>
          <span>{pageSlug || '[auto-generated]'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Elements:</span>
          <span>{pageElements.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Published:</span>
          <span>{isPublished ? '✅' : '❌'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Navigation:</span>
          <span>{showInNavigation ? '✅' : '❌'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Homepage:</span>
          <span>{isHomepage ? '✅' : '❌'}</span>
        </div>
      </div>
      
      <Separator className="bg-slate-600" />
      
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="outline" 
          className="h-6 text-xs border-slate-600 hover:bg-slate-700"
          onClick={() => savePage()}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Page'}
        </Button>
      </div>
    </div>
  );
  
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="fixed bottom-4 right-4 z-50 w-64 shadow-lg"
    >
      <CollapsibleTrigger asChild>
        {isExpanded ? expandedView : compactView}
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        {/* Nothing here - we handle expansion differently */}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default DebugPanel;
