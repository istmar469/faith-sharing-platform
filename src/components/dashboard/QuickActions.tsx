
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutTemplate, ExternalLink, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTenantContext } from '@/components/context/TenantContext';
import { useViewMode } from '@/components/context/ViewModeContext';

interface QuickActionsProps {
  organizationId: string;
  showComingSoonToast?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ organizationId, showComingSoonToast }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSubdomainAccess } = useTenantContext();
  const { viewMode } = useViewMode();

  const handleSiteBuilderOpen = () => {
    if (!organizationId) {
      console.error("QuickActions: No organization ID available for page builder");
      toast({
        title: "Error",
        description: "Organization ID is required to open the page builder",
        variant: "destructive"
      });
      return;
    }
    
    console.log("QuickActions: Opening site builder for organization:", organizationId, {
      isSubdomainAccess,
      viewMode,
      pathname: window.location.pathname
    });
    
    // Always use the organization-specific path to ensure context
    const siteBuilderUrl = `/tenant-dashboard/${organizationId}/page-builder`;
    
    console.log("QuickActions: Navigating to site builder URL:", siteBuilderUrl);
    navigate(siteBuilderUrl);
    
    toast({
      title: "Website Builder",
      description: "Opening website builder",
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Button 
          variant="outline" 
          className="justify-start"
          onClick={handleSiteBuilderOpen}
        >
          <LayoutTemplate className="h-4 w-4 mr-2" />
          <span>Website Builder</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="justify-start"
          onClick={() => navigate(`/tenant-dashboard/${organizationId}/settings/org-management`)}
        >
          <Settings className="h-4 w-4 mr-2" />
          <span>Settings</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
