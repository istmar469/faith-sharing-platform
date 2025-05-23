
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PageData } from '../context/types';

interface DebugPanelProps {
  organizationId?: string | null;
  pageData?: PageData | null;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ organizationId, pageData }) => {
  const [expanded, setExpanded] = useState(false);

  if (!organizationId && !pageData) return null;

  return (
    <div className="border-t bg-gray-50 text-xs">
      <div className="p-2 flex justify-between items-center">
        <span className="font-semibold">Debug Info</span>
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Hide Details' : 'Show Details'}
        </Button>
      </div>
      
      {expanded && (
        <div className="p-2 overflow-auto max-h-64">
          <div className="mb-2">
            <div className="font-semibold">Organization ID:</div>
            <div className="font-mono bg-gray-100 p-1 rounded">{organizationId || 'None'}</div>
          </div>
          
          {pageData && (
            <>
              <div className="mb-2">
                <div className="font-semibold">Page ID:</div>
                <div className="font-mono bg-gray-100 p-1 rounded">{pageData.id || 'New Page (Unsaved)'}</div>
              </div>
              
              <div className="mb-2">
                <div className="font-semibold">Page Title:</div>
                <div className="font-mono bg-gray-100 p-1 rounded">{pageData.title}</div>
              </div>
              
              <div className="mb-2">
                <div className="font-semibold">Blocks Count:</div>
                <div className="font-mono bg-gray-100 p-1 rounded">{pageData.content?.blocks?.length || 0}</div>
              </div>

              <div className="mb-2">
                <div className="font-semibold">Published:</div>
                <div className="font-mono bg-gray-100 p-1 rounded">{pageData.published ? 'Yes' : 'No'}</div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
