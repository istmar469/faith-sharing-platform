
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from 'react-router-dom';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

interface AuthFormProps {
  onSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const location = useLocation();
  
  return (
    <div className="flex items-center justify-center">
      <Tabs defaultValue={location.pathname === "/signup" ? "signup" : "login"} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginForm onSuccess={onSuccess} />
        </TabsContent>
        <TabsContent value="signup">
          <SignupForm onSuccess={onSuccess} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthForm;
