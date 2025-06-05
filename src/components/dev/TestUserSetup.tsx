
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, User, Key } from 'lucide-react';
import { createTestAdminUser, signInTestAdmin } from '@/utils/createTestUser';
import { useToast } from '@/hooks/use-toast';

const TestUserSetup: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [testUserStatus, setTestUserStatus] = useState<'pending' | 'created' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { toast } = useToast();

  const handleCreateTestUser = async () => {
    setIsCreating(true);
    setErrorMessage('');

    try {
      const result = await createTestAdminUser();

      if (result.success) {
        setTestUserStatus('created');
        toast({
          title: "Test User Created",
          description: `Test admin user created for ${result.user?.organizationName}`,
        });
      } else {
        setTestUserStatus('error');
        setErrorMessage(result.error || 'Failed to create test user');
        toast({
          title: "Error Creating Test User",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      setTestUserStatus('error');
      setErrorMessage('Unexpected error occurred');
      toast({
        title: "Error",
        description: "Unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSignInTestUser = async () => {
    setIsSigningIn(true);

    try {
      const result = await signInTestAdmin();

      if (result.success) {
        toast({
          title: "Signed In",
          description: "Successfully signed in as Test3 admin",
        });
        // Refresh the page to update auth state
        window.location.reload();
      } else {
        toast({
          title: "Sign In Failed",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unexpected error occurred during sign in",
        variant: "destructive"
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Test3 Admin User Setup
        </CardTitle>
        <CardDescription>
          Create and manage the test organization admin user for Test3
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Test User Credentials</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <div><strong>Email:</strong> test3admin@example.com</div>
            <div><strong>Password:</strong> Test123!</div>
            <div><strong>Role:</strong> Organization Admin</div>
            <div><strong>Organization:</strong> Test3</div>
          </div>
        </div>

        {testUserStatus === 'error' && (
          <div className="bg-red-50 p-4 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900">Error</h4>
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          </div>
        )}

        {testUserStatus === 'created' && (
          <div className="bg-green-50 p-4 rounded-lg flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900">Success</h4>
              <p className="text-sm text-green-800">
                Test admin user has been created and added to Test3 organization.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleCreateTestUser}
            disabled={isCreating}
            className="w-full"
            variant={testUserStatus === 'created' ? 'secondary' : 'default'}
          >
            {isCreating ? 'Creating...' : 
             testUserStatus === 'created' ? 'Test User Created' : 'Create Test Admin User'}
          </Button>

          <Button
            onClick={handleSignInTestUser}
            disabled={isSigningIn || testUserStatus !== 'created'}
            className="w-full"
            variant="outline"
          >
            <Key className="h-4 w-4 mr-2" />
            {isSigningIn ? 'Signing In...' : 'Sign In as Test Admin'}
          </Button>
        </div>

        <div className="text-xs text-gray-500 mt-4">
          <strong>Note:</strong> This creates a real user account in Supabase Auth with organization admin privileges for Test3. 
          Use this for testing organization-level features without super admin access.
        </div>
      </CardContent>
    </Card>
  );
};

export default TestUserSetup;
