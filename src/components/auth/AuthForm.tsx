
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useNavigate } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { supabase } from '@/integrations/supabase/client';

interface AuthFormProps {
  onSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSubdomainAccess, isContextReady } = useTenantContext();
  const [activeTab, setActiveTab] = useState<string>(location.pathname === "/signup" ? "signup" : "login");
  
  // Check if user is already logged in
  useEffect(() => {
    if (!isContextReady) return;
    
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        console.log("User already logged in, redirecting", { isSubdomainAccess });
        
        if (isSubdomainAccess) {
          // For subdomain, redirect to subdomain dashboard
          navigate('/dashboard', { replace: true });
        } else {
          // For main domain, use DashboardRedirect logic
          navigate('/dashboard', { replace: true });
        }
      }
    };
    
    checkSession();
  }, [navigate, isSubdomainAccess, isContextReady]);
  
  const handleLoginSuccess = () => {
    console.log("Login success in AuthForm", { isSubdomainAccess });
    
    if (onSuccess) {
      console.log("Calling onSuccess callback from AuthForm");
      onSuccess();
    } else {
      console.log("No onSuccess callback, determining redirect destination");
      
      if (isSubdomainAccess) {
        // For subdomain, redirect to subdomain dashboard
        console.log("Redirecting to subdomain dashboard");
        navigate('/dashboard', { replace: true });
      } else {
        // For main domain, use DashboardRedirect logic
        console.log("Redirecting to main domain dashboard redirect");
        navigate('/dashboard', { replace: true });
      }
    }
  };
  
  const handleSignupSuccess = () => {
    console.log("Signup success in AuthForm", { isSubdomainAccess });
    
    if (onSuccess) {
      console.log("Calling onSuccess callback from AuthForm after signup");
      onSuccess();
    } else {
      console.log("No onSuccess callback after signup, determining redirect destination");
      
      if (isSubdomainAccess) {
        // For subdomain, redirect to subdomain dashboard
        console.log("Redirecting to subdomain dashboard after signup");
        navigate('/dashboard', { replace: true });
      } else {
        // For main domain, use DashboardRedirect logic
        console.log("Redirecting to main domain dashboard redirect after signup");
        navigate('/dashboard', { replace: true });
      }
    }
  };
  
  return (
    <div className="flex items-center justify-center">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginForm onSuccess={handleLoginSuccess} />
        </TabsContent>
        <TabsContent value="signup">
          <SignupForm onSuccess={handleSignupSuccess} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthForm;
