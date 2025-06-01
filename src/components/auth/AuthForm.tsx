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
  
  useEffect(() => {
    if (!isContextReady) return;
    
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        if (!onSuccess) {
          if (isSubdomainAccess) {
            navigate('/dashboard', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }
      }
    };
    
    checkSession();
  }, [navigate, isSubdomainAccess, isContextReady, onSuccess]);
  
  const handleAuthSuccess = () => {
    console.log('AuthForm: handleAuthSuccess called, onSuccess available:', !!onSuccess);
    if (onSuccess) {
      console.log('AuthForm: Calling provided onSuccess callback');
      onSuccess();
    } else {
      console.log('AuthForm: No onSuccess callback, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
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
          <LoginForm onSuccess={handleAuthSuccess} />
        </TabsContent>
        <TabsContent value="signup">
          <SignupForm onSuccess={handleAuthSuccess} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthForm;
