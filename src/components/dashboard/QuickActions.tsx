import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Settings, Video, MessageCircle, 
  Calendar, DollarSign, Bookmark, FileText, Layout, 
  PlusCircle, Headphones, Globe, FileEdit
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTenantContext } from '@/components/context/TenantContext';

interface QuickActionsProps {
  showComingSoonToast: () => void;
  organizationId?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ 
  showComingSoonToast,
  organizationId 
}) => {
  const navigate = useNavigate();
  const { isSubdomainAccess, subdomain } = useTenantContext();
  
  const handlePageBuilder = () => {
    if (organizationId) {
      // Open in new window if accessed via subdomain
      if (isSubdomainAccess && subdomain) {
        window.open(`/page-builder`, '_blank');
      } else {
        navigate(`/tenant-dashboard/${organizationId}/page-builder`);
      }
    } else {
      showComingSoonToast();
    }
  };
  
  const handleCreateNewPage = () => {
    if (organizationId) {
      // Open in new window if accessed via subdomain
      if (isSubdomainAccess && subdomain) {
        window.open(`/page-builder`, '_blank');
      } else {
        navigate(`/tenant-dashboard/${organizationId}/page-builder`);
      }
    } else {
      showComingSoonToast();
    }
  };
  
  const handleTemplates = () => {
    if (organizationId) {
      // Open in new window if accessed via subdomain
      if (isSubdomainAccess && subdomain) {
        window.open(`/templates`, '_blank');
      } else {
        navigate(`/tenant-dashboard/${organizationId}/templates`);
      }
    } else {
      showComingSoonToast();
    }
  };
  
  const handleAllPages = () => {
    if (organizationId) {
      // Open in new window if accessed via subdomain
      if (isSubdomainAccess && subdomain) {
        window.open(`/pages`, '_blank');
      } else {
        navigate(`/tenant-dashboard/${organizationId}/pages`);
      }
    } else {
      showComingSoonToast();
    }
  };
  
  const handlePreview = () => {
    if (organizationId) {
      window.open(`/preview-domain/${organizationId}`, '_blank');
    } else {
      showComingSoonToast();
    }
  };
  
  // Log context information
  React.useEffect(() => {
    console.log("QuickActions: Current context:", {
      isSubdomainAccess,
      subdomain,
      organizationId
    });
  }, [isSubdomainAccess, subdomain, organizationId]);
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Globe className="h-5 w-5 mr-2 text-blue-500" />
              Website
            </CardTitle>
            <CardDescription>Manage your church's website</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Website Builder</span>
                <Badge variant="outline" className="bg-blue-50">Core</Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button 
              variant="default" 
              className="w-full justify-start" 
              onClick={handlePageBuilder}
            >
              <Layout className="mr-2 h-4 w-4" />
              Page Builder
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={handleTemplates}
            >
              <FileEdit className="mr-2 h-4 w-4" />
              Templates
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handlePreview}
            >
              <Globe className="mr-2 h-4 w-4" />
              Preview Site
            </Button>
          </CardFooter>
        </Card>
        
        {/* Pages Management Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <FileText className="h-5 w-5 mr-2 text-indigo-500" />
              Pages
            </CardTitle>
            <CardDescription>Manage your website pages</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Page Management</span>
                <Badge variant="outline" className="bg-indigo-50">Essential</Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button 
              variant="default" 
              className="w-full justify-start bg-indigo-600 hover:bg-indigo-700"
              onClick={handleCreateNewPage}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Page
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleAllPages}
            >
              <FileText className="mr-2 h-4 w-4" />
              All Pages
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Video className="h-5 w-5 mr-2 text-orange-500" />
              Live Streaming
            </CardTitle>
            <CardDescription>Connect with your community in real-time</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Streaming Setup</span>
                <Badge variant="outline" className="bg-orange-50">Engage</Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button variant="default" className="w-full justify-start" onClick={showComingSoonToast}>
              <Video className="mr-2 h-4 w-4" />
              Start Streaming
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={showComingSoonToast}>
              <Settings className="mr-2 h-4 w-4" />
              Configure Stream
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-green-500" />
              Communication
            </CardTitle>
            <CardDescription>Stay connected with your members</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Messaging Tools</span>
                <Badge variant="outline" className="bg-green-50">Engage</Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button variant="default" className="w-full justify-start" onClick={showComingSoonToast}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Send Message
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={showComingSoonToast}>
              <Settings className="mr-2 h-4 w-4" />
              Manage Contacts
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-red-500" />
              Events
            </CardTitle>
            <CardDescription>Organize and share your events</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Event Management</span>
                <Badge variant="outline" className="bg-red-50">Engage</Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button variant="default" className="w-full justify-start" onClick={showComingSoonToast}>
              <Calendar className="mr-2 h-4 w-4" />
              Create Event
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={showComingSoonToast}>
              <Settings className="mr-2 h-4 w-4" />
              View Calendar
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-teal-500" />
              Donations
            </CardTitle>
            <CardDescription>Collect offerings and donations online</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Online Giving</span>
                <Badge variant="outline" className="bg-teal-50">Support</Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button variant="default" className="w-full justify-start" onClick={showComingSoonToast}>
              <DollarSign className="mr-2 h-4 w-4" />
              Collect Donation
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={showComingSoonToast}>
              <Settings className="mr-2 h-4 w-4" />
              Manage Funds
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Bookmark className="h-5 w-5 mr-2 text-purple-500" />
              Sermons
            </CardTitle>
            <CardDescription>Share your teachings and messages</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Sermon Archive</span>
                <Badge variant="outline" className="bg-purple-50">Engage</Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button variant="default" className="w-full justify-start" onClick={showComingSoonToast}>
              <Bookmark className="mr-2 h-4 w-4" />
              Add Sermon
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={showComingSoonToast}>
              <Settings className="mr-2 h-4 w-4" />
              Browse Sermons
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Headphones className="h-5 w-5 mr-2 text-sky-500" />
              Podcast
            </CardTitle>
            <CardDescription>Reach a wider audience with your audio content</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Podcast Hosting</span>
                <Badge variant="outline" className="bg-sky-50">Engage</Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button variant="default" className="w-full justify-start" onClick={showComingSoonToast}>
              <Headphones className="mr-2 h-4 w-4" />
              Start Podcast
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={showComingSoonToast}>
              <Settings className="mr-2 h-4 w-4" />
              Manage Episodes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default QuickActions;
