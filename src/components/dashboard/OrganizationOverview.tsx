
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Users, Globe, BarChart3 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { OrganizationData } from './types';

type OrganizationOverviewProps = {
  organization: OrganizationData;
  handleWebsiteToggle: () => Promise<void>;
};

const OrganizationOverview: React.FC<OrganizationOverviewProps> = ({
  organization,
  handleWebsiteToggle
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
            <p className="text-sm font-medium">Name</p>
            <p className="text-sm text-muted-foreground">{organization.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Slug</p>
            <p className="text-sm text-muted-foreground">{organization.slug}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Subdomain</p>
            <p className="text-sm text-muted-foreground">
              {organization.subdomain ? `${organization.subdomain}.church-os.com` : 'Not set'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Custom Domain</p>
            <p className="text-sm text-muted-foreground">
              {organization.custom_domain || 'Not set'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Description</p>
            <p className="text-sm text-muted-foreground">
              {organization.description || 'No description provided'}
            </p>
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
              <span className={`px-2 py-1 text-xs rounded-full ${
                organization.website_enabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {organization.website_enabled ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Domain</p>
              <p className="text-sm text-muted-foreground">
                {organization.subdomain 
                  ? `${organization.subdomain}.church-os.com` 
                  : 'No domain configured'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Custom Domain</p>
              <p className="text-sm text-muted-foreground">
                {organization.custom_domain || 'None'}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant={organization.website_enabled ? "outline" : "default"} 
            className="w-full"
            onClick={handleWebsiteToggle}
          >
            {organization.website_enabled ? 'Disable Website' : 'Enable Website'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrganizationOverview;
