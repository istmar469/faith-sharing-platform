import React, { useState, useEffect } from 'react';
import { User, LogOut, Settings, LayoutDashboard, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import LoginDialog from './LoginDialog';

interface UserSessionIndicatorProps {
  variant?: 'header' | 'floating';
  className?: string;
}

const UserSessionIndicator: React.FC<UserSessionIndicatorProps> = ({ 
  variant = 'header',
  className = ''
}) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    checkSession();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("UserSessionIndicator: Auth state changed", event, session?.user?.email);
      if (session?.user) {
        setUser(session.user);
        checkUserRole(session.user.id);
      } else {
        setUser(null);
        setUserRole(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("UserSessionIndicator: Session check", session?.user?.email || 'No session');
      
      if (session?.user) {
        setUser(session.user);
        await checkUserRole(session.user.id);
      } else {
        setUser(null);
        setUserRole(null);
      }
    } catch (error) {
      console.error("UserSessionIndicator: Session check failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserRole = async (userId: string) => {
    try {
      // Check if super admin first
      const { data: isSuperAdmin } = await supabase.rpc('direct_super_admin_check');
      if (isSuperAdmin) {
        setUserRole('super_admin');
        return;
      }

      // Check if org admin
      const { data: memberships } = await supabase
        .from('organization_members')
        .select('role, organization:organizations(name)')
        .eq('user_id', userId)
        .in('role', ['admin', 'editor']);

      if (memberships && memberships.length > 0) {
        setUserRole('org_admin');
      } else {
        setUserRole('regular_user');
      }
    } catch (error) {
      console.error("UserSessionIndicator: Role check failed", error);
      setUserRole('regular_user');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
    // Refresh page to reset any cached state
    window.location.reload();
  };

  const handleDashboardAccess = () => {
    // Always redirect to the dashboard selector for a clean UX
    // It will automatically route super admins and single-org users appropriately
    window.location.href = '/dashboard-select';
  };

  const getUserInitials = (user: any) => {
    const email = user.email || '';
    const name = user.user_metadata?.full_name || user.user_metadata?.name || '';
    
    if (name) {
      return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    
    return email.slice(0, 2).toUpperCase();
  };

  const getUserDisplayName = (user: any) => {
    return user.user_metadata?.full_name || 
           user.user_metadata?.name || 
           user.email?.split('@')[0] || 
           'User';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
      </div>
    );
  }

  // Not logged in - show login button
  if (!user) {
    return (
      <>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowLoginDialog(true)}
          className={className}
        >
          <User className="h-4 w-4 mr-2" />
          Sign In
        </Button>
        
        <LoginDialog 
          isOpen={showLoginDialog} 
          setIsOpen={setShowLoginDialog} 
        />
      </>
    );
  }

  // Logged in - show user dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`h-auto p-2 ${className}`}>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
                {getUserInitials(user)}
              </AvatarFallback>
            </Avatar>
            {variant === 'header' && (
              <>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{getUserDisplayName(user)}</span>
                  {userRole === 'super_admin' && (
                    <span className="text-xs text-blue-600">Super Admin</span>
                  )}
                  {userRole === 'org_admin' && (
                    <span className="text-xs text-green-600">Admin</span>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{getUserDisplayName(user)}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        
        <DropdownMenuSeparator />
        
        {(userRole === 'super_admin' || userRole === 'org_admin') && (
          <DropdownMenuItem onClick={handleDashboardAccess}>
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserSessionIndicator; 