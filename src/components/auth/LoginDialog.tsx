import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users } from 'lucide-react';
import { useTenantContext } from '@/components/context/TenantContext';

interface LoginDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  defaultTab?: 'login' | 'signup';
}

const LoginDialog: React.FC<LoginDialogProps> = ({ 
  isOpen, 
  setIsOpen, 
  defaultTab = 'login' 
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [churchName, setChurchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  
  // Get tenant context to detect subdomain
  const { organizationId, organizationName, subdomain, isContextReady, isSubdomainAccess } = useTenantContext();
  const isSubdomain = isContextReady && isSubdomainAccess && Boolean(organizationId && subdomain);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setIsOpen(false);
      resetForm();
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully."
      });

      // For subdomain access, force a page reload to trigger proper role routing
      if (isSubdomain) {
        console.log('LoginDialog: Subdomain login successful, reloading page to refresh auth state');
        setTimeout(() => {
          window.location.reload();
        }, 1000); // Give time for the auth state to update
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubdomainSignup = async (email: string, password: string) => {
    console.log('LoginDialog: Subdomain signup for org:', organizationId, organizationName);
    
    // Step 1: Create the auth user with special metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          organization_signup: true,
          target_organization_id: organizationId,
          organization_name: organizationName,
          subdomain_signup: true,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user account');

    // Step 2: If user is immediately authenticated, handle organization cleanup and membership
    if (authData.session) {
      console.log('LoginDialog: User authenticated, handling organization membership...');
      
      // First, clean up any auto-created organization
      if (authData.user.user_metadata?.organization_id) {
        console.log('LoginDialog: Cleaning up auto-created organization...');
        try {
          // Remove from auto-created org
          await supabase
            .from('organization_members')
            .delete()
            .eq('user_id', authData.user.id)
            .eq('organization_id', authData.user.user_metadata.organization_id);
          
          // Delete the auto-created organization if empty
          await supabase
            .from('organizations')
            .delete()
            .eq('id', authData.user.user_metadata.organization_id);
        } catch (error) {
          console.warn('LoginDialog: Could not clean up auto-created organization:', error);
        }
      }
      
      // Add to the target organization
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: organizationId,
          user_id: authData.user.id,
          role: 'admin' // Give admin role to subdomain signups
        });

      if (memberError) {
        console.error('LoginDialog: Error adding user to organization:', memberError);
        toast({
          title: "Account Created!",
          description: "Welcome! Please contact an admin to get organization access.",
          variant: "default"
        });
      } else {
        console.log('LoginDialog: Successfully added user to organization');
        toast({
          title: `Welcome to ${organizationName}!`,
          description: "You now have access to manage this organization's website."
        });
      }
    } else {
      // Email verification required
      toast({
        title: "Verification Email Sent",
        description: `Please check your email and verify your account to join ${organizationName}.`
      });
    }

    return authData;
  };

  const handleMainDomainSignup = async (email: string, password: string, churchName: string) => {
    console.log('LoginDialog: Main domain signup - creating new organization');
    
    // Use the existing flow - let the handle_new_user trigger create the organization
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          church_name: churchName,
          create_new_organization: true,
        },
      },
    });

    if (error) throw error;

    if (data.session) {
      toast({
        title: "Account Created!",
        description: "Welcome! Let's set up your organization."
      });
    } else {
      toast({
        title: "Verification Email Sent",
        description: "Please check your email and click the verification link to complete registration."
      });
    }

    return data;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSubdomain) {
        // Subdomain signup: Add to existing organization
        await handleSubdomainSignup(email, password);
      } else {
        // Main domain signup: Create new organization (existing behavior)
        if (!churchName.trim()) {
          throw new Error('Church/Organization name is required');
        }
        await handleMainDomainSignup(email, password, churchName);
      }

      setIsOpen(false);
      resetForm();
      
    } catch (error: any) {
      console.error('LoginDialog: Signup error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setChurchName('');
    setError('');
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {activeTab === 'login' ? 'Sign In' : 'Create Account'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <TabsContent value="login" className="mt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                  Cancel
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="signup" className="mt-4">
            {/* Show context information for subdomain signups */}
            {isSubdomain && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Join {organizationName}
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  You'll be added as an admin of this organization
                </p>
              </div>
            )}
            
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Only show church name field for main domain signups */}
              {!isSubdomain && (
                <div className="space-y-2">
                  <Label htmlFor="signup-church">Church/Organization Name</Label>
                  <Input
                    id="signup-church"
                    type="text"
                    placeholder="Enter your church name"
                    value={churchName}
                    onChange={(e) => setChurchName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    isSubdomain ? `Join ${organizationName}` : 'Create Account'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                  Cancel
                </Button>
              </div>
              
              <p className="text-xs text-center text-gray-500">
                By signing up, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
