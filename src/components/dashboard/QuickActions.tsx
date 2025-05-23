
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutTemplate, FileText, PlusCircle, ExternalLink } from 'lucide-react';
import { useRedirectLogic } from './hooks/useRedirectLogic';
import { useToast } from '@/hooks/use-toast';
import { useTenantContext } from '@/components/context/TenantContext';

interface QuickActionsProps {
  organizationId: string;
  showComingSoonToast?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ organizationId, showComingSoonToast }) => {
  const navigate = useNavigate();
  const { openSiteBuilder } = useRedirectLogic();
  const { toast } = useToast();
  const { isSubdomainAccess } = useTenantContext();

  const handleSiteBuilderOpen = () => {
    const siteBuilderUrl = `/tenant-dashboard/${organizationId}/page-builder`;
    // Always open in new tab
    window.open(siteBuilderUrl, '_blank', 'noopener,noreferrer');
    
    toast({
      title: "Site Builder",
      description: "Opening site builder in a new window",
    });
  };
  
  const handleCreateNewPage = () => {
    // For consistency, also open new page creation in new window
    const newPageUrl = `/tenant-dashboard/${organizationId}/page-builder`;
    window.open(newPageUrl, '_blank', 'noopener,noreferrer');
    
    toast({
      title: "Create New Page",
      description: "Opening page builder in a new window",
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
          <span>Edit Website</span>
          <ExternalLink className="h-3 w-3 ml-1 opacity-70" />
        </Button>
        <Button 
          variant="outline" 
          className="justify-start"
          onClick={handleCreateNewPage}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          <span>Create New Page</span>
          <ExternalLink className="h-3 w-3 ml-1 opacity-70" />
        </Button>
        <Button 
          variant="outline" 
          className="justify-start"
          onClick={() => navigate(`/tenant-dashboard/${organizationId}/pages`)}
        >
          <FileText className="h-4 w-4 mr-2" />
          <span>Manage Pages</span>
        </Button>
        <Button 
          variant="outline" 
          className="justify-start"
          onClick={() => navigate(`/tenant-dashboard/${organizationId}/templates`)}
        >
          <LayoutTemplate className="h-4 w-4 mr-2" />
          <span>Templates</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
