
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

interface AuthFormProps {
  onSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>(location.pathname === "/signup" ? "signup" : "login");
  
  const handleLoginSuccess = () => {
    console.log("Login success in AuthForm");
    if (onSuccess) {
      console.log("Calling onSuccess callback from AuthForm");
      onSuccess();
    } else {
      console.log("No onSuccess callback in AuthForm, navigating to dashboard");
      navigate('/dashboard', { replace: true });
    }
  };
  
  const handleSignupSuccess = () => {
    console.log("Signup success in AuthForm");
    if (onSuccess) {
      console.log("Calling onSuccess callback from AuthForm after signup");
      onSuccess();
    } else {
      console.log("No onSuccess callback in AuthForm after signup, navigating to dashboard");
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
