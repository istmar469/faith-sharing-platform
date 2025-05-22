
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from 'react-router-dom';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

interface AuthFormProps {
  onSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>(location.pathname === "/signup" ? "signup" : "login");
  
  const handleLoginSuccess = () => {
    console.log("Login success in AuthForm");
    if (onSuccess) {
      onSuccess();
    }
  };
  
  const handleSignupSuccess = () => {
    console.log("Signup success in AuthForm");
    if (onSuccess) {
      onSuccess();
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
