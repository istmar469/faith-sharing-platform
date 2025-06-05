
import React from 'react';
import { Button } from '@/components/ui/button';

interface PuckOverridesProps {
  organizationName?: string;
  organizationId?: string;
  subdomain?: string;
  onPreview?: () => void;
  onPublish?: () => void;
  onBackToDashboard?: () => void;
}

export const createPuckOverrides = ({
  organizationName = 'Your Church',
  organizationId,
  subdomain,
  onPreview,
  onPublish,
  onBackToDashboard
}: PuckOverridesProps) => ({
  // Minimal header override
  header: ({ actions, children }: { actions: React.ReactNode; children: React.ReactNode }) => (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold">Page Builder</h1>
          <span className="text-sm text-gray-500">{organizationName}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {onBackToDashboard && (
            <Button 
              onClick={onBackToDashboard}
              variant="outline"
              size="sm"
            >
              Back to Dashboard
            </Button>
          )}
          {actions}
        </div>
      </div>
    </header>
  )
});

export default createPuckOverrides;
