
import React from 'react';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageBuilderErrorStateProps {
  error: string;
  onBackToDashboard: () => void;
}

const PageBuilderErrorState: React.FC<PageBuilderErrorStateProps> = ({
  error,
  onBackToDashboard
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md p-6">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Page Builder</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={onBackToDashboard} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default PageBuilderErrorState;
