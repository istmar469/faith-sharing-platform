
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

interface DashboardErrorStateProps {
  type: 'access-denied' | 'not-found';
  title: string;
  description: string;
}

const DashboardErrorState: React.FC<DashboardErrorStateProps> = ({
  type,
  title,
  description
}) => {
  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="text-center max-w-md p-6">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="mb-4 text-gray-600">{description}</p>
        <Button onClick={() => window.location.href = '/'}>
          <Home className="mr-2 h-4 w-4" />
          Go Home
        </Button>
      </div>
    </div>
  );
};

export default DashboardErrorState;
