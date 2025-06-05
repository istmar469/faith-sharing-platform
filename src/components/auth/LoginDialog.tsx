import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

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
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            church_name: churchName,
          },
        },
      });

      if (error) throw error;

      if (data.session) {
        // User is immediately authenticated (no email verification needed)
        setIsOpen(false);
        resetForm();
        toast({
          title: "Account Created!",
          description: "Welcome! Let's set up your organization."
        });
      } else {
        // Email verification required
        setIsOpen(false);
        resetForm();
        toast({
          title: "Verification Email Sent",
          description: "Please check your email and click the verification link to complete registration."
        });
      }
    } catch (error: any) {
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
            <form onSubmit={handleSignup} className="space-y-4">
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
                    'Create Account'
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
