import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, 
  Building2, 
  Settings, 
  Users, 
  BarChart3, 
  Globe,
  ChevronRight,
  LogOut,
  User,
  Plus,
  ExternalLink,
  Zap,
  Shield,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Organization {
  id: string;
  name: string;
  subdomain: string | null;
  role: string;
  website_enabled: boolean;
  current_tier: string;
  member_count?: number;
}

interface RoleBasedLandingPageProps {
  userRole: 'super_admin' | 'org_admin' | 'regular_user';
  organizations: Organization[];
  isSuperAdmin: boolean;
}

const RoleBasedLandingPage: React.FC<RoleBasedLandingPageProps> = ({
  userRole,
  organizations,
  isSuperAdmin
}) => {
  const navigate = useNavigate();
  const { signOut, user } = useAuthContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Quick actions for super admins
  const superAdminActions = [
    {
      title: 'Super Admin Panel',
      description: 'Manage all organizations and system settings',
      icon: Crown,
      action: () => navigate('/dashboard?admin=true'),
      color: 'bg-red-500 hover:bg-red-600',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      title: 'System Analytics',
      description: 'View platform-wide metrics and usage',
      icon: BarChart3,
      action: () => navigate('/dashboard?admin=true&tab=analytics'),
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'All Organizations',
      description: 'Browse and manage all organizations',
      icon: Building2,
      action: () => navigate('/dashboard?admin=true&tab=organizations'),
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'User Management',
      description: 'Manage super admin roles and permissions',
      icon: Shield,
      action: () => navigate('/dashboard?admin=true&tab=user-roles'),
      color: 'bg-purple-500 hover:bg-purple-600',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  // Helper function to get the correct base URL for development vs production
  const getBaseUrl = () => {
    if (import.meta.env.DEV || window.location.hostname === 'localhost') {
      return `http://localhost:${window.location.port}`;
    }
    return 'https://church-os.com';
  };

  // Organization actions for org admins
  const getOrgActions = (org: Organization) => [
    {
      title: 'Dashboard',
      description: 'View organization overview and metrics',
      icon: BarChart3,
      action: () => {
        // In development, use local routes
        if (import.meta.env.DEV || window.location.hostname === 'localhost') {
          navigate(`/dashboard/${org.id}`);
        } else if (org.subdomain) {
          window.location.href = `https://${org.subdomain}.church-os.com/dashboard`;
        } else {
          navigate(`/dashboard/${org.id}`);
        }
      }
    },
    {
      title: 'Page Builder',
      description: 'Create and edit website pages',
      icon: Globe,
      action: () => {
        // In development, use local routes
        if (import.meta.env.DEV || window.location.hostname === 'localhost') {
          navigate(`/page-builder?organization_id=${org.id}`);
        } else if (org.subdomain) {
          window.location.href = `https://${org.subdomain}.church-os.com/page-builder`;
        } else {
          navigate(`/page-builder?organization_id=${org.id}`);
        }
      }
    },
    {
      title: 'Settings',
      description: 'Manage organization settings',
      icon: Settings,
      action: () => {
        // In development, use local routes
        if (import.meta.env.DEV || window.location.hostname === 'localhost') {
          navigate(`/dashboard/${org.id}?tab=settings`);
        } else if (org.subdomain) {
          window.location.href = `https://${org.subdomain}.church-os.com/settings`;
        } else {
          navigate(`/settings?org=${org.id}`);
        }
      }
    },
    {
      title: 'Members',
      description: 'Manage team members and roles',
      icon: Users,
      action: () => {
        // In development, use local routes
        if (import.meta.env.DEV || window.location.hostname === 'localhost') {
          navigate(`/dashboard/${org.id}?tab=members`);
        } else if (org.subdomain) {
          window.location.href = `https://${org.subdomain}.church-os.com/dashboard?tab=members`;
        } else {
          navigate(`/dashboard/${org.id}?tab=members`);
        }
      }
    }
  ];

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrganization = () => {
    navigate('/signup?step=subscription');
  };

  const handleVisitWebsite = (org: Organization) => {
    if (org.subdomain) {
      // In development, open localhost with subdomain context
      if (import.meta.env.DEV || window.location.hostname === 'localhost') {
        window.open(`http://localhost:${window.location.port}?org=${org.id}`, '_blank');
      } else {
        window.open(`https://${org.subdomain}.church-os.com`, '_blank');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome to Church-OS
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                {isSuperAdmin ? 'Super Administrator Dashboard' : 'Organization Management Hub'}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <User className="h-4 w-4 mr-1" />
                  <span>{user?.email}</span>
                </div>
                {isSuperAdmin && (
                  <Badge variant="destructive" className="text-xs">
                    Super Admin
                  </Badge>
                )}
              </div>
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="text-gray-600 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Super Admin Section */}
        {isSuperAdmin && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Crown className="h-6 w-6 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">Super Admin Tools</h2>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {superAdminActions.map((action, index) => (
                <Card 
                  key={index}
                  className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 ${action.bgColor} ${action.borderColor} border-2`}
                  onClick={action.action}
                >
                  <CardHeader className="pb-3">
                    <div className={`p-3 rounded-lg ${action.color} w-fit`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className={`text-lg ${action.textColor}`}>
                      {action.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {action.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Access Now
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {organizations.length > 0 && <Separator className="my-8" />}
          </div>
        )}

        {/* Organizations Section */}
        {organizations.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  {isSuperAdmin ? 'Your Organizations' : 'Organizations'}
                </h2>
                <Badge variant="secondary">
                  {organizations.length} {organizations.length === 1 ? 'Organization' : 'Organizations'}
                </Badge>
              </div>
              
              <Button 
                onClick={handleCreateOrganization}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Organization
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {organizations.map((org) => (
                <Card 
                  key={org.id}
                  className="hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-5 w-5 text-blue-600" />
                          <CardTitle className="text-lg">{org.name}</CardTitle>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge 
                            variant={org.role === 'admin' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {org.role === 'admin' ? 'Administrator' : 'Member'}
                          </Badge>
                          
                          {org.current_tier && (
                            <Badge variant="outline" className="text-xs">
                              {org.current_tier} Plan
                            </Badge>
                          )}
                          
                          {org.website_enabled && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                              Website Active
                            </Badge>
                          )}
                        </div>
                        
                        {org.subdomain && (
                          <div className="text-sm text-gray-500 mb-3">
                            <Globe className="h-4 w-4 inline mr-1" />
                            {org.subdomain}.church-os.com
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-2">
                      {getOrgActions(org).map((action, actionIndex) => (
                        <Button
                          key={actionIndex}
                          variant="outline"
                          size="sm"
                          onClick={action.action}
                          className="flex items-center gap-1 text-xs"
                        >
                          <action.icon className="h-3 w-3" />
                          {action.title}
                        </Button>
                      ))}
                    </div>
                    
                    {org.subdomain && org.website_enabled && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVisitWebsite(org)}
                        className="w-full mt-2 text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Visit Website
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Organizations State */}
        {organizations.length === 0 && !isSuperAdmin && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Organizations Found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You don't have access to any organizations yet. Create your first organization to get started!
            </p>
            <Button 
              onClick={handleCreateOrganization}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Organization
            </Button>
          </div>
        )}

        {/* Getting Started Section for New Users */}
        {organizations.length === 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Getting Started with Church-OS
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">1. Create Organization</h4>
                <p className="text-sm text-gray-600">
                  Set up your church or organization profile
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Globe className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">2. Build Website</h4>
                <p className="text-sm text-gray-600">
                  Create beautiful pages with our page builder
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">3. Invite Team</h4>
                <p className="text-sm text-gray-600">
                  Add team members and manage permissions
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleBasedLandingPage; 