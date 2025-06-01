import React from 'react';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarFooter } from '@/components/ui/sidebar';
import { useAuthContext } from '@/components/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const DashboardSidebarFooter: React.FC = () => {
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log('SidebarFooter: Logging out user');
      await signOut();
      navigate('/', { replace: true });
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <SidebarFooter className="p-4 border-t">
      {/* User Profile Section */}
      {user && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.email}
              </p>
              <p className="text-xs text-gray-500">User Account</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full text-gray-700 hover:text-red-600 hover:border-red-300"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      )}

      {/* Support Links */}
      <div className="space-y-2">
        <a 
          href="https://churchos.freshdesk.com/support/home" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Support
        </a>
        <a 
          href="https://status.churchos.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Status
        </a>
      </div>
    </SidebarFooter>
  );
};

export default DashboardSidebarFooter;
