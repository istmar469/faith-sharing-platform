
import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Settings, Monitor, Layers, Grid, Save, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTenantContext } from '@/components/context/TenantContext';

interface PageSideNavProps {
  isSuperAdmin?: boolean;
}

const PageSideNav: React.FC<PageSideNavProps> = ({ isSuperAdmin = false }) => {
  const navigate = useNavigate();
  const { organizationId: contextOrgId, isSubdomainAccess } = useTenantContext();
  const { organizationId: paramOrgId } = useParams();
  const [searchParams] = useSearchParams();
  
  // Use the organization ID from URL params, search params, or context
  const orgId = paramOrgId || searchParams.get('org') || contextOrgId;

  const handleBackClick = () => {
    // If we're a super admin and not on subdomain, return to the super admin dashboard
    if (isSuperAdmin && !isSubdomainAccess) {
      navigate('/dashboard?admin=true');
    }
    // If accessing via subdomain, navigate directly to dashboard
    else if (isSubdomainAccess) {
      navigate('/');
    }
    // If we have an organization ID, return to the organization dashboard
    else if (orgId) {
      navigate(`/dashboard/${orgId}`);
    } 
    // Fallback to main dashboard
    else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="w-16 bg-primary text-gray-100 flex flex-col items-center py-4 border-r border-primary-dark">
      <TooltipProvider>
        <div className="flex flex-col items-center gap-6 h-full">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-100 hover:bg-primary-dark rounded-full"
                onClick={handleBackClick}
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to Dashboard</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Back to {isSuperAdmin && !isSubdomainAccess ? 'Super Admin' : 'Tenant'} Dashboard
            </TooltipContent>
          </Tooltip>

          <div className="flex-1 flex flex-col items-center gap-4 mt-6">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-100 hover:bg-primary-dark rounded-full"
                >
                  <Layers className="h-5 w-5" />
                  <span className="sr-only">Layers</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Layers</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-100 hover:bg-primary-dark rounded-full"
                >
                  <Grid className="h-5 w-5" />
                  <span className="sr-only">Components</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Components</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-100 hover:bg-primary-dark rounded-full"
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </div>

          <div className="mt-auto flex flex-col items-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-100 hover:bg-primary-dark rounded-full"
                >
                  <Monitor className="h-5 w-5" />
                  <span className="sr-only">Preview</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Preview</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-100 hover:bg-primary-dark rounded-full"
                >
                  <Globe className="h-5 w-5" />
                  <span className="sr-only">Publish</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Publish</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-100 hover:bg-primary-dark rounded-full bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-5 w-5" />
                  <span className="sr-only">Save</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Save</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default PageSideNav;
