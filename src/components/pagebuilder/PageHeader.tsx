
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTenantContext } from '@/components/context/TenantContext';

interface PageHeaderProps {
  pageName: string;
  onSave: () => void;
  onPublish: () => void;
  isDirty: boolean;
  isPublished: boolean;
  saving: boolean;
  publishing: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  pageName,
  onSave,
  onPublish,
  isDirty,
  isPublished,
  saving,
  publishing
}) => {
  const navigate = useNavigate();
  const { organizationId } = useParams<{ organizationId: string }>();
  const { isSubdomainAccess } = useTenantContext();
  
  const handleBackToDashboard = () => {
    // Different behavior based on access type
    if (isSubdomainAccess) {
      // For subdomain access, go to root
      window.location.href = '/';
    } else if (organizationId) {
      // For regular access with org ID in URL
      navigate(`/tenant-dashboard/${organizationId}`);
    } else {
      // Fallback to previous page
      navigate(-1);
    }
  };
  
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          {!isSubdomainAccess && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2"
              onClick={handleBackToDashboard}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
          )}
          <h1 className="text-lg font-semibold">{pageName || "Untitled Page"}</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onSave} 
            disabled={!isDirty || saving}
            className="text-sm"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={onPublish} 
            disabled={(!isDirty && isPublished) || publishing}
            className="text-sm"
          >
            {publishing ? "Publishing..." : isPublished ? "Published" : "Publish"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
