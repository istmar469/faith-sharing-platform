
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User, LogOut, Settings, Save, Globe, GlobeLock, X, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface TranslucentAdminBarProps {
  title: string;
  published: boolean;
  saving: boolean;
  onTitleChange: (title: string) => void;
  onPublishToggle: () => void;
  onSave: () => void;
  onHide: () => void;
}

const TranslucentAdminBar: React.FC<TranslucentAdminBarProps> = ({
  title,
  published,
  saving,
  onTitleChange,
  onPublishToggle,
  onSave,
  onHide
}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  const handlePreview = () => {
    // Open current page in new tab for preview
    const currentUrl = window.location.href.replace('/page-builder', '');
    window.open(currentUrl, '_blank');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section - Title and Status */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Page title"
            className="bg-white/70 border-gray-300/50 backdrop-blur-sm max-w-64"
          />
          
          {published ? (
            <Badge className="bg-green-100/80 text-green-800 border-green-300/50 backdrop-blur-sm">
              <Globe className="h-3 w-3 mr-1" />
              Published
            </Badge>
          ) : (
            <Badge variant="outline" className="border-gray-300/50 bg-white/70 backdrop-blur-sm">
              <GlobeLock className="h-3 w-3 mr-1" />
              Draft
            </Badge>
          )}

          {saving && (
            <Badge className="bg-blue-100/80 text-blue-800 border-blue-300/50 backdrop-blur-sm">
              <div className="h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-1" />
              Saving...
            </Badge>
          )}
        </div>

        {/* Right Section - Actions and User */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePreview}
            className="bg-white/70 border-gray-300/50 backdrop-blur-sm hover:bg-white/90"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>

          <Button 
            variant="outline" 
            onClick={onSave}
            disabled={saving}
            size="sm"
            className="bg-white/70 border-gray-300/50 backdrop-blur-sm hover:bg-white/90"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
          
          <Button 
            onClick={onPublishToggle} 
            disabled={saving}
            size="sm"
            className={published 
              ? "bg-orange-600/90 hover:bg-orange-700/90 text-white backdrop-blur-sm" 
              : "bg-green-600/90 hover:bg-green-700/90 text-white backdrop-blur-sm"
            }
          >
            {published ? 'Unpublish' : 'Publish'}
          </Button>

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-white/70 border-gray-300/50 backdrop-blur-sm hover:bg-white/90">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white/95 backdrop-blur-md border-gray-200/50">
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/login')}
              className="bg-white/70 border-gray-300/50 backdrop-blur-sm hover:bg-white/90"
            >
              Login
            </Button>
          )}

          <Button 
            variant="ghost" 
            size="sm"
            onClick={onHide}
            className="bg-white/70 border-gray-300/50 backdrop-blur-sm hover:bg-white/90"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TranslucentAdminBar;
