
import React from 'react';
import { Button } from '@/components/ui/button';

interface PageBuilderErrorStateProps {
  error: string;
  onBackToDashboard: () => void;
}

const PageBuilderErrorState: React.FC<PageBuilderErrorStateProps> = ({ 
  error, 
  onBackToDashboard 
}) => {
  console.error('PageBuilderErrorState: Error state', error);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={onBackToDashboard}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default PageBuilderErrorState;
