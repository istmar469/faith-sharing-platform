import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Calendar, FileText, Settings, Palette } from 'lucide-react';
import { useSubdomainRouter } from '@/hooks/useSubdomainRouter';

interface QuickActionsProps {
  organizationId: string | null;
  showComingSoonToast: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ organizationId, showComingSoonToast }) => {
  const { navigateWithContext } = useSubdomainRouter();

  const handleCreatePage = () => {
    if (organizationId) {
      navigateWithContext(`/page-builder?organization_id=${organizationId}`);
    } else {
      showComingSoonToast();
    }
  };

  const handleSiteBuilder = () => {
    if (organizationId) {
      navigateWithContext(`/site-builder?organization_id=${organizationId}`);
    } else {
      showComingSoonToast();
    }
  };

  const handleSettings = () => {
    if (organizationId) {
      // Navigate to organization-specific settings using the dashboard route
      navigateWithContext(`/dashboard/${organizationId}?tab=settings`);
    } else {
      showComingSoonToast();
    }
  };

  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Button onClick={handleCreatePage} className="h-auto p-4 flex flex-col gap-2">
            <Plus className="h-6 w-6" />
            <span>Create Page</span>
          </Button>
          
          <Button onClick={handleSiteBuilder} variant="outline" className="h-auto p-4 flex flex-col gap-2">
            <Palette className="h-6 w-6" />
            <span>Site Builder</span>
          </Button>
          
          <Button onClick={showComingSoonToast} variant="outline" className="h-auto p-4 flex flex-col gap-2">
            <Users className="h-6 w-6" />
            <span>Manage Members</span>
          </Button>
          
          <Button onClick={showComingSoonToast} variant="outline" className="h-auto p-4 flex flex-col gap-2">
            <Calendar className="h-6 w-6" />
            <span>Events</span>
          </Button>
          
          <Button onClick={showComingSoonToast} variant="outline" className="h-auto p-4 flex flex-col gap-2">
            <FileText className="h-6 w-6" />
            <span>Forms</span>
          </Button>
          
          <Button onClick={handleSettings} variant="outline" className="h-auto p-4 flex flex-col gap-2">
            <Settings className="h-6 w-6" />
            <span>Settings</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
