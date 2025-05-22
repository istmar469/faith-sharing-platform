
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthForm from '../auth/AuthForm';

interface AccessDeniedProps {
  onLoginClick: () => void;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ onLoginClick }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-primary-dark p-4 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Church-OS</CardTitle>
          <CardDescription>Enter your credentials to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessDenied;
