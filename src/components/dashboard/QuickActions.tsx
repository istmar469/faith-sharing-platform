
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Users, 
  Calendar, 
  Settings, 
  MessageCircle,
  BarChart3,
  Edit3,
  Eye
} from 'lucide-react';

interface QuickActionsProps {
  organizationId: string | null;
  showComingSoonToast: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ 
  organizationId, 
  showComingSoonToast 
}) => {
  const navigate = useNavigate();

  const handleEditWebsite = () => {
    if (organizationId) {
      navigate('/page-builder');
    } else {
      showComingSoonToast();
    }
  };

  const handleViewWebsite = () => {
    if (organizationId) {
      // Get current subdomain from URL or construct it
      const currentHost = window.location.hostname;
      if (currentHost.includes('.')) {
        const subdomain = currentHost.split('.')[0];
        window.open(`https://${subdomain}.church-os.com`, '_blank');
      } else {
        // Fallback - this would need actual subdomain from organization data
        showComingSoonToast();
      }
    } else {
      showComingSoonToast();
    }
  };

  const actions = [
    {
      title: 'Edit Website',
      description: 'Update your church website content and design',
      icon: Edit3,
      action: handleEditWebsite,
      color: 'bg-blue-500',
      enabled: true
    },
    {
      title: 'View Website',
      description: 'Visit your public church website',
      icon: Eye,
      action: handleViewWebsite,
      color: 'bg-green-500',
      enabled: true
    },
    {
      title: 'Manage Members',
      description: 'Add and organize church members',
      icon: Users,
      action: showComingSoonToast,
      color: 'bg-purple-500',
      enabled: false
    },
    {
      title: 'Create Event',
      description: 'Schedule church events and activities',
      icon: Calendar,
      action: showComingSoonToast,
      color: 'bg-orange-500',
      enabled: false
    },
    {
      title: 'Send Message',
      description: 'Communicate with your congregation',
      icon: MessageCircle,
      action: showComingSoonToast,
      color: 'bg-pink-500',
      enabled: false
    },
    {
      title: 'View Analytics',
      description: 'Track website and engagement metrics',
      icon: BarChart3,
      action: showComingSoonToast,
      color: 'bg-indigo-500',
      enabled: false
    },
    {
      title: 'Content Library',
      description: 'Manage sermons, documents, and media',
      icon: FileText,
      action: showComingSoonToast,
      color: 'bg-teal-500',
      enabled: false
    },
    {
      title: 'Church Settings',
      description: 'Configure church information and preferences',
      icon: Settings,
      action: showComingSoonToast,
      color: 'bg-gray-500',
      enabled: false
    }
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common tasks to manage your church
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={index}
                variant={action.enabled ? "default" : "outline"}
                className={`h-auto p-4 flex flex-col items-center space-y-2 ${
                  action.enabled ? `${action.color} hover:opacity-90` : 'opacity-60'
                }`}
                onClick={action.action}
                disabled={!action.enabled && action.title !== 'Edit Website' && action.title !== 'View Website'}
              >
                <IconComponent className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold text-sm">{action.title}</div>
                  <div className="text-xs opacity-80 mt-1">{action.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
