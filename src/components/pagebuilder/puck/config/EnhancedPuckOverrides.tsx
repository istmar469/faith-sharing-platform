
import React from 'react';
import { 
  Church, 
  Eye, 
  Home, 
  Save, 
  X,
  ExternalLink,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface EnhancedPuckOverridesProps {
  organizationName?: string;
  organizationId?: string;
  subdomain?: string;
  pageSlug?: string;
  isPublished?: boolean;
  isSaving?: boolean;
  onSave?: () => void;
  onPublish?: () => void;
  onPreview?: () => void;
  onExit?: () => void;
  onTogglePublished?: () => void;
}

export const createEnhancedPuckOverrides = ({
  organizationName = 'Your Organization',
  organizationId,
  subdomain,
  pageSlug,
  isPublished = false,
  isSaving = false,
  onSave,
  onPublish,
  onPreview,
  onExit,
  onTogglePublished
}: EnhancedPuckOverridesProps) => ({
  // Simplified header - UI only, no functional interference
  header: ({ actions, children }: { actions: React.ReactNode; children: React.ReactNode }) => (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 shadow-lg border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Church className="h-6 w-6" />
            <div>
              <h1 className="text-lg font-bold">Page Editor</h1>
              <p className="text-blue-100 text-sm">
                {organizationName} {pageSlug && `• ${pageSlug}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge 
              variant={isPublished ? "default" : "secondary"}
              className={isPublished ? "bg-green-600" : "bg-gray-500"}
            >
              {isPublished ? "Published" : "Draft"}
            </Badge>
            {isSaving && (
              <Badge variant="outline" className="bg-white/10 border-white/30 text-white">
                Saving...
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            onClick={onSave}
            disabled={isSaving}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          
          <Button 
            onClick={onTogglePublished}
            variant="outline"
            size="sm"
            className={`border-white/30 ${
              isPublished 
                ? "bg-green-600/20 text-green-100 hover:bg-green-600/30" 
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {isPublished ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Published
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Publish
              </>
            )}
          </Button>
          
          {onPreview && (
            <Button 
              onClick={onPreview}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          )}
          
          {subdomain && isPublished && (
            <Button 
              onClick={() => window.open(`https://${subdomain}.church-os.com${pageSlug ? `/${pageSlug}` : ''}`, '_blank')}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Live
            </Button>
          )}
          
          <Button 
            onClick={onExit}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4 mr-2" />
            Exit
          </Button>
          
          <Separator orientation="vertical" className="h-6 bg-white/20" />
          
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        </div>
      </div>
    </header>
  ),

  // Simplified component list - UI only
  components: ({ children }: { children: React.ReactNode }) => (
    <div className="church-os-components">
      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <Church className="h-4 w-4 mr-2 text-blue-600" />
            Page Components
          </h3>
          <p className="text-xs text-gray-500">
            Drag components to build your page
          </p>
        </div>
        {children}
      </div>
    </div>
  ),

  // Simplified outline
  outline: ({ children }: { children: React.ReactNode }) => (
    <div className="puck-outline-panel">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Page Structure
        </h3>
        <p className="text-xs text-gray-500">
          Click items to select and edit
        </p>
      </div>
      <div className="p-2">
        {children}
      </div>
    </div>
  )
});
