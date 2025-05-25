
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Users, Globe, BarChart3 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

type OrganizationOverviewProps = {
  organizationId: string;
};

const OrganizationOverview: React.FC<OrganizationOverviewProps> = ({
  organizationId
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const showComingSoonToast = () => {
    toast({
      title: "Coming Soon",
      description: "This feature is under development",
    });
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>Basic information about this organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Organization ID</p>
            <p className="text-sm text-muted-foreground">{organizationId}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Status</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={showComingSoonToast}>
            Edit Details
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for this organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button className="w-full justify-start" onClick={() => navigate('/page-builder')}>
            <Globe className="h-4 w-4 mr-2" /> Edit Website
          </Button>
          <Button className="w-full justify-start" variant="outline" onClick={showComingSoonToast}>
            <Users className="h-4 w-4 mr-2" /> Manage Members
          </Button>
          <Button className="w-full justify-start" variant="outline" onClick={showComingSoonToast}>
            <Building className="h-4 w-4 mr-2" /> Organization Settings
          </Button>
          <Button className="w-full justify-start" variant="outline" onClick={showComingSoonToast}>
            <BarChart3 className="h-4 w-4 mr-2" /> View Analytics
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Website Status</CardTitle>
          <CardDescription>Current website configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Status</span>
              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                Active
              </span>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Organization</p>
              <p className="text-sm text-muted-foreground">
                {organizationId}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={showComingSoonToast}>
            Manage Website
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrganizationOverview;
