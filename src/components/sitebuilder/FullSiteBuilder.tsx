
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Globe, Settings, Users, BarChart3, Plus } from 'lucide-react';

interface FullSiteBuilderProps {
  organizationId?: string | null;
}

const FullSiteBuilder: React.FC<FullSiteBuilderProps> = ({ organizationId }) => {
  console.log('FullSiteBuilder: Received organizationId:', organizationId);

  if (!organizationId) {
    return (
      <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <Settings className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <CardTitle className="text-xl font-semibold">No Organization Selected</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600">
              Please select an organization to continue with the site builder.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Site Builder</h1>
          <p className="text-gray-600">Build and customize your organization's website</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Edit className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Edit Pages</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">Create and edit website pages with our visual editor</p>
              <Button className="mt-4 w-full" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Pages
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Globe className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Site Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">Configure domain, SEO, and general site settings</p>
              <Button className="mt-4 w-full" variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Team Access</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">Manage who can edit and publish content</p>
              <Button className="mt-4 w-full" variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Manage Team
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Analytics</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">View website traffic and performance metrics</p>
              <Button className="mt-4 w-full" variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Stats
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Pages */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Recent Pages</CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Page
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No pages created yet</p>
              <p className="text-sm">Get started by creating your first page</p>
              <Button className="mt-4" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FullSiteBuilder;
