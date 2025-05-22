import React, { useState, useEffect } from 'react';
import { LogOut, Info, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface SuperAdminHeaderProps {
  onSignOut: () => Promise<void>; // ✅ MUST return a Promise
}

const SuperAdminHeader: React.FC<SuperAdminHeaderProps> = ({ onSignOut }) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [debugDialogOpen, setDebugDialogOpen] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        setUserEmail(data.user.email);
      }
    };
    fetchUserInfo();
  }, []);

  const handleShowDebugInfo = async () => {
    const { data, error } = await supabase.auth.getSession();
    setSessionInfo({
      hasSession: !!data.session,
      error: error ? error.message : null,
      expiresAt: data.session
        ? new Date(data.session.expires_at! * 1000).toLocaleString()
        : null,
      currentRoute: window.location.pathname,
      userAgent: navigator.userAgent,
    });
    setDebugDialogOpen(true);
  };

  const handleSignOutClick = async () => {
    try {
      await onSignOut(); // ✅ Await the Promise correctly
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
          {userEmail && (
            <p className="text-sm text-gray-500 flex items-center mt-1">
              <User className="h-3 w-3 mr-1" /> {userEmail}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShowDebugInfo}
            className="flex items-center"
          >
            <Info className="h-4 w-4 mr-1" /> Debug
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOutClick} // ✅ Calls async Promise wrapper
            className="flex items-center"
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>

      <Dialog open={debugDialogOpen} onOpenChange={setDebugDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
              Routing & Auth Debug Info
            </DialogTitle>
            <DialogDescription>
              This information might help diagnose routing or authentication issues
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            {sessionInfo && (
              <>
                <div className="p-2 bg-gray-50 rounded">
                  <p>
                    <strong>Current Route:</strong> {sessionInfo.currentRoute}
                  </p>
                  <p>
                    <strong>Has Active Session:</strong>{' '}
                    {sessionInfo.hasSession ? 'Yes' : 'No'}
                  </p>
                  {sessionInfo.expiresAt && (
                    <p>
                      <strong>Session Expires:</strong>{' '}
                      {sessionInfo.expiresAt}
                    </p>
                  )}
                  {sessionInfo.error && (
                    <p className="text-red-600">
                      <strong>Auth Error:</strong> {sessionInfo.error}
                    </p>
                  )}
                </div>
                <div className="mt-4">
                  <Button
                    onClick={handleSignOutClick}
                    variant="outline"
                    className="w-full"
                  >
                    Sign Out & Re-authenticate
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default SuperAdminHeader;
