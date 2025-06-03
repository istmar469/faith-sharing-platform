import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Try to use AuthContext, but have fallback
  let authContext;
  try {
    authContext = useAuthContext();
  } catch (error) {
    console.warn('LoginForm: AuthContext not available, using direct Supabase authentication');
    authContext = null;
  }
  
  // Fallback direct authentication function
  const directSignIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      });
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Direct sign in error:', error);
      
      let errorMessage = "Please check your credentials and try again";
      let errorTitle = "Sign in failed";
      
      if (error.message?.toLowerCase().includes('invalid login credentials')) {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
        errorTitle = "Invalid credentials";
      } else if (error.message?.toLowerCase().includes('email not confirmed')) {
        errorMessage = "Please check your email and click the confirmation link before signing in.";
        errorTitle = "Email not confirmed";
      } else if (error.message?.toLowerCase().includes('too many requests')) {
        errorMessage = "Too many login attempts. Please wait a few minutes before trying again.";
        errorTitle = "Rate limited";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      
      return { 
        success: false, 
        error: {
          ...error,
          userMessage: errorMessage,
          errorType: error.message?.toLowerCase().includes('invalid login credentials') ? 'INVALID_CREDENTIALS' : 'OTHER'
        }
      };
    }
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('LoginForm: handleLogin called with:', { 
      email, 
      password: '***',
      hasAuthContext: !!authContext,
      currentUrl: window.location.href
    });
    setIsLoading(true);
    setError(""); // Clear any previous errors
    
    try {
      let result;
      
      if (authContext) {
        console.log('LoginForm: Using AuthContext signIn...');
        result = await authContext.signIn(email, password);
      } else {
        console.log('LoginForm: Using direct Supabase signIn...');
        result = await directSignIn(email, password);
      }
      
      console.log('LoginForm: signIn result:', result.success);
      
      if (result.success) {
        console.log('LoginForm: Sign in successful, calling onSuccess or navigating');
        setIsLoading(false);
        
        if (onSuccess) {
          console.log('LoginForm: Calling onSuccess callback');
          onSuccess();
        } else {
          console.log('LoginForm: Navigating to dashboard');
          navigate('/dashboard', { replace: true });
        }
      } else {
        console.log('LoginForm: Sign in failed, error:', result.error);
        setIsLoading(false);
        
        // Show inline error if it's an invalid credentials error
        if (result.error?.errorType === 'INVALID_CREDENTIALS') {
          setError("Invalid email or password. Please check your credentials and try again.");
        } else if (result.error?.userMessage) {
          setError(result.error.userMessage);
        } else {
          setError("Sign in failed. Please try again.");
        }
      }
    } catch (error) {
      console.error('LoginForm: Unexpected login error:', error);
      setIsLoading(false);
      setError("An unexpected error occurred. Please try again.");
    }
  };
  
  return (
    <form onSubmit={handleLogin}>
      <div className="space-y-4 pt-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="church@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link 
              to="/forgot-password" 
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input 
            id="password" 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            disabled={isLoading}
          />
        </div>
      </div>
      <div className="flex flex-col mt-4">
        <Button type="submit" className="w-full bg-primary hover:bg-primary-dark" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : "Login"}
        </Button>
      </div>
    </form>
  );
}

export default LoginForm;
