
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Settings, Layout, Users, Calendar, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Create New Page',
      description: 'Build a new page with our page builder',
      icon: FileText,
      onClick: () => navigate('/page-builder'),
      color: 'bg-blue-500'
    },
    {
      title: 'Site Builder',
      description: 'Configure your site theme and layout',
      icon: Layout,
      onClick: () => navigate('/site-builder'),
      color: 'bg-purple-500'
    },
    {
      title: 'Manage Pages',
      description: 'View and organize all your pages',
      icon: Settings,
      onClick: () => navigate('/pages'),
      color: 'bg-green-500'
    },
    {
      title: 'Templates',
      description: 'Browse and use page templates',
      icon: FileText,
      onClick: () => navigate('/templates'),
      color: 'bg-orange-500'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Get started with common tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start space-y-2"
                onClick={action.onClick}
              >
                <div className={`p-2 rounded-md ${action.color} text-white`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
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
