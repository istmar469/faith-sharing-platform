import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { shouldRequireEmailVerification } from '@/utils/domain';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SignupFormProps {
  onSuccess?: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [churchName, setChurchName] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("SignupForm: Attempting signup with:", { email, churchName });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            church_name: churchName,
          },
        },
      });
      
      if (error) {
        console.error("SignupForm: Signup error:", error);
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      console.log("SignupForm: Signup successful, data:", data);
      console.log("SignupForm: Session exists:", !!data.session);
      console.log("SignupForm: User exists:", !!data.user);
      console.log("SignupForm: shouldRequireEmailVerification:", shouldRequireEmailVerification());
      
      // Check if we immediately have a session (no email verification needed)
      if (data.session && data.user) {
        console.log("SignupForm: User immediately authenticated, checking for existing organizations");
        
        // Check if user already has organizations
        const { data: orgsData, error: orgsError } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', data.user.id)
          .limit(1);
        
        if (orgsError) {
          console.error("SignupForm: Error checking organizations:", orgsError);
        }
        
        const hasOrganizations = orgsData && orgsData.length > 0;
        console.log("SignupForm: User has existing organizations:", hasOrganizations);
        
        if (hasOrganizations) {
          // User already has organizations, proceed with normal flow
          toast({
            title: "Welcome Back",
            description: "Redirecting to your dashboard.",
          });
          setIsLoading(false);
          if (onSuccess) {
            onSuccess();
          }
          return;
        } else {
          // New user with no organizations - redirect to dashboard where OrganizationSelection will handle subscription flow
          console.log("SignupForm: New user with no organizations, redirecting to dashboard for organization creation");
          toast({
            title: "Account Created",
            description: "Welcome! Let's set up your organization.",
          });
          setIsLoading(false);
          
          // Navigate to dashboard where OrganizationSelection will show "Create Your Organization"
          navigate('/dashboard');
          return;
        }
      }
      
      // If no immediate session (email verification required)
      console.log("SignupForm: Email verification required");
      toast({
        title: "Verification Email Sent",
        description: "Please check your email and click the verification link to complete registration.",
      });
      setIsLoading(false);
      
    } catch (err: any) {
      console.error("SignupForm: Unexpected error:", err);
      toast({
        title: "Signup Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="church-name">Church Name</Label>
        <Input
          id="church-name"
          type="text"
          placeholder="Enter your church name"
          value={churchName}
          onChange={(e) => setChurchName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Account...
          </>
        ) : (
          "Next"
        )}
      </Button>
      <p className="text-xs text-center text-gray-500">
        By signing up, you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  );
};

export default SignupForm;
