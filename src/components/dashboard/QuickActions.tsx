
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutTemplate, FileText, PlusCircle, ExternalLink } from 'lucide-react';
import { useRedirectLogic } from './hooks/useRedirectLogic';

interface QuickActionsProps {
  organizationId: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ organizationId }) => {
  const navigate = useNavigate();
  const { openSiteBuilder } = useRedirectLogic();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Button 
          variant="outline" 
          className="justify-start"
          onClick={() => openSiteBuilder(organizationId)}
        >
          <LayoutTemplate className="h-4 w-4 mr-2" />
          <span>Edit Website</span>
          <ExternalLink className="h-3 w-3 ml-1 opacity-70" />
        </Button>
        <Button 
          variant="outline" 
          className="justify-start"
          onClick={() => navigate(`/tenant-dashboard/${organizationId}/page-builder`)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          <span>Create New Page</span>
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
