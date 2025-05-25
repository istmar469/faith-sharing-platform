
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Edit, Eye, Settings, ExternalLink } from 'lucide-react';
import { useTenantContext } from '@/components/context/TenantContext';

interface WebsiteTabContentProps {
  organizationId: string;
}

const WebsiteTabContent: React.FC<WebsiteTabContentProps> = ({ organizationId }) => {
  const { isSubdomainAccess } = useTenantContext();

  const handleOpenSiteEditor = () => {
    if (isSubdomainAccess) {
      window.open('/page-builder', '_blank');
    } else {
      window.open(`/page-builder?org=${organizationId}`, '_blank');
    }
  };

  const handlePreviewSite = () => {
    if (isSubdomainAccess) {
      window.open('/', '_blank');
    } else {
      // For main domain, we'll open the site builder in preview mode
      window.open(`/page-builder?org=${organizationId}&mode=preview`, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Website Management</h2>
        <p className="text-gray-600">Manage your organization's website and online presence.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Site Editor Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Site Editor
            </CardTitle>
            <CardDescription>
              Edit your website content, layout, and design
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleOpenSiteEditor} className="w-full">
              <Edit className="h-4 w-4 mr-2" />
              Open Site Editor
            </Button>
          </CardContent>
        </Card>

        {/* Site Preview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-600" />
              Preview Site
            </CardTitle>
            <CardDescription>
              View your website as visitors see it
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handlePreviewSite} variant="outline" className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              Preview Website
            </Button>
          </CardContent>
        </Card>

        {/* Website Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              Website Settings
            </CardTitle>
            <CardDescription>
              Configure domain, SEO, and general settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              <Settings className="h-4 w-4 mr-2" />
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common website management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleOpenSiteEditor} 
              size="sm"
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Homepage
            </Button>
            <Button 
              onClick={() => {/* Navigate to pages management */}} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              Manage Pages
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Custom Domain
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebsiteTabContent;
