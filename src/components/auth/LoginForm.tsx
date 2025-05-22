
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from './AuthContext';

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuthContext();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { success } = await signIn(email, password);
      
      if (success) {
        setIsLoading(false);
        
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleLogin}>
      <div className="space-y-4 pt-4">
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
            <a href="#" className="text-sm text-primary hover:underline">
              Forgot password?
            </a>
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
