
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

interface FloatingLoginButtonProps {
  onShowLogin: () => void;
}

const FloatingLoginButton: React.FC<FloatingLoginButtonProps> = ({ onShowLogin }) => {
  return (
    <div className="fixed top-4 right-4 z-50">
      <Button 
        onClick={onShowLogin}
        variant="outline"
        size="sm"
        className="bg-white/95 backdrop-blur-sm border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
      >
        <LogIn className="mr-2 h-4 w-4" />
        Staff Login
      </Button>
    </div>
  );
};

export default FloatingLoginButton;
