
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RedirectScreenProps {
  onRedirect: () => void;
}

const RedirectScreen: React.FC<RedirectScreenProps> = ({ onRedirect }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md p-6">
        <h2 className="text-2xl font-bold mb-4">Redirecting to your dashboard</h2>
        <p className="mb-6">You're logged in as a regular user. Redirecting to your organization dashboard.</p>
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <div className="mt-4">
          <Button 
            onClick={onRedirect}
            className="w-full"
          >
            Continue to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RedirectScreen;
