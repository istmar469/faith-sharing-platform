import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from './AuthContext';

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
  const { signIn } = useAuthContext();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('LoginForm: handleLogin called with:', { email, password: '***' });
    setIsLoading(true);
    setError(""); // Clear any previous errors
    
    try {
      console.log('LoginForm: Calling signIn...');
      const { success, error: authError } = await signIn(email, password);
      console.log('LoginForm: signIn result:', success);
      
      if (success) {
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
        console.log('LoginForm: Sign in failed, error:', authError);
        setIsLoading(false);
        
        // Show inline error if it's an invalid credentials error
        if (authError?.errorType === 'INVALID_CREDENTIALS') {
          setError("Invalid email or password. Please check your credentials and try again.");
        } else if (authError?.userMessage) {
          setError(authError.userMessage);
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
          ) : "Next"}
        </Button>
      </div>
    </form>
  );
}

export default LoginForm;
