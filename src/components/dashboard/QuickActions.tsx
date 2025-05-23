
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutTemplate, ExternalLink, Settings } from 'lucide-react';
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
      title: "Website Builder",
      description: "Opening website builder in a new window",
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
          <ExternalLink className="h-3 w-3 ml-1 opacity-70" />
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
